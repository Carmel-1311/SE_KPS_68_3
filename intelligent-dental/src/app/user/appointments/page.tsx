"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CalendarClock, Search } from "lucide-react";
import {
  appointmentStatusLabel,
  mockAppointments,
  type Appointment,
  type AppointmentStatus,
} from "@/mock/mockAppointment";

const statusMeta: Record<
  AppointmentStatus,
  { label: string; color: "blue" | "green" | "red" | "orange" }
> = {
  scheduled: { label: appointmentStatusLabel.scheduled, color: "blue" },
  completed: { label: appointmentStatusLabel.completed, color: "green" },
  cancelled: { label: appointmentStatusLabel.cancelled, color: "red" },
  request_cancel: {
    label: appointmentStatusLabel.request_cancel,
    color: "orange",
  },
};

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
const formatThaiDate = (dateValue: string) => {
  const date = dayjs(dateValue);
  if (!date.isValid()) return dateValue;
  return `${date.format("DD")} ${thaiMonthsShort[date.month()]} ${date.format(
    "YYYY",
  )}`;
};

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>(
    "all",
  );

  const statusSummary = useMemo(() => {
    return appointments.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        request_cancel: 0,
      } as Record<AppointmentStatus, number>,
    );
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return appointments.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      if (!normalizedSearch) return matchesStatus;

      const matchesSearch = [
        item.id,
        item.date,
        item.time,
        item.dentist,
        item.branch,
        item.service,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  const handleCancelAppointment = (record: Appointment) => {
    Modal.confirm({
      title: "ขอยกเลิกนัดหมาย",
      content: `ต้องการขอยกเลิกนัดหมาย ${formatThaiDate(
        record.date,
      )} เวลา ${record.time} ใช่หรือไม่?`,
      okText: "ยืนยัน",
      cancelText: "ปิด",
      okButtonProps: { danger: true },
      onOk: () => {
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === record.id
              ? { ...item, status: "request_cancel" }
              : item,
          ),
        );
      },
    });
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: "วันที่",
      key: "dateTime",
      width: 180,
      render: (_, record) => (
        <div>
          <div>{formatThaiDate(record.date)}</div>
          <Typography.Text type="secondary">{record.time} น.</Typography.Text>
        </div>
      ),
    },
    {
      title: "บริการ",
      dataIndex: "service",
      key: "service",
      width: 180,
    },
    {
      title: "ทันตแพทย์",
      dataIndex: "dentist",
      key: "dentist",
      width: 180,
    },
    {
      title: "สาขา",
      dataIndex: "branch",
      key: "branch",
      width: 160,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (value: AppointmentStatus) => (
        <Tag color={statusMeta[value].color}>{statusMeta[value].label}</Tag>
      ),
    },
    {
      title: "จัดการ",
      key: "actions",
      align: "right",
      width: 140,
      render: (_, record) => (
        <Button
          danger
          size="small"
          disabled={record.status !== "scheduled"}
          onClick={() => handleCancelAppointment(record)}
        >
          ยกเลิกนัด
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <CalendarClock size={18} />
          <span>ตรวจสอบการนัดหมาย</span>
        </Space>
      }
      style={{ maxWidth: 980, margin: "0 auto" }}
      bodyStyle={{ padding: "1rem" }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <Space style={{ flex: 1, minWidth: 260 }}>
            <Search size={18} />
            <Input
              placeholder="ค้นหา (เลขนัด, วันที่, ทันตแพทย์, บริการ)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Space>

          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ minWidth: 180 }}
            options={[
              { value: "all", label: "ทุกสถานะ" },
              { value: "scheduled", label: appointmentStatusLabel.scheduled },
              {
                value: "request_cancel",
                label: appointmentStatusLabel.request_cancel,
              },
              { value: "completed", label: appointmentStatusLabel.completed },
              { value: "cancelled", label: appointmentStatusLabel.cancelled },
            ]}
          />
        </Space>

        <Space wrap>
          <Tag color="blue">
            {appointmentStatusLabel.scheduled}: {statusSummary.scheduled}
          </Tag>
          <Tag color="orange">
            {appointmentStatusLabel.request_cancel}:{" "}
            {statusSummary.request_cancel}
          </Tag>
          <Tag color="green">
            {appointmentStatusLabel.completed}: {statusSummary.completed}
          </Tag>
          <Tag color="red">
            {appointmentStatusLabel.cancelled}: {statusSummary.cancelled}
          </Tag>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredAppointments}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "ไม่พบนัดหมาย" }}
          scroll={{ x: 820 }}
        />
      </Space>
    </Card>
  );
}
