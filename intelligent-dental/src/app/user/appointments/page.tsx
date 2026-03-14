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
  mockAppointmentList,
  type Datum,
  Status,
} from "@/mock/mockAppointment";

const statusMeta: Record<
  Status,
  { label: string; color: "blue" | "green" | "red" | "orange" }
> = {
  [Status.Scheduled]: { label: "นัดหมายแล้ว", color: "blue" },
  [Status.Completed]: { label: "เสร็จสิ้น", color: "green" },
  [Status.Cancelled]: { label: "ยกเลิก", color: "red" },
  [Status.RequestCancel]: { label: "ขอยกเลิก", color: "orange" },
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
  const [appointments, setAppointments] = useState(mockAppointmentList);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const statusSummary = useMemo(() => {
    return appointments.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      {
        [Status.Scheduled]: 0,
        [Status.Completed]: 0,
        [Status.Cancelled]: 0,
        [Status.RequestCancel]: 0,
      } as Record<Status, number>,
    );
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return appointments.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      if (!normalizedSearch) return matchesStatus;

      const matchesSearch = [
        item.appointment_id,
        item.appointment_date,
        item.appointment_time,
        item.staff?.name,
        item.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  const handleCancelAppointment = (record: Datum) => {
    Modal.confirm({
      title: "ขอยกเลิกนัดหมาย",
      content: `ต้องการขอยกเลิกนัดหมาย ${formatThaiDate(
        record.appointment_date,
      )} เวลา ${record.appointment_time} ใช่หรือไม่?`,
      okText: "ยืนยัน",
      cancelText: "ปิด",
      okButtonProps: { danger: true },
      onOk: () => {
        setAppointments((prev) =>
          prev.map((item) =>
            item.appointment_id === record.appointment_id
              ? { ...item, status: Status.RequestCancel }
              : item,
          ),
        );
      },
    });
  };

  const columns: ColumnsType<Datum> = [
    {
      title: "วันที่",
      key: "dateTime",
      width: 180,
      render: (_, record) => (
        <div>
          <div>{formatThaiDate(record.appointment_date)}</div>
          <Typography.Text type="secondary">
            {record.appointment_time} น.
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "บริการ",
      dataIndex: "type",
      key: "service",
      width: 180,
    },
    {
      title: "ทันตแพทย์",
      dataIndex: ["staff", "name"],
      key: "dentist",
      width: 180,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (value: Status) => (
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
          disabled={record.status !== Status.Scheduled}
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
      styles={{ body: { padding: "1rem" } }}
    >
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
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
              {
                value: Status.Scheduled,
                label: statusMeta[Status.Scheduled].label,
              },
              {
                value: Status.RequestCancel,
                label: statusMeta[Status.RequestCancel].label,
              },
              {
                value: Status.Completed,
                label: statusMeta[Status.Completed].label,
              },
              {
                value: Status.Cancelled,
                label: statusMeta[Status.Cancelled].label,
              },
            ]}
          />
        </Space>

        <Space wrap>
          <Tag color="blue">
            {statusMeta[Status.Scheduled].label}:{" "}
            {statusSummary[Status.Scheduled]}
          </Tag>
          <Tag color="orange">
            {statusMeta[Status.RequestCancel].label}:{" "}
            {statusSummary[Status.RequestCancel]}
          </Tag>
          <Tag color="green">
            {statusMeta[Status.Completed].label}:{" "}
            {statusSummary[Status.Completed]}
          </Tag>
          <Tag color="red">
            {statusMeta[Status.Cancelled].label}:{" "}
            {statusSummary[Status.Cancelled]}
          </Tag>
        </Space>

        <Table
          rowKey="appointment_id"
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
