import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { message } from "antd";
import { getAuthToken, withAuthHeaders } from "@/app/utils/auth.client";
import type { AppointmentResponseDTO } from "@/dtos/appointment.dto";
import { Status } from "@/mock/mockAppointmentById";

type Appointment = {
  id: string;
  date: string;
  time: string;
  service: string;
  dentist: string;
  status: Status;
};

type ApiListResponse<T> = {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

type ApiErrorShape = { error?: { message?: string }; message?: string };
type AvailableSlotsResponse = {
  available_slots: { time: string; available_dentist_ids: number[] }[];
};

const appointmentDateFormat = "YYYY-MM-DD";
const storageKey = "userAppointments";

const getPatientId = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("patient_id");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const readErrorMessage = (json: unknown, fallback: string) => {
  const payload = json as ApiErrorShape | null;
  return payload?.error?.message || payload?.message || fallback;
};

const toAppointmentId = (item: AppointmentResponseDTO) => {
  const dateKey = dayjs(item.appointment_date).format("YYYYMMDD");
  const seq = String(item.appointment_id).padStart(3, "0");
  return `AP-${dateKey}-${seq}`;
};

const mapToAppointment = (item: AppointmentResponseDTO): Appointment => ({
  id: toAppointmentId(item),
  date: dayjs(item.appointment_date).format(appointmentDateFormat),
  time: item.appointment_time,
  service: item.type,
  dentist: item.staff?.name ?? "Unknown",
  status: (() => {
    switch (item.status) {
      case "scheduled":
        return Status.Scheduled;
      case "completed":
        return Status.Completed;
      case "request_cancel":
        return Status.RequestCancel;
      case "cancelled":
        return Status.Cancelled;
      default:
        return Status.Scheduled;
    }
  })(),
});

const mergeAppointments = (base: Appointment[], extra: Appointment[]) => {
  const map = new Map<string, Appointment>();
  base.forEach((item) => map.set(item.id, item));
  extra.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};

const readStoredAppointments = (): Appointment[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Appointment[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item?.date && item?.time);
  } catch {
    return [];
  }
};

const writeStoredAppointments = (items: Appointment[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(items));
};

const sortAppointmentsByTime = (items: Appointment[]) => {
  return [...items].sort((a, b) => a.time.localeCompare(b.time));
};

const getAppointmentDateTimeValue = (item: Appointment) =>
  dayjs(`${item.date}T${item.time}`).valueOf();

const filterAppointmentsByStatus = (
  items: Appointment[],
  statusFilter: Status | "all",
) => {
  if (statusFilter === "all") return items;
  return items.filter((item) => item.status === statusFilter);
};

