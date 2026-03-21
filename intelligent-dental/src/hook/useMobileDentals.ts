"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import type { components } from "@/types/api";


export type MobileDental = components["schemas"]["mobile_dental"];

export type MobileDentalStatus = MobileDental["status"];


export function useMobileDentals(initialPage = 1, initialLimit = 10) {
  const [data, setData] = useState<MobileDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const abortRef = useRef<AbortController | null>(null);
  const isFirstLoad = useRef(true);

  const fetchData = useCallback(async (currentPage: number, currentLimit: number) => {

    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    if (isFirstLoad.current) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }

    setError(null);

    try {

      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
      });
      const url = `/api/mobile_dentals?${searchParams.toString()}`;

      const res = await fetch(url, {
        cache: "no-store",
        headers: withAuthHeaders(),
        signal: controller.signal,
      });

      if (!res.ok) {
        
        let errMessage = "โหลดข้อมูลไม่สำเร็จ";
        try {
          const errJson = await res.json();
          if (errJson.error?.message) {
            errMessage = errJson.error.message;
          }
        } catch {
       
        }
        throw new Error(errMessage);
      }

      const json = await res.json();


      if (abortRef.current === controller) {
        setData(json.data ?? []);
        setTotal(json.meta?.total ?? 0);
      }

    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      const message =
        err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ";


      if (abortRef.current === controller) {
        setError(message);
      }

    } finally {

      if (abortRef.current === controller) {
        setLoading(false);
        setIsFetching(false);
        isFirstLoad.current = false;
      }
    }
  }, []);

  useEffect(() => {
    fetchData(page, limit);

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData, page, limit]);

  const handleSetLimit = useCallback((newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  return {
    data,
    total,
    page,
    setPage,
    limit,
    setLimit: handleSetLimit,
    loading,
    isFetching,
    error,
    refresh: () => fetchData(page, limit),
  };
}
