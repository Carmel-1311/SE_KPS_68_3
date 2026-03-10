"use client";

import { useMemo, useState } from "react";
import { Button, Card, Input, Modal, Select, Space, Table, Tag, Typography } from "antd";
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
  { label: string; color: "blue" | "green" | "red" }
> = {
  upcoming: { label: appointmentStatusLabel.upcoming, color: "blue" },
  completed: { label: appointmentStatusLabel.completed, color: "green" },
  cancelled: { label: appointmentStatusLabel.cancelled, color: "red" },
};

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return appointments.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      if (!normalizedSearch) return matchesStatus;

      const matchesSearch = [item.id, item.date, item.time, item.dentist, item.branch, item.service]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  const handleCancelAppointment = (record: Appointment) => {
    Modal.confirm({
      title: "ยืนยันการยกเลิกนัดหมาย",
      content: `ต้องการยกเลิกนัดหมาย ${record.date} เวลา ${record.time} ใช่หรือไม่?`,
      okText: "ยืนยัน",
      cancelText: "ปิด",
      okButtonProps: { danger: true },
      onOk: () => {
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === record.id ? { ...item, status: "cancelled" } : item,
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
          <div>{record.date}</div>
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
          disabled={record.status !== "upcoming"}
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
              { value: "upcoming", label: appointmentStatusLabel.upcoming },
              { value: "completed", label: appointmentStatusLabel.completed },
              { value: "cancelled", label: appointmentStatusLabel.cancelled },
            ]}
          />
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