export function useAppointmentSchedule() {
  const isMountedRef = useRef(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Dayjs | null>(
    dayjs(),
  );
  const [newAppointmentTime, setNewAppointmentTime] = useState<Dayjs | null>(
    null,
  );
  const [newAppointmentService, setNewAppointmentService] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMonth, setViewMonth] = useState<Dayjs>(dayjs());
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const fetchAppointments = useCallback(async () => {
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await fetch("/api/appointments?limit=200", {
        cache: "no-store",
        headers: withAuthHeaders(),
      });
      const result = (await response.json()) as ApiListResponse<
        AppointmentResponseDTO
      >;
      if (!response.ok) {
        const errorMessage =
          (result as { error?: { message?: string } })?.error?.message ||
          (result as { message?: string })?.message ||
          "Failed to load appointments.";
        throw new Error(errorMessage);
      }
      const apiAppointments = (result.data ?? []).map(mapToAppointment);
      const stored = readStoredAppointments();
      if (isMountedRef.current) {
        setAppointments(mergeAppointments(apiAppointments, stored));
      }
    } catch (err) {
      const messageValue =
        err instanceof Error ? err.message : "Failed to load appointments.";
      if (isMountedRef.current) {
        setError(messageValue);
      }
      const stored = readStoredAppointments();
      if (stored.length) {
        if (isMountedRef.current) {
          setAppointments((prev) => mergeAppointments(prev, stored));
        }
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

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, item) => {
      acc[item.date] ??= [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [appointments]);

  const selectedDateKey = selectedDate.format(appointmentDateFormat);
  const selectedDateAppointments = useMemo(() => {
    const items = appointmentsByDate[selectedDateKey] ?? [];
    const filtered = filterAppointmentsByStatus(items, statusFilter);
    return sortAppointmentsByTime(filtered);
  }, [appointmentsByDate, selectedDateKey, statusFilter]);

  const upcomingAppointments = useMemo(() => {
    const nowValue = dayjs().valueOf();
    return appointments
      .filter((item) => item.status === Status.Scheduled)
      .map((item) => ({ item, timeValue: getAppointmentDateTimeValue(item) }))
      .filter(({ timeValue }) => timeValue >= nowValue)
      .sort((a, b) => a.timeValue - b.timeValue)
      .map(({ item }) => item);
  }, [appointments]);

  const nextAppointment = upcomingAppointments[0];

  const uniqueOptions = useCallback(
    (key: "service") => {
      const values = new Set(
        appointments.map((item) => item[key]).filter(Boolean),
      );
      return Array.from(values).map((value) => ({ label: value, value }));
    },
    [appointments],
  );

  const isPastDate = useCallback(
    (value: Dayjs) => value.isBefore(dayjs(), "day"),
    [],
  );

  const resetNewAppointment = useCallback((dateValue: Dayjs) => {
    setNewAppointmentDate(dateValue);
    setNewAppointmentTime(null);
    setNewAppointmentService("");
  }, []);

  const fetchAvailableSlots = useCallback(async (dateValue: Dayjs) => {
    try {
      setLoadingSlots(true);
      const response = await fetch(
        `/api/appointments/available-slots?date=${dateValue.format("YYYY-MM-DD")}`,
        {
          cache: "no-store",
          headers: withAuthHeaders(),
        },
      );

      const result = (await response.json()) as
        | { data?: AvailableSlotsResponse }
        | ApiErrorShape;

      if (!response.ok) {
        const errorMessage = readErrorMessage(
          result,
          "Unable to load available slots.",
        );
        throw new Error(errorMessage);
      }

      const slots = "data" in result ? result.data?.available_slots ?? [] : [];
      setAvailableSlots(
        slots
          .map((slot) => slot.time.slice(0, 5))
          .filter((time) => time && time !== "Invalid"),
      );
    } catch (err) {
      const messageValue =
        err instanceof Error ? err.message : "Unable to load available slots.";
      if (isMountedRef.current) {
        setError(messageValue);
      }
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (!newAppointmentDate) {
      setAvailableSlots([]);
      return;
    }

    if (isPastDate(newAppointmentDate)) {
      setAvailableSlots([]);
      setNewAppointmentTime(null);
      return;
    }

    setNewAppointmentTime(null);
    void fetchAvailableSlots(newAppointmentDate);
  }, [fetchAvailableSlots, isPastDate, newAppointmentDate]);

  const createAppointment = useCallback(
    async (input: {
      date: Dayjs;
      time: Dayjs;
      service: string;
    }) => {
      if (!input.service.trim()) {
        message.error("Please complete all required fields.");
        return null;
      }

      if (isPastDate(input.date)) {
        message.error("Please select a future date.");
        return null;
      }

      const token = getAuthToken();
      if (!token) {
        message.error("Please log in to create appointments.");
        return null;
      }

      const patientId = getPatientId();
      if (!patientId) {
        message.error("Patient id is required.");
        return null;
      }

      try {
        const payload = {
          patient_id: patientId,
          appointment_date: input.date.format("YYYY-MM-DD"),
          appointment_time: input.time.format("HH:mm"),
          type: input.service.trim(),
        };

        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: withAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(payload),
        });

        const result = (await response.json()) as
          | { data?: AppointmentResponseDTO }
          | ApiErrorShape;

        if (!response.ok) {
          const errorMessage = readErrorMessage(
            result,
            "Unable to create appointment.",
          );
          throw new Error(errorMessage);
        }

        const created =
          "data" in result && result.data
            ? mapToAppointment(result.data)
            : null;

        if (created && isMountedRef.current) {
          setAppointments((prev) => mergeAppointments(prev, [created]));
          message.success("Appointment added successfully.");
        }

        return created;
      } catch (err) {
        const messageValue =
          err instanceof Error ? err.message : "Unable to create appointment.";
        if (isMountedRef.current) {
          setError(messageValue);
        }
        message.error(messageValue);
        return null;
      }
    },
    [isPastDate],
  );

  const handleAddAppointment = useCallback(async () => {
    if (!newAppointmentDate || !newAppointmentTime) return;

    const created = await createAppointment({
      date: newAppointmentDate,
      time: newAppointmentTime,
      service: newAppointmentService,
    });

    if (!created) return;

    setSelectedDate(newAppointmentDate);
    setViewMonth(newAppointmentDate);
    setIsCreateOpen(false);
    resetNewAppointment(newAppointmentDate);
  }, [
    createAppointment,
    newAppointmentDate,
    newAppointmentService,
    newAppointmentTime,
    resetNewAppointment,
  ]);

  const summary = useMemo(() => {
    const viewKey = viewMonth.format("YYYY-MM");

    return appointments
      .filter((item) => item.date.startsWith(viewKey))
      .reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        {
          [Status.Scheduled]: 0,
          [Status.Completed]: 0,
          [Status.Cancelled]: 0,
          [Status.RequestCancel]: 0,
        } satisfies Record<Status, number>,
      );
  }, [viewMonth, appointments]);

  const summaryTotal =
    summary[Status.Scheduled] +
    summary[Status.Completed] +
    summary[Status.Cancelled] +
    summary[Status.RequestCancel];

  const getSortedAppointmentsForDate = useCallback(
    (value: Dayjs) => {
      const items = appointmentsByDate[value.format(appointmentDateFormat)] ?? [];
      return sortAppointmentsByTime(items);
    },
    [appointmentsByDate],
  );

  return {
    appointments,
    loading,
    error,
    isCreateOpen,
    setIsCreateOpen,
    newAppointmentDate,
    setNewAppointmentDate,
    newAppointmentTime,
    setNewAppointmentTime,
    newAppointmentService,
    setNewAppointmentService,
    selectedDate,
    setSelectedDate,
    viewMonth,
    setViewMonth,
    statusFilter,
    setStatusFilter,
    availableSlots,
    loadingSlots,
    appointmentsByDate,
    selectedDateAppointments,
    upcomingAppointments,
    nextAppointment,
    summary,
    summaryTotal,
    uniqueOptions,
    isPastDate,
    resetNewAppointment,
    createAppointment,
    handleAddAppointment,
    getSortedAppointmentsForDate,
  };
}
