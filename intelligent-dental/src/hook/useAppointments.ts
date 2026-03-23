import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { type Datum, Status } from "@/mock/mockAppointment";
import { getAuthToken, withAuthHeaders } from "@/app/utils/auth.client";

type StatusFilter = "all" | Status;

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

      const token = getAuthToken();
      if (!token) {
        if (isMountedRef.current) {
          setAppointments([]);
          setError("Please log in to view appointments.");
          setLoading(false);
        }
        return;
      }

      const res = await fetch("/api/appointments?limit=200", {
        cache: "no-store",
        headers: withAuthHeaders(),
      });

      const json = (await res.json()) as
        | { data?: Datum[] }
        | { error?: { message?: string } }
        | { message?: string };

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please log in again.");
        }
        const message =
          (json as { error?: { message?: string } })?.error?.message ||
          (json as { message?: string })?.message ||
          "fetch failed";
        throw new Error(message);
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
        item.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  const requestCancel = useCallback((appointmentId: number) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.appointment_id === appointmentId
          ? { ...item, status: Status.RequestCancel }
          : item,
      ),
    );
  }, []);

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
  };
}
