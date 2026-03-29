import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { type Datum, Status } from "@/mock/mockAppointment";

import { withAuthHeaders } from "@/app/utils/auth.client";

type StatusFilter = "all" | Status;
type ApiErrorShape = { error?: { message?: string }; message?: string };

type AppointmentCreateInput = {
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  type: string;
};

type AppointmentUpdateInput = {
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: Status;
  staff_id: number;
  inspection_record_id?: number;
  medical_record_id?: number;

};

const readErrorMessage = (json: unknown, fallback: string) => {
  const payload = json as ApiErrorShape | null;
  return payload?.error?.message || payload?.message || fallback;
};

const toUpdateAppointmentTime = (dateValue: string, timeValue: string) => {
  const trimmed = timeValue.trim();
  if (trimmed.includes("T")) return trimmed;
  const composed = dayjs(`${dateValue}T${trimmed}`);
  if (composed.isValid()) {
    return composed.toISOString();
  }
  return timeValue;
};

export function useAppointments() {
  const [appointments, setAppointments] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);

  const isMountedRef = useRef(true);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);


      const res = await fetch("/api/appointments?limit=200", {
        cache: "no-store",
        headers: await withAuthHeaders(),

      });

      const json = (await res.json()) as { data?: Datum[] } | ApiErrorShape;

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please log in again.");
        }
        throw new Error(readErrorMessage(json, "fetch failed"));
      }

      if (isMountedRef.current) {
        setAppointments((json as { data?: Datum[] }).data ?? []);
      }
    } catch (err) {
      console.error(err);
      if (isMountedRef.current) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load appointments.";
        setError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const getAppointmentById = useCallback(async (appointmentId: number) => {
    try {
      setError(null);


      const res = await fetch(`/api/appointments/${appointmentId}`, {
        headers: withAuthHeaders(),
      });

      const json = (await res.json()) as { data?: Datum } | ApiErrorShape;

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please log in again.");
        }
        throw new Error(readErrorMessage(json, "fetch failed"));
      }

      if (isMountedRef.current && "data" in json && json.data) {
        setAppointments((prev) => {
          const exists = prev.some(
            (item) => item.appointment_id === json.data!.appointment_id,
          );
          if (!exists) return [json.data!, ...prev];
          return prev.map((item) =>
            item.appointment_id === json.data!.appointment_id
              ? json.data!
              : item,
          );
        });
      }

      return "data" in json ? json.data ?? null : null;
    } catch (err) {
      console.error(err);
      if (isMountedRef.current) {
        const message =
          err instanceof Error ? err.message : "Unable to load appointment.";
        setError(message);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void fetchAppointments();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchAppointments]);

  const statusSummary = useMemo(() => {
    return appointments.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      {
        [Status.Scheduled]: 0,
        [Status.Completed]: 0,
        [Status.Cancelled]: 0,
        [Status.RequestCancel]: 0,
      } as Record<Status, number>,
    );
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return appointments.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;
      const matchesDate = dateFilter
        ? dayjs(item.appointment_date).isSame(dateFilter, "day")
        : true;

      if (!normalizedSearch) return matchesStatus && matchesDate;

      const matchesSearch = [
        item.appointment_id,
        item.appointment_date,
        item.appointment_time,
        item.staff?.name,
        item.patient?.name,
        item.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  const createAppointment = useCallback(
    async (payload: AppointmentCreateInput) => {
      try {
        setError(null);


        const normalizedPayload: AppointmentCreateInput = {
          ...payload,
          appointment_time: toUpdateAppointmentTime(
            payload.appointment_date,
            payload.appointment_time,
          ),
        };

        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: withAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(normalizedPayload),
        });

        const json = (await res.json()) as { data?: Datum } | ApiErrorShape;

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Please log in again.");
          }
          throw new Error(readErrorMessage(json, "create failed"));
        }

        if (isMountedRef.current && "data" in json && json.data) {
          setAppointments((prev) => [json.data!, ...prev]);
        }

        return "data" in json ? json.data ?? null : null;
      } catch (err) {
        console.error(err);
        if (isMountedRef.current) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to create appointment.";
          setError(message);
        }
        return null;
      }
    },
    [],
  );

  const updateAppointment = useCallback(
    async (appointmentId: number, payload: AppointmentUpdateInput) => {
      try {
        setError(null);

        if (!Number.isFinite(payload.staff_id) || payload.staff_id <= 0) {
          throw new Error("Staff id is required.");
        }

        const normalizedPayload: AppointmentUpdateInput = {
          ...payload,
          appointment_time: toUpdateAppointmentTime(
            payload.appointment_date,
            payload.appointment_time,
          ),
        };

        const res = await fetch(`/api/appointments/${appointmentId}`, {
          method: "PUT",
          headers: withAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(normalizedPayload),
        });

        const json = (await res.json()) as { data?: Datum } | ApiErrorShape;

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Please log in again.");
          }
          throw new Error(readErrorMessage(json, "update failed"));
        }

        if (isMountedRef.current && "data" in json && json.data) {
          setAppointments((prev) => {
            const exists = prev.some(
              (item) => item.appointment_id === json.data!.appointment_id,
            );
            if (!exists) return [json.data!, ...prev];
            return prev.map((item) =>
              item.appointment_id === json.data!.appointment_id
                ? json.data!
                : item,
            );
          });
        }

        return "data" in json ? json.data ?? null : null;
      } catch (err) {
        console.error(err);
        if (isMountedRef.current) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to update appointment.";
          setError(message);
        }
        return null;
      }
    },
    [],
  );

  const deleteAppointment = useCallback(async (appointmentId: number) => {
    try {
      setError(null);

      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: withAuthHeaders(),
      });

      if (!res.ok) {
        const json = (await res.json()) as ApiErrorShape;
        if (res.status === 401) {
          throw new Error("Please log in again.");
        }
        throw new Error(readErrorMessage(json, "delete failed"));
      }

      if (isMountedRef.current) {
        setAppointments((prev) =>
          prev.filter((item) => item.appointment_id !== appointmentId),
        );
      }

      return true;
    } catch (err) {
      console.error(err);
      if (isMountedRef.current) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to delete appointment.";
        setError(message);
      }
      return false;
    }
  }, []);

  const requestCancel = useCallback(
    async (appointmentId: number) => {
      const target = appointments.find(
        (item) => item.appointment_id === appointmentId,
      );

      if (!target) {
        if (isMountedRef.current) {
          setError("Appointment not found.");
        }
        return false;
      }

      const payload: AppointmentUpdateInput = {
        appointment_date: target.appointment_date,
        appointment_time: toUpdateAppointmentTime(
          target.appointment_date,
          target.appointment_time,
        ),
        type: target.type,
        status: Status.RequestCancel,
        staff_id: target.staff?.id ?? 0,
      };

      if (!payload.staff_id) {
        if (isMountedRef.current) {
          setError("Staff id is required.");
        }
        return false;
      }

      const result = await updateAppointment(appointmentId, payload);
      return Boolean(result);
    },
    [appointments, updateAppointment],
  );

  return {
    appointments,
    filteredAppointments,
    statusSummary,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    refresh: fetchAppointments,
    requestCancel,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
}
