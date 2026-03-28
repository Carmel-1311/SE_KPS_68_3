"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthToken, withAuthHeaders } from "@/app/utils/auth.client";

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

type ApiErrorShape = {
  error?: { message?: string };
  message?: string;
};

const readErrorMessage = (json: unknown, fallback: string) => {
  const payload = json as ApiErrorShape | null;
  return payload?.error?.message || payload?.message || fallback;
};

export function useWorkSchedule() {
  const [data, setData] = useState<WorkSchedule[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(200);

  const fetchSchedules = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const token = getAuthToken();
      if (!token) {
        if (isMountedRef.current) {
          setData([]);
          setMeta(null);
          setError("Please log in to view work schedules.");
          setLoading(false);
        }
        return;
      }

      const res = await fetch(`/api/work_schedules?page=${page}&limit=${limit}`, {
        cache: "no-store",
        headers: withAuthHeaders(),
      });

      const json = (await res.json()) as { data?: WorkSchedule[]; meta?: Meta } | ApiErrorShape;

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please log in again.");
        }
        throw new Error(readErrorMessage(json, "Failed to fetch work schedules."));
      }

      if (isMountedRef.current) {
        setData(("data" in json && json.data) ? json.data : []);
        setMeta(("meta" in json && json.meta) ? json.meta : null);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Unable to load work schedules.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [limit, page]);

  const createSchedule = async (payload: {
    staff_id: number;
    date: WorkSchedule["date"];
    start_time: string;
    end_time: string;
    is_active?: boolean;
  }) => {
    try {
      const res = await fetch("/api/work_schedules", {
        method: "POST",
        headers: withAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Create failed");

      await fetchSchedules();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Create failed";
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  };

  const updateSchedule = async (
    id: number,
    payload: {
      date: WorkSchedule["date"];
      start_time: string;
      end_time: string;
      is_active: boolean;
    },
  ) => {
    try {
      const res = await fetch(`/api/work_schedules/${id}`, {
        method: "PUT",
        headers: withAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      await fetchSchedules();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Update failed";
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  };

  const deleteSchedule = async (id: number) => {
    try {
      const res = await fetch(`/api/work_schedules/${id}`, {
        method: "DELETE",
        headers: withAuthHeaders(),
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchSchedules();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void fetchSchedules();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchSchedules]);

  return {
    data,
    meta,
    loading,
    error,
    page,
    limit,
    setPage,
    setLimit,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
