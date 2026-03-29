"use client";

import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CalendarClock,
  CalendarDays,
  Clock3,
  House,
  Search,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { createTablePagination } from "@/app/utils/tablePagination";
import { useAppointments } from "@/hook/useAppointments";
import { type Datum, Status } from "@/mock/mockAppointment";

const { Title, Text } = Typography;

const statusMeta: Record<
  Status,
  {
    label: string;
    color: "blue" | "green" | "red" | "orange";
    accent: string;
    background: string;
  }
> = {
  [Status.Scheduled]: {
    label: "นัดหมายแล้ว",
    color: "blue",
    accent: "#1677ff",
    background: "linear-gradient(135deg, #e6f4ff 0%, #ffffff 100%)",
  },
  [Status.Completed]: {
    label: "เสร็จสิ้น",
    color: "green",
    accent: "#52c41a",
    background: "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)",
  },
  [Status.Cancelled]: {
    label: "ยกเลิก",
    color: "red",
    accent: "#ff4d4f",
    background: "linear-gradient(135deg, #fff1f0 0%, #ffffff 100%)",
  },
  [Status.RequestCancel]: {
    label: "ขอยกเลิก",
    color: "orange",
    accent: "#fa8c16",
    background: "linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)",
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
  return `${date.format("DD")} ${thaiMonthsShort[date.month()]} ${date.year() + 543}`;
};

const formatAppointmentTime = (timeValue: string) => {
  const trimmed = timeValue.trim();
  if (!trimmed) return timeValue;
  if (!trimmed.includes("T")) return trimmed;
  const timePart = trimmed.split("T")[1];
  if (!timePart) return timeValue;
  return timePart.replace("Z", "").slice(0, 5);
};

export default function UserAppointmentsPage() {
  const {
    filteredAppointments,
    statusSummary,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    requestCancel,
  } = useAppointments();

  const totalAppointments =
    statusSummary[Status.Scheduled] +
    statusSummary[Status.Completed] +
    statusSummary[Status.Cancelled] +
    statusSummary[Status.RequestCancel];

  const nearestAppointment = filteredAppointments
    .filter((item) => item.status === Status.Scheduled)
    .sort((a, b) => {
      const aDate = dayjs(`${a.appointment_date}T${formatAppointmentTime(a.appointment_time)}`).valueOf();
      const bDate = dayjs(`${b.appointment_date}T${formatAppointmentTime(b.appointment_time)}`).valueOf();
      return aDate - bDate;
    })[0];

  const handleCancelAppointment = (record: Datum) => {
    Modal.confirm({
      title: "ขอยกเลิกนัดหมาย",
      content: `ต้องการขอยกเลิกนัดหมาย ${formatThaiDate(record.appointment_date)} เวลา ${formatAppointmentTime(record.appointment_time)} ใช่หรือไม่?`,
      okText: "ยืนยัน",
      cancelText: "ปิด",
      okButtonProps: { danger: true },
      onOk: () => {
        requestCancel(record.appointment_id);
      },
    });
  };

  const columns: ColumnsType<Datum> = [
    {
      title: "วันและเวลา",
      key: "dateTime",
      width: 220,
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{formatThaiDate(record.appointment_date)}</Text>
          <Text type="secondary">
            {formatAppointmentTime(record.appointment_time)} น.
          </Text>
        </Space>
      ),
    },
    {
      title: "บริการ",
      dataIndex: "type",
      key: "service",
      width: 200,
      render: (value: string) => (
        <Space size={8}>
          <Stethoscope size={15} color="#1677ff" />
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: "ทันตแพทย์",
      dataIndex: ["staff", "name"],
      key: "dentist",
      width: 200,
      render: (value?: string) => value || "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (value: Status) => (
        <Tag
          color={statusMeta[value].color}
          style={{ borderRadius: 999, paddingInline: 10, fontWeight: 500 }}
        >
          {statusMeta[value].label}
        </Tag>
      ),
    },
    {
      title: "จัดการ",
      key: "actions",
      align: "right",
      width: 150,
      render: (_, record) => (
        <Button
          danger
          icon={<XCircle size={14} />}
          disabled={record.status !== Status.Scheduled}
          onClick={() => handleCancelAppointment(record)}
          style={{ borderRadius: 10 }}
        >
          ยกเลิกนัด
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: 24 }}>
      <Space orientation="vertical" size={24} style={{ width: "100%" }}>
        <Space size={8} style={{ color: "#8c8c8c" }} wrap>
          <Link
            href="/user/profile"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "inherit" }}
          >
            <House size={16} />
            <span>หน้าหลักผู้ใช้</span>
          </Link>
          <Text type="secondary">/</Text>
          <Space size={8}>
            <CalendarClock size={16} />
            <Text type="secondary">ตรวจสอบการนัดหมาย</Text>
          </Space>
        </Space>

        <Card
          variant="borderless"
          style={{
            borderRadius: 16,
            background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            border: "1px solid rgba(22, 119, 255, 0.08)",
          }}
          styles={{ body: { padding: 28 } }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} lg={16}>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                <Tag color="blue" style={{ width: "fit-content", borderRadius: 999 }}>
                  ตารางนัดหมายของฉัน
                </Tag>
                <Title level={2} style={{ margin: 0 }}>
                  ตรวจสอบสถานะการนัดหมาย
                </Title>
                <Text type="secondary" style={{ fontSize: 15 }}>
                  ดูรายการนัดหมายทั้งหมด ติดตามสถานะล่าสุด และส่งคำขอยกเลิกได้จากหน้านี้
                </Text>
                {nearestAppointment ? (
                  <Space
                    size={16}
                    wrap
                    style={{
                      marginTop: 8,
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "rgba(22, 119, 255, 0.06)",
                      border: "1px solid rgba(22, 119, 255, 0.08)",
                    }}
                  >
                    <Space size={8}>
                      <CalendarDays size={16} color="#1677ff" />
                      <Text strong>{formatThaiDate(nearestAppointment.appointment_date)}</Text>
                    </Space>
                    <Space size={8}>
                      <Clock3 size={16} color="#1677ff" />
                      <Text>{formatAppointmentTime(nearestAppointment.appointment_time)} น.</Text>
                    </Space>
                    <Space size={8}>
                      <UserRound size={16} color="#1677ff" />
                      <Text>{nearestAppointment.staff?.name || "รอระบุทันตแพทย์"}</Text>
                    </Space>
                  </Space>
                ) : (
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    ขณะนี้ไม่มีนัดหมายที่กำลังรอเข้ารับบริการ
                  </Text>
                )}
              </Space>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 16,
                  background: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
                styles={{ body: { padding: 20 } }}
              >
                <Text type="secondary">นัดหมายทั้งหมด</Text>
                <Title level={2} style={{ margin: "8px 0 4px" }}>
                  {totalAppointments}
                </Title>
                <Text type="secondary">รวมทุกสถานะในระบบของผู้ใช้คนนี้</Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {error && (
          <Alert
            type="error"
            showIcon
            title="เกิดข้อผิดพลาด"
            description={error}
          />
        )}

        <Row gutter={[16, 16]}>
          {(
            [Status.Scheduled, Status.RequestCancel, Status.Completed, Status.Cancelled] as const
          ).map((status) => (
            <Col xs={24} sm={12} lg={6} key={status}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 16,
                  background: statusMeta[status].background,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
                styles={{ body: { padding: 20 } }}
              >
                <Text type="secondary">{statusMeta[status].label}</Text>
                <Title level={3} style={{ margin: "8px 0 0", color: statusMeta[status].accent }}>
                  {statusSummary[status]}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          variant="borderless"
          style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
          styles={{ body: { padding: 24 } }}
        >
          <Space orientation="vertical" size={20} style={{ width: "100%" }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} lg={10}>
                <Space orientation="vertical" size={4}>
                  <Title level={3} style={{ margin: 0 }}>
                    รายการนัดหมาย
                  </Title>
                  <Text type="secondary">
                    ค้นหาและกรองรายการตามวันนัดและสถานะได้ทันที
                  </Text>
                </Space>
              </Col>

              <Col xs={24} lg={14}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={10}>
                    <Input
                      prefix={<Search size={16} color="#8c8c8c" />}
                      placeholder="ค้นหา วันที่, ทันตแพทย์, บริการ"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      allowClear
                      style={{ borderRadius: 10 }}
                    />
                  </Col>
                  <Col xs={24} md={7}>
                    <DatePicker
                      value={dateFilter}
                      onChange={(value) => setDateFilter(value)}
                      allowClear
                      style={{ width: "100%", borderRadius: 10 }}
                      format="YYYY-MM-DD"
                    />
                  </Col>
                  <Col xs={24} md={7}>
                    <Select
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value)}
                      style={{ width: "100%" }}
                      options={[
                        { value: "all", label: "ทุกสถานะ" },
                        { value: Status.Scheduled, label: statusMeta[Status.Scheduled].label },
                        { value: Status.RequestCancel, label: statusMeta[Status.RequestCancel].label },
                        { value: Status.Completed, label: statusMeta[Status.Completed].label },
                        { value: Status.Cancelled, label: statusMeta[Status.Cancelled].label },
                      ]}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            <Table
              rowKey="appointment_id"
              columns={columns}
              dataSource={filteredAppointments}
              loading={loading}
              pagination={createTablePagination(8)}
              scroll={{ x: 920 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="ไม่พบนัดหมายตามเงื่อนไขที่เลือก"
                  />
                ),
              }}
              style={{ borderRadius: 12, overflow: "hidden" }}
              components={{
                header: {
                  cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
                    <th
                      {...props}
                      style={{
                        ...props.style,
                        background: "#fafafa",
                        fontWeight: 600,
                        color: "#262626",
                      }}
                    />
                  ),
                },
              }}
              rowClassName={() => "hover:bg-gray-50 transition-colors"}
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
}
