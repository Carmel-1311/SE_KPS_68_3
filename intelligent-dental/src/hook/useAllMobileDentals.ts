"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { withAuthHeaders } from "@/app/utils/auth.client";
import type { MobileDental } from "./useMobileDentals";

// NOTE:
// `MobileDental` type is intentionally imported from `useMobileDentals.ts`,
// which remains the canonical type source for this feature.

const PAGE_SIZE = 10;
const CONCURRENCY = 4;
const MAX_PAGES = 300;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 นาที

// --- Global Cache (Shared State ข้ามหน้าจอ ป้องกันการโหลดซ้ำตอนสลับ Tab) ---
let globalCache: MobileDental[] | null = null;
let globalCacheTime: number = 0;
let globalCacheToken: string | null = null;
let globalCacheTruncated: boolean = false;

export function clearMobileDentalsCache() {
  globalCache = null;
  globalCacheTime = 0;
  globalCacheToken = null;
  globalCacheTruncated = false;
}

export type UseAllMobileDentalsResult = {
  data: MobileDental[];
  total: number;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  progress: { loadedPages: number; totalPages: number };
  isTruncated: boolean;
  refresh: () => Promise<void>;
  updateLocalItem: (id: number, updates: Partial<MobileDental>) => void;
};

async function fetchPage(page: number, signal?: AbortSignal) {
  const url = new URL("/api/mobile_dentals", window.location.origin);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", PAGE_SIZE.toString());

  const res = await fetch(url.toString(), {
    headers: withAuthHeaders(),
    signal,
  });

  if (!res.ok) {
    let errMessage = `ดึงข้อมูลหน้าที่ ${page} ไม่สำเร็จ`;
    try {
      const errJson = await res.json();
      if (errJson.error?.message) errMessage = errJson.error.message;
    } catch {}
    throw new Error(errMessage);
  }

  const json = await res.json();
  return {
    data: (json.data || []) as MobileDental[],
    total: json.meta?.total || 0,
  };
}

export function useAllMobileDentals(): UseAllMobileDentalsResult {
  const [data, setData] = useState<MobileDental[]>(globalCache || []);
  const [total, setTotal] = useState(globalCache ? globalCache.length : 0);
  const [loading, setLoading] = useState(!globalCache);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ loadedPages: 0, totalPages: 0 });
  const [isTruncated, setIsTruncated] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const updateLocalItem = useCallback((id: number, updates: Partial<MobileDental>) => {
    setData((prev) => {
      const newData = prev.map((item) =>
        item.mobile_dental_id === id ? { ...item, ...updates } : item
      );
      // Sync กลับเข้า Global Cache ด้วย (เพื่อให้สลับหน้ากลับมาแล้วยังอัปเดตอยู่)
      if (globalCache) {
        globalCache = globalCache.map((item) =>
          item.mobile_dental_id === id ? { ...item, ...updates } : item
        );
      }
      return newData;
    });
  }, []);

  const fetchAll = useCallback(async (isRefresh = false) => {
    // 1. ถ้ามี Cache และยังอายุไม่เกิน 5 นาที + token ตรงกับผู้ใช้ปัจจุบัน ให้ข้ามการดึง API (ยกเว้นกด Refresh)
    const currentToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (
      !isRefresh &&
      globalCache &&
      globalCacheToken === currentToken &&
      Date.now() - globalCacheTime < CACHE_TTL_MS
    ) {
      setData(globalCache);
      setTotal(globalCache.length);
      setIsTruncated(globalCacheTruncated);
      setLoading(false);
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    if (!isRefresh) setLoading(true);
    setIsFetching(true);
    setError(null);
    setProgress({ loadedPages: 0, totalPages: 1 });

    try {
      // 1. โหลดหน้าแรกก่อนเพื่อหาค่า totalPages
      const firstPage = await fetchPage(1, signal);
      const _total = firstPage.total || firstPage.data.length;
      let _totalPages = Math.ceil(_total / PAGE_SIZE);
      const shouldTruncate = _totalPages > MAX_PAGES;

      if (shouldTruncate) {
        _totalPages = MAX_PAGES;
        setIsTruncated(true);
      } else {
        setIsTruncated(false);
      }

      const allData = [...firstPage.data];
      setProgress({ loadedPages: 1, totalPages: _totalPages });

      // 2. ถ้ามีมากว่า 1 หน้า ให้ทยอยยิงโหลดหน้าที่เหลือแบบ Batch
      if (_totalPages > 1) {
        const remainingPages = Array.from({ length: _totalPages - 1 }, (_, i) => i + 2);
        
        for (let i = 0; i < remainingPages.length; i += CONCURRENCY) {
          if (signal.aborted) break;
          
          const batch = remainingPages.slice(i, i + CONCURRENCY);
          const results = await Promise.all(
            batch.map(p => fetchPage(p, signal))
          );
          
          results.forEach(res => {
            allData.push(...res.data);
          });
          
          setProgress(prev => ({ ...prev, loadedPages: prev.loadedPages + batch.length }));
        }
      }

      // 3. จัดเรียงตามวันที่ (ล่าสุดขึ้นก่อน) พร้อมกัน NaN จากข้อมูลวันที่ที่ไม่ถูกต้อง
      allData.sort((a, b) => {
        const bTime = new Date(b.date).getTime();
        const aTime = new Date(a.date).getTime();
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      });
      
      // 4. ลบข้อมูลที่ซ้ำซ้อนจาก Race Condition โค้ดใหม่ใช้ Set เช็ค id ตัวแรกที่เจอ (ป้องกัน stale overwrite)
      const seen = new Set();
      const uniqueData = allData.filter(item => {
        if (seen.has(item.mobile_dental_id)) return false;
        seen.add(item.mobile_dental_id);
        return true;
      });

      if (!signal.aborted) {
        setTotal(uniqueData.length);
        setData(uniqueData);
        globalCache = uniqueData;
        globalCacheTime = Date.now();
        globalCacheToken = currentToken;
        globalCacheTruncated = shouldTruncate;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการรวบรวมข้อมูล");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAll();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAll]);

  return {
    data,
    total,
    loading,
    isFetching,
    error,
    progress,
    isTruncated,
    refresh: () => fetchAll(true),
    updateLocalItem,
  };
}
