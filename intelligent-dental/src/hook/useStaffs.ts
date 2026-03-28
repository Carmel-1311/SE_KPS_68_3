"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthToken, withAuthHeaders } from "@/app/utils/auth.client";

export type StaffListItem = {
  id: number;
  name: string;
  email?: string;
  role: string;
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

export function useStaffs() {
  const [data, setData] = useState<StaffListItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchStaffs = useCallback(async () => {
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
          setError("Please log in to view staffs.");
          setLoading(false);
        }
        return;
      }

      const res = await fetch("/api/staffs?page=1&limit=200", {
        cache: "no-store",
        headers: withAuthHeaders(),
      });

      const json = (await res.json()) as { data?: StaffListItem[]; meta?: Meta } | ApiErrorShape;

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please log in again.");
        }
        throw new Error(readErrorMessage(json, "Failed to fetch staffs."));
      }

      if (isMountedRef.current) {
        setData(("data" in json && json.data) ? json.data : []);
        setMeta(("meta" in json && json.meta) ? json.meta : null);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Unable to load staffs.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void fetchStaffs();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchStaffs]);

  return {
    data,
    meta,
    loading,
    error,
    fetchStaffs,
  };
}
