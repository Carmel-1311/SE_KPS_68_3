"use client";

import { useMemo, useState } from "react";
import { Avatar, Tag, Typography } from "antd";
import {
  ClockCircleOutlined,
  IdcardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useWorkSchedule, type WorkSchedule } from "@/hook/useWorkSchedule";
import { useStaffs, type StaffListItem } from "@/hook/useStaffs";

const { Text } = Typography;

const cleanStaffName = (name?: string) => name?.replace("null ", "") || "";

export const getRoleLabel = (role?: string) => {
  if (role === "dentist") return "ทันตแพทย์";
  if (role === "staff") return "บุคลากร";
  return role || "บุคลากร";
};

export const getDisplayName = (
  staff?: WorkSchedule["staff"] | Pick<StaffListItem, "id" | "name" | "role">,
) => {
  const name = cleanStaffName(staff?.name);
  if (name) return name;
  if (staff?.id) return `${getRoleLabel(staff.role)} ID: ${staff.id}`;
  return "ไม่พบชื่อบุคลากร";
};

export const PERSONNEL_WORK_SCHEDULE_TIME_SLOTS = [
  { start: 8, end: 9, label: "08:00 - 09:00" },
  { start: 9, end: 10, label: "09:00 - 10:00" },
  { start: 10, end: 11, label: "10:00 - 11:00" },
  { start: 11, end: 12, label: "11:00 - 12:00" },
  { start: 12, end: 13, label: "12:00 - 13:00" },
  { start: 13, end: 14, label: "13:00 - 14:00" },
  { start: 14, end: 15, label: "14:00 - 15:00" },
  { start: 15, end: 16, label: "15:00 - 16:00" },
  { start: 16, end: 17, label: "16:00 - 17:00" },
  { start: 17, end: 18, label: "17:00 - 18:00" },
  { start: 18, end: 19, label: "18:00 - 19:00" },
  { start: 19, end: 20, label: "19:00 - 20:00" },
] as const;

export const PERSONNEL_WORK_SCHEDULE_DAYS = [
  { key: "Mon", label: "จันทร์", short: "จ" },
  { key: "Tue", label: "อังคาร", short: "อ" },
  { key: "Wed", label: "พุธ", short: "พ" },
  { key: "Thu", label: "พฤหัสบดี", short: "พฤ" },
  { key: "Fri", label: "ศุกร์", short: "ศ" },
  { key: "Sat", label: "เสาร์", short: "ส" },
  { key: "Sun", label: "อาทิตย์", short: "อา" },
] as const;

export const PERSONNEL_WORK_SCHEDULE_DAY_COLORS: Record<string, string> = {
  Mon: "#4096ff",
  Tue: "#f759ab",
  Wed: "#36cfc9",
  Thu: "#9254de",
  Fri: "#52c41a",
  Sat: "#fa8c16",
  Sun: "#ff4d4f",
};

type ScheduleCell =
  | { type: "empty"; span: number }
  | { type: "span"; span: number }
  | { type: "start"; span: number; schedule: WorkSchedule };

type ScheduleTableRow = {
  key: string;
  time: string;
} & Record<string, string | ScheduleCell>;

export function usePersonnelWorkSchedulePage() {
  const router = useRouter();
  const { data: allData, loading } = useWorkSchedule();
  const { staff: staffData, loading: staffsLoading } = useStaffs();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  const staffOptions = useMemo(() => {
    return staffData
      .filter((item) => item.role === "staff" || item.role === "dentist")
      .map((item) => ({
        value: item.id,
        label: getDisplayName(item),
      }));
  }, [staffData]);

  const effectiveSelectedStaffId =
    selectedStaffId ?? (staffOptions.length > 0 ? Number(staffOptions[0].value) : null);

  const filteredData = useMemo(() => {
    if (!effectiveSelectedStaffId) return [];
    return allData.filter((item) => Number(item.staff?.id) === effectiveSelectedStaffId);
  }, [allData, effectiveSelectedStaffId]);

  const selectedStaff = useMemo(() => {
    if (!effectiveSelectedStaffId) return null;
    const fromStaffs = staffData.find((item) => item.id === effectiveSelectedStaffId);
    if (fromStaffs) {
      return {
        id: String(fromStaffs.id),
        name: fromStaffs.name,
        role: fromStaffs.role,
      };
    }
    return allData.find((item) => Number(item.staff?.id) === effectiveSelectedStaffId)?.staff ?? null;
  }, [allData, effectiveSelectedStaffId, staffData]);

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
          <Text style={{ fontSize: 12, fontWeight: 600, color: "#595959" }}>
            {text}
          </Text>
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
                onClick={() => router.push(`/personnel/work-schedule/${schedule.id}`)}
                style={{
                  background: isActive ? `${color}10` : "#fff1f0",
                  borderLeft: `3px solid ${isActive ? color : "#ff4d4f"}`,
                  borderRadius: 8,
                  padding: "5px 8px",
                  minHeight: `${cellData.span * 40}px`,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.boxShadow = "none";
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
                {schedule.staff?.role && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <IdcardOutlined style={{ marginRight: 3 }} />
                    {getRoleLabel(schedule.staff.role)}
                  </Text>
                )}
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
    loading: loading || staffsLoading,
    selectedStaffId: effectiveSelectedStaffId,
    setSelectedStaffId,
    staffOptions,
    selectedStaff,
    filteredData,
    activeCount,
    tableData,
    columns,
    getDisplayName,
    getRoleLabel,
    goHome: () => router.push("/"),
    goToCreatePage: () => router.push("/personnel/work-schedule/create"),
  };
}
