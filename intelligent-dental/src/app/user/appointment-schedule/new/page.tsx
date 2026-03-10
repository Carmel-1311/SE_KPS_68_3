"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  TimePicker,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import {
  mockAppointments,
  type Appointment,
} from "@/mock/mockAppointment";

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
const formatThaiDateValue = (value: Dayjs) =>
  `${value.format("DD")} ${thaiMonthsShort[value.month()]} ${value.format(
    "YYYY",
  )}`;

const storageKey = "userAppointments";

const readStoredAppointments = (): Appointment[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Appointment[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item?.date && item?.time);
  } catch {
    return [];
  }
};

const writeStoredAppointments = (items: Appointment[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(items));
};

const mergeAppointments = (base: Appointment[], extra: Appointment[]) => {
  const map = new Map<string, Appointment>();
  base.forEach((item) => map.set(item.id, item));
  extra.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const [newAppointmentDate, setNewAppointmentDate] = useState<Dayjs | null>(
    dayjs(),
  );
  const [newAppointmentTime, setNewAppointmentTime] = useState<Dayjs | null>(
    null,
  );
  const [newAppointmentService, setNewAppointmentService] = useState("");
  const [newAppointmentDentist, setNewAppointmentDentist] = useState("");
  const [newAppointmentBranch, setNewAppointmentBranch] = useState("");
  const [newAppointmentNote, setNewAppointmentNote] = useState("");

  const baseAppointments = useMemo(() => {
    const stored = readStoredAppointments();
    return mergeAppointments(mockAppointments, stored);
  }, []);

  const uniqueOptions = (key: "service" | "dentist" | "branch") => {
    const values = new Set(baseAppointments.map((item) => item[key]));
    return Array.from(values).map((value) => ({ label: value, value }));
  };

  const isPastDate = (value: Dayjs) => value.isBefore(dayjs(), "day");

  const createAppointmentId = (dateValue: Dayjs) => {
    const dateKey = dateValue.format("YYYYMMDD");
    const existing = baseAppointments.filter((item) =>
      item.id.startsWith(`AP-${dateKey}`),
    );
    const nextNumber = String(existing.length + 1).padStart(3, "0");
    return `AP-${dateKey}-${nextNumber}`;
  };

  const handleAddAppointment = () => {
    if (!newAppointmentDate || !newAppointmentTime) return;
    if (
      !newAppointmentService.trim() ||
      !newAppointmentDentist.trim() ||
      !newAppointmentBranch.trim()
    ) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (isPastDate(newAppointmentDate)) {
      message.error("ไม่สามารถเลือกวันที่ผ่านมาแล้วได้");
      return;
    }

    const newAppointment: Appointment = {
      id: createAppointmentId(newAppointmentDate),
      date: newAppointmentDate.format("YYYY-MM-DD"),
      time: newAppointmentTime.format("HH:mm"),
      dentist: newAppointmentDentist.trim(),
      branch: newAppointmentBranch.trim(),
      service: newAppointmentService.trim(),
      status: "scheduled",
      note: newAppointmentNote.trim() || undefined,
      createdAt: dayjs().format(),
    };

    const stored = readStoredAppointments();
    writeStoredAppointments([...stored, newAppointment]);
    message.success("เพิ่มการนัดหมายเรียบร้อยแล้ว");
    router.push("/user/appointment-schedule");
  };

  return (
    <div style={{ padding: "24px 12px" }}>
      <Card
        title="เพิ่มการนัดหมาย"
        style={{ maxWidth: 720, margin: "0 auto" }}
        bodyStyle={{ padding: "1rem" }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Text>เลือกวันที่ต้องการนัดหมาย</Typography.Text>
          <DatePicker
            style={{ width: "100%" }}
            value={newAppointmentDate}
            onChange={(value) => setNewAppointmentDate(value)}
            format={(value) => (value ? formatThaiDateValue(value) : "")}
            disabledDate={(current) =>
              current ? current.isBefore(dayjs(), "day") : false
            }
          />
          <Typography.Text>เลือกเวลา</Typography.Text>
          <TimePicker
            style={{ width: "100%" }}
            value={newAppointmentTime}
            onChange={(value) => setNewAppointmentTime(value)}
            format="HH:mm"
          />
          <Typography.Text>บริการ</Typography.Text>
          <Select
            showSearch
            placeholder="เลือกหรือพิมพ์บริการ"
            options={uniqueOptions("service")}
            value={newAppointmentService || undefined}
            onChange={(value) => setNewAppointmentService(value)}
            onSearch={(value) => setNewAppointmentService(value)}
          />
          <Typography.Text>ทันตแพทย์</Typography.Text>
          <Select
            showSearch
            placeholder="เลือกหรือพิมพ์ชื่อทันตแพทย์"
            options={uniqueOptions("dentist")}
            value={newAppointmentDentist || undefined}
            onChange={(value) => setNewAppointmentDentist(value)}
            onSearch={(value) => setNewAppointmentDentist(value)}
          />
          <Typography.Text>สาขา</Typography.Text>
          <Select
            showSearch
            placeholder="เลือกหรือพิมพ์ชื่อสาขา"
            options={uniqueOptions("branch")}
            value={newAppointmentBranch || undefined}
            onChange={(value) => setNewAppointmentBranch(value)}
            onSearch={(value) => setNewAppointmentBranch(value)}
          />
          <Typography.Text>หมายเหตุ (ถ้ามี)</Typography.Text>
          <Input
            placeholder="ระบุหมายเหตุเพิ่มเติม"
            value={newAppointmentNote}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setNewAppointmentNote(event.target.value)
            }
          />
          <Space size={8} wrap>
            <Button onClick={() => router.back()}>ย้อนกลับ</Button>
            <Button
              type="primary"
              onClick={handleAddAppointment}
              disabled={
                !newAppointmentDate ||
                !newAppointmentTime ||
                isPastDate(newAppointmentDate)
              }
            >
              บันทึกการนัดหมาย
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
