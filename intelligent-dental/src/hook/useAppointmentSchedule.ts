import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { message } from "antd";
import { withAuthHeaders } from "@/app/utils/auth.client";
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

const appointmentDateFormat = "YYYY-MM-DD";
const storageKey = "userAppointments";

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
  const [newAppointmentDentist, setNewAppointmentDentist] = useState("");
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
    (key: "service" | "dentist") => {
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

  const createAppointmentId = useCallback(
    (dateValue: Dayjs) => {
      const dateKey = dateValue.format("YYYYMMDD");
      const existing = appointments
        .filter((item) => item.id.startsWith(`AP-${dateKey}-`))
        .map((item) => Number(item.id.split("-").pop()))
        .filter((value) => Number.isFinite(value));
      const nextNumber = String(
        (existing.length ? Math.max(...existing) : 0) + 1,
      ).padStart(3, "0");
      return `AP-${dateKey}-${nextNumber}`;
    },
    [appointments],
  );

  const resetNewAppointment = useCallback((dateValue: Dayjs) => {
    setNewAppointmentDate(dateValue);
    setNewAppointmentTime(null);
    setNewAppointmentService("");
    setNewAppointmentDentist("");
  }, []);

  const handleAddAppointment = useCallback(() => {
    if (!newAppointmentDate || !newAppointmentTime) return;
    if (!newAppointmentService.trim() || !newAppointmentDentist.trim()) {
      message.error("Please complete all required fields.");
      return;
    }

    if (isPastDate(newAppointmentDate)) {
      message.error("Please select a future date.");
      return;
    }

    const newAppointment: Appointment = {
      id: createAppointmentId(newAppointmentDate),
      date: newAppointmentDate.format("YYYY-MM-DD"),
      time: newAppointmentTime.format("HH:mm"),
      dentist: newAppointmentDentist.trim(),
      service: newAppointmentService.trim(),
      status: Status.Scheduled,
    };

    const stored = readStoredAppointments();
    writeStoredAppointments([...stored, newAppointment]);
    setAppointments((prev) => [...prev, newAppointment]);
    setSelectedDate(newAppointmentDate);
    setViewMonth(newAppointmentDate);
    message.success("Appointment added successfully.");
    setIsCreateOpen(false);
    resetNewAppointment(newAppointmentDate);
  }, [
    createAppointmentId,
    isPastDate,
    newAppointmentDate,
    newAppointmentDentist,
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
    newAppointmentDentist,
    setNewAppointmentDentist,
    selectedDate,
    setSelectedDate,
    viewMonth,
    setViewMonth,
    statusFilter,
    setStatusFilter,
    appointmentsByDate,
    selectedDateAppointments,
    upcomingAppointments,
    nextAppointment,
    summary,
    summaryTotal,
    uniqueOptions,
    isPastDate,
    resetNewAppointment,
    handleAddAppointment,
    getSortedAppointmentsForDate,
  };
}
