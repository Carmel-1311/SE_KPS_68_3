import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { type Datum, Status } from "@/mock/mockAppointment";
import { withAuthHeaders } from "@/app/utils/auth.client";

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

      const res = await fetch("/api/appointments?limit=200", {
        cache: "no-store",
        headers: await withAuthHeaders({}),
      });

      if (!res.ok) throw new Error("fetch failed");

      const json: { data: Datum[] } = await res.json();

      if (isMountedRef.current) {
        setAppointments(json.data ?? []);
      }
    } catch (err) {
      console.error(err);
      if (isMountedRef.current) {
        setError("ไม่สามารถโหลดข้อมูลนัดหมายได้");
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
        item.patient?.name,
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
