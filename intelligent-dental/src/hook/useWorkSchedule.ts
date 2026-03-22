"use client";

import { useEffect, useState } from "react";

export type WorkSchedule = {
  id: string;
  date: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  start_time: string;
  end_time: string;
  is_active: boolean;

  staff?: {
    id: string;
    name: string;
    role: string;
  };
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  total_pages?: number;
};

export function useWorkSchedule() {
  const [data, setData] = useState<WorkSchedule[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ===============================
  // 🔹 GET LIST
  // ===============================
  const fetchSchedules = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/work_schedules?page=${page}&limit=${limit}`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();

      setData(json.data);
      setMeta(json.meta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔹 CREATE
  // ===============================
  const createSchedule = async (payload: {
    staff_id: number;
    date: WorkSchedule["date"];
    start_time: string;
    end_time: string;
  }) => {
    try {
      const res = await fetch("/api/work_schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Create failed");

      await fetchSchedules(); // refresh
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ===============================
  // 🔹 UPDATE
  // ===============================
  const updateSchedule = async (
    id: number,
    payload: {
      date: WorkSchedule["date"];
      start_time: string;
      end_time: string;
      is_active: boolean;
    }
  ) => {
    try {
      const res = await fetch(`/api/work_schedules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      await fetchSchedules();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ===============================
  // 🔹 DELETE
  // ===============================
  const deleteSchedule = async (id: number) => {
    try {
      const res = await fetch(`/api/work_schedules/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchSchedules();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ===============================
  // 🔹 LOAD ครั้งแรก + เปลี่ยน page
  // ===============================
  useEffect(() => {
    fetchSchedules();
  }, [page, limit]);

  return {
    data,
    meta,
    loading,
    error,

    // pagination
    page,
    limit,
    setPage,
    setLimit,

    // actions
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}