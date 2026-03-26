import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { getAuthToken, withAuthHeaders } from "@/app/utils/auth.client";

type TreatmentDetail = {
  id: number;
  diagnosis: string;
  examination_type: { id: number; name: string };
};

type InspectionRecord = {
  id: number;
  date: string;
  history: string;
  status: string;
};

type TreatmentData = {
  id: number;
  patients_id: number;
  date: string;
  history: string;
  status: string;
  detail: TreatmentDetail[];
  inspection_record: InspectionRecord;
};

type TreatmentListItem = {
  id: number;
  patient_id: number;
  date: string;
  history: string;
  status: string;
  inspection_record_id: number;
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
const hasTreatmentData = (
  value: { data?: TreatmentData } | ApiErrorShape,
): value is { data: TreatmentData } => "data" in value && Boolean(value.data);

const thaiMonthsShort = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const formatThaiDate = (dateValue: string | Date) => {
  const date = dayjs(dateValue);
  if (!date.isValid()) return String(dateValue);
  return `${date.format("DD")} ${thaiMonthsShort[date.month()]} ${date.format(
    "YYYY",
  )}`;
};

export function useTreatments() {
  const isMountedRef = useRef(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<TreatmentData[]>([]);
  const [detailsById, setDetailsById] = useState<
    Record<number, TreatmentData>
  >({});

  useEffect(() => {
    isMountedRef.current = true;
    const fetchTreatments = async () => {
      try {
        if (isMountedRef.current) {
          setLoading(true);
          setError(null);
        }

        const token = getAuthToken();
        if (!token) {
          if (isMountedRef.current) {
            setTreatments([]);
            setError("Please log in to view treatments.");
            setLoading(false);
          }
          return;
        }

        const patientIdRaw =
          typeof window !== "undefined"
            ? localStorage.getItem("patient_id")
            : null;
        const patientId = patientIdRaw ? Number(patientIdRaw) : NaN;
        if (!Number.isFinite(patientId) || patientId <= 0) {
          if (isMountedRef.current) {
            setTreatments([]);
            setError("Patient id not found.");
            setLoading(false);
          }
          return;
        }

        const response = await fetch(
          `/api/patients/${patientId}/medical_records?limit=200`,
          {
            cache: "no-store",
            headers: withAuthHeaders(),
          },
        );

        const result = (await response.json()) as ApiListResponse<
          TreatmentListItem
        >;

        if (!response.ok) {
          const message =
            (result as { error?: { message?: string } })?.error?.message ||
            (result as { message?: string })?.message ||
            "Failed to load treatments.";
          throw new Error(message);
        }

        const normalized = (result.data ?? [])
          .map((item) => ({
            id: item.id,
            patients_id: item.patient_id,
            date: item.date,
            history: item.history ?? "",
            status: item.status ?? "",
            detail: [],
            inspection_record: {
              id: item.inspection_record_id ?? 0,
              date: "",
              history: "",
              status: "",
            },
          }))
          .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

        if (isMountedRef.current) {
          setTreatments(normalized);
        }
      } catch (err) {
        const messageValue =
          err instanceof Error ? err.message : "Failed to load treatments.";
        if (isMountedRef.current) {
          setError(messageValue);
          setTreatments([]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    void fetchTreatments();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const filteredTreatments = useMemo(() => {
    if (!search.trim()) return treatments;
    const normalized = search.trim().toLowerCase();
    return treatments.filter((item) => {
      const thaiDate = formatThaiDate(item.date).toLowerCase();
      const isoDate = dayjs(item.date).format("YYYY-MM-DD");
      return thaiDate.includes(normalized) || isoDate.includes(normalized);
    });
  }, [search, treatments]);

  const [activeId, setActiveId] = useState<number>(treatments[0]?.id ?? 0);

  useEffect(() => {
    if (filteredTreatments.length === 0) return;
    const hasActive = filteredTreatments.some((item) => item.id === activeId);
    if (!hasActive) setActiveId(filteredTreatments[0].id);
  }, [activeId, filteredTreatments]);

  const activeTreatmentBase =
    filteredTreatments.find((item) => item.id === activeId) ??
    filteredTreatments[0] ??
    treatments[0];

  useEffect(() => {
    if (!activeTreatmentBase || detailsById[activeTreatmentBase.id]) return;

    const fetchDetail = async () => {
      try {
        const response = await fetch(
          `/api/medical_records/${activeTreatmentBase.id}`,
          {
            cache: "no-store",
            headers: withAuthHeaders(),
          },
        );
        const result = (await response.json()) as
          | { data?: TreatmentData }
          | ApiErrorShape;
        if (!response.ok) {
          return;
        }
        if (hasTreatmentData(result) && isMountedRef.current) {
          setDetailsById((prev) => ({
            ...prev,
            [activeTreatmentBase.id]: result.data!,
          }));
        }
      } catch {
        // ignore detail fetch errors
      }
    };

    void fetchDetail();
  }, [activeTreatmentBase, detailsById]);

  const activeTreatment: TreatmentData | undefined =
    (activeTreatmentBase && detailsById[activeTreatmentBase.id]) ??
    activeTreatmentBase;

  const filteredDetails: TreatmentDetail[] = activeTreatment?.detail ?? [];
  const hasActiveTreatment = Boolean(activeTreatment);

  return {
    search,
    setSearch,
    loading,
    error,
    treatments,
    filteredTreatments,
    activeId,
    setActiveId,
    activeTreatment,
    filteredDetails,
    hasActiveTreatment,
  };
}
