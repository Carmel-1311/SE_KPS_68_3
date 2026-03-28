"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";

export interface DentistAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  patientName: string;
  service: string;
  status: "success" | "warning" | "error" | "processing";
  note?: string;
}

export const DENTIST_WORK_SCHEDULE_STATUS_META: Record<
  DentistAppointment["status"],
  { color: string; label: string; border: string }
> = {
  success: { color: "green", label: "เสร็จสิ้น", border: "#52c41a" },
  processing: { color: "blue", label: "รอนัดหมาย", border: "#1677ff" },
  warning: { color: "orange", label: "รอยืนยัน", border: "#fa8c16" },
  error: { color: "error", label: "ยกเลิก", border: "#ff4d4f" },
};

const mockAppointments = (): DentistAppointment[] => [
  {
    id: "1",
    date: dayjs().format("YYYY-MM-DD"),
    startTime: "09:00",
    endTime: "10:00",
    patientName: "คุณสมชาย ใจดี",
    service: "อุดฟัน",
    status: "success",
    note: "ฟันกรามบนซ้าย",
  },
  {
    id: "2",
    date: dayjs().format("YYYY-MM-DD"),
    startTime: "10:30",
    endTime: "11:30",
    patientName: "คุณวิภาดา",
    service: "ขูดหินปูน",
    status: "processing",
  },
  {
    id: "3",
    date: dayjs().add(2, "day").format("YYYY-MM-DD"),
    startTime: "13:00",
    endTime: "14:00",
    patientName: "คุณมานะ",
    service: "ถอนฟัน",
    status: "warning",
  },
  {
    id: "4",
    date: dayjs().add(5, "day").format("YYYY-MM-DD"),
    startTime: "09:00",
    endTime: "10:00",
    patientName: "คุณจอนนี่",
    service: "ตรวจฟัน",
    status: "processing",
  },
];

export function useDentistWorkSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<DentistAppointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const data = mockAppointments();
        timeoutId = setTimeout(() => {
          setAppointments(data);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };

    void fetchAppointments();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const dailyData = useMemo(() => {
    return appointments
      .filter((item) => item.date === selectedDate.format("YYYY-MM-DD"))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDate]);

  const fullCellRender = useCallback(
    (date: Dayjs) => {
      const dateStr = date.format("YYYY-MM-DD");
      const hasAppointment = appointments.some((app) => app.date === dateStr);
      const isSelected = date.isSame(selectedDate, "day");
      const isToday = date.isSame(dayjs(), "day");

      return (
        <div
          style={{
            position: "relative",
            height: 38,
            lineHeight: "38px",
            textAlign: "center",
            borderRadius: 8,
            fontWeight: hasAppointment || isToday ? 700 : 400,
            background: isSelected
              ? "#1677ff"
              : hasAppointment
                ? "#fff1f0"
                : "transparent",
            color: isSelected ? "#fff" : hasAppointment ? "#ff4d4f" : undefined,
            border: hasAppointment && !isSelected ? "1px solid #ffccc7" : "none",
            cursor: "pointer",
          }}
        >
          {date.date()}
          {hasAppointment && !isSelected && (
            <div
              style={{
                position: "absolute",
                bottom: 3,
                left: "50%",
                transform: "translateX(-50%)",
                width: 4,
                height: 4,
                background: "#ff4d4f",
                borderRadius: "50%",
              }}
            />
          )}
        </div>
      );
    },
    [appointments, selectedDate],
  );

  return {
    loading,
    selectedDate,
    setSelectedDate,
    dailyData,
    fullCellRender,
    goHome: () => router.push("/"),
  };
}
