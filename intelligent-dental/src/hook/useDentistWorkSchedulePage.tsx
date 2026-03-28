"use client";

import { useMemo } from "react";
import { Avatar, Tag, Typography } from "antd";
import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/app/utils/auth.client";
import {
  getDisplayName,
  PERSONNEL_WORK_SCHEDULE_DAY_COLORS,
  PERSONNEL_WORK_SCHEDULE_DAYS,
  PERSONNEL_WORK_SCHEDULE_TIME_SLOTS,
} from "@/hook/usePersonnelWorkSchedulePage";
import { useWorkSchedule, type WorkSchedule } from "@/hook/useWorkSchedule";

const { Text } = Typography;

type ScheduleCell =
  | { type: "empty"; span: number }
  | { type: "span"; span: number }
  | { type: "start"; span: number; schedule: WorkSchedule };

type ScheduleTableRow = {
  key: string;
  time: string;
} & Record<string, string | ScheduleCell>;

export function useDentistWorkSchedulePage() {
  const router = useRouter();
  const { data, loading } = useWorkSchedule();

  const currentDentistId = useMemo(() => getUserIdFromToken(), []);

  const filteredData = useMemo(() => {
    if (!currentDentistId) return data;
    return data.filter((item) => Number(item.staff?.id) === currentDentistId);
  }, [currentDentistId, data]);

  const profile = useMemo(() => {
    return filteredData.find((item) => item.staff)?.staff ?? null;
  }, [filteredData]);

  const activeCount = useMemo(
    () => filteredData.filter((schedule) => schedule.is_active !== false).length,
    [filteredData],
  );

  const tableData = useMemo(() => {
    const matrix: Record<string, ScheduleCell[]> = {};

    PERSONNEL_WORK_SCHEDULE_DAYS.forEach((day) => {
      matrix[day.key] = PERSONNEL_WORK_SCHEDULE_TIME_SLOTS.map(() => ({
        type: "empty",
        span: 1,
      }));
    });

    filteredData.forEach((schedule) => {
      const day = schedule.date;
      const startHour = Number.parseInt(schedule.start_time.split(":")[0] ?? "", 10);
      const endHour = Number.parseInt(schedule.end_time.split(":")[0] ?? "", 10);
      const startIndex = PERSONNEL_WORK_SCHEDULE_TIME_SLOTS.findIndex(
        (slot) => slot.start === startHour,
      );
      const endIndex = PERSONNEL_WORK_SCHEDULE_TIME_SLOTS.findIndex(
        (slot) => slot.end === endHour,
      );

      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        const span = endIndex - startIndex + 1;
        matrix[day][startIndex] = { type: "start", schedule, span };

        for (let index = startIndex + 1; index <= endIndex; index += 1) {
          matrix[day][index] = { type: "span", span: 0 };
        }
      }
    });

    return PERSONNEL_WORK_SCHEDULE_TIME_SLOTS.map((slot, index) => {
      const row: ScheduleTableRow = {
        key: slot.label,
        time: slot.label,
      };

      PERSONNEL_WORK_SCHEDULE_DAYS.forEach((day) => {
        row[day.key] = matrix[day.key][index];
      });

      return row;
    });
  }, [filteredData]);

  const columns = useMemo(
    () => [
      {
        title: (
          <Text type="secondary" style={{ fontSize: 12 }}>
            เวลา
          </Text>
        ),
        dataIndex: "time",
        width: 120,
        align: "center" as const,
        render: (text: string) => (
          <Text style={{ fontSize: 12, fontWeight: 600, color: "#595959" }}>{text}</Text>
        ),
      },
      ...PERSONNEL_WORK_SCHEDULE_DAYS.map((day) => ({
        title: (
          <div style={{ textAlign: "center" }}>
            <Avatar
              size={28}
              style={{
                background: PERSONNEL_WORK_SCHEDULE_DAY_COLORS[day.key],
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 4,
                display: "block",
                margin: "0 auto 4px",
              }}
            >
              {day.short}
            </Avatar>
            <Text style={{ fontSize: 12, fontWeight: 600 }}>{day.label}</Text>
          </div>
        ),
        dataIndex: day.key,
        onCell: (record: ScheduleTableRow) => {
          const cellData = record[day.key];

          if (!cellData || typeof cellData === "string" || cellData.type === "empty") {
            return { rowSpan: 1 };
          }

          if (cellData.type === "span") {
            return { rowSpan: 0 };
          }

          return { rowSpan: cellData.span };
        },
        render: (cellData: ScheduleCell) => {
          if (!cellData || cellData.type === "empty" || cellData.type === "span") {
            return null;
          }

          const schedule = cellData.schedule;
          const isActive = schedule.is_active !== false;
          const color = PERSONNEL_WORK_SCHEDULE_DAY_COLORS[day.key];

          return (
            <div
              onClick={() => router.push(`/dentist/work-schedule/${schedule.id}`)}
              style={{
                background: isActive ? `${color}10` : "#fff1f0",
                borderLeft: `3px solid ${isActive ? color : "#ff4d4f"}`,
                borderRadius: 8,
                padding: "5px 8px",
                minHeight: `${cellData.span * 40}px`,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isActive ? color : "#ff4d4f",
                }}
              >
                <ClockCircleOutlined style={{ marginRight: 3 }} />
                {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: 600 }}>
                <UserOutlined style={{ marginRight: 3, color: "#8c8c8c" }} />
                {getDisplayName(schedule.staff)}
              </Text>
              <Tag
                color={isActive ? "blue" : "error"}
                style={{
                  fontSize: 10,
                  padding: "0 5px",
                  marginTop: 2,
                  alignSelf: "flex-start",
                }}
              >
                {isActive ? "ลงตรวจ" : "งดตรวจ"}
              </Tag>
            </div>
          );
        },
      })),
    ],
    [router],
  );

  return {
    loading,
    profile,
    filteredData,
    activeCount,
    tableData,
    columns,
    goHome: () => router.push("/dentist"),
    goToCreatePage: () => router.push("/dentist/work-schedule/create"),
  };
}
