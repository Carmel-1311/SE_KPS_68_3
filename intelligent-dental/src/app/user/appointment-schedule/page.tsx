"use client";

import { useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Empty,
  Grid,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  House,
  Plus,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { Status } from "@/mock/mockAppointmentById";
import { useAppointmentSchedule } from "@/hook/useAppointmentSchedule";

const { Title, Text, Paragraph } = Typography;

const appointmentStatusLabel: Record<Status, string> = {
  [Status.Scheduled]: "นัดหมายแล้ว",
  [Status.Completed]: "เสร็จสิ้น",
  [Status.Cancelled]: "ยกเลิก",
  [Status.RequestCancel]: "ขอยกเลิก",
};

const statusColor: Record<Status, "blue" | "green" | "red" | "orange"> = {
  [Status.Scheduled]: "blue",
  [Status.Completed]: "green",
  [Status.Cancelled]: "red",
  [Status.RequestCancel]: "orange",
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

const formatThaiDateValue = (value: Dayjs) =>
  `${value.format("DD")} ${thaiMonthsShort[value.month()]} ${value.year() + 543}`;

const formatThaiMonthYear = (value: Dayjs) =>
  `${thaiMonthsShort[value.month()]} ${value.year() + 543}`;

const baseServiceOptions = [
  { label: "อุดฟัน", value: "อุดฟัน" },
  { label: "ขูดหินปูน", value: "ขูดหินปูน" },
  { label: "รักษารากฟัน", value: "รักษารากฟัน" },
  { label: "ครอบฟัน", value: "ครอบฟัน" },
  { label: "ตรวจฟัน", value: "ตรวจฟัน" },
  { label: "ถอนฟัน", value: "ถอนฟัน" },
  { label: "ฟอกสีฟัน", value: "ฟอกสีฟัน" },
  { label: "จัดฟัน", value: "จัดฟัน" },
  { label: "ถอนฟันคุด", value: "ถอนฟันคุด" },
  { label: "ตรวจสุขภาพช่องปาก", value: "ตรวจสุขภาพช่องปาก" },
];

export default function UserAppointmentSchedulePage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const maxAppointmentDate = dayjs().add(3, "month").endOf("day");

  const {
    isCreateOpen,
    setIsCreateOpen,
    newAppointmentDate,
    setNewAppointmentDate,
    newAppointmentTime,
    setNewAppointmentTime,
    newAppointmentService,
    setNewAppointmentService,
    availableSlots,
    loadingSlots,
    selectedDate,
    setSelectedDate,
    setViewMonth,
    statusFilter,
    setStatusFilter,
    nextAppointment,
    summary,
    uniqueOptions,
    isPastDate,
    resetNewAppointment,
    handleAddAppointment,
    selectedDateAppointments,
    getSortedAppointmentsForDate,
  } = useAppointmentSchedule();

  const serviceOptions = useMemo(() => {
    const merged = [...baseServiceOptions, ...uniqueOptions("service")];
    const seen = new Set<string>();

    return merged.filter((option) => {
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
  }, [uniqueOptions]);

  const summaryCards = [
    {
      key: Status.Scheduled,
      title: appointmentStatusLabel[Status.Scheduled],
      value: summary[Status.Scheduled],
      accent: "#1677ff",
      background: "linear-gradient(135deg, #e6f4ff 0%, #ffffff 100%)",
    },
    {
      key: Status.Completed,
      title: appointmentStatusLabel[Status.Completed],
      value: summary[Status.Completed],
      accent: "#52c41a",
      background: "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)",
    },
    {
      key: Status.RequestCancel,
      title: appointmentStatusLabel[Status.RequestCancel],
      value: summary[Status.RequestCancel],
      accent: "#fa8c16",
      background: "linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)",
    },
    {
      key: Status.Cancelled,
      title: appointmentStatusLabel[Status.Cancelled],
      value: summary[Status.Cancelled],
      accent: "#ff4d4f",
      background: "linear-gradient(135deg, #fff1f0 0%, #ffffff 100%)",
    },
  ];

  const dateCellRender = (value: Dayjs) => {
    const sorted = getSortedAppointmentsForDate(value);
    if (!sorted.length) return null;

    const firstItem = sorted[0];

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? 3 : 4,
          paddingRight: 2,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: statusColor[firstItem.status],
            flex: "0 0 auto",
          }}
        />
        <Typography.Text
          type="secondary"
          style={{ fontSize: 9, lineHeight: 1, margin: 0 }}
        >
          {sorted.length}
          {!isMobile ? " คิว" : ""}
        </Typography.Text>
      </div>
    );
  };

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
            <CalendarDays size={16} />
            <Text type="secondary">ตารางนัดหมาย</Text>
          </Space>
        </Space>

        <Row gutter={[16, 16]}>
          {summaryCards.map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.key}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 16,
                  background: item.background,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
                styles={{ body: { padding: 20 } }}
              >
                <Text type="secondary">{item.title}</Text>
                <Title level={3} style={{ margin: "8px 0 0", color: item.accent }}>
                  {item.value}
                </Title>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]}>
          <Col xs={24} xl={13}>
            <Card
              variant="borderless"
              style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
              styles={{ body: { padding: 16 } }}
              title={
                <Space size={8}>
                  <CalendarDays size={18} />
                  <span>ปฏิทินนัดหมาย</span>
                </Space>
              }
            >
              <Calendar
                className="appointment-calendar appointment-calendar-month"
                fullscreen={false}
                mode="month"
                value={selectedDate}
                onSelect={setSelectedDate}
                onPanelChange={(value) => setViewMonth(value)}
                headerRender={({ value, onChange }) => {
                  const prevMonth = value.subtract(1, "month");
                  const nextMonth = value.add(1, "month");

                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<ChevronLeft size={14} />}
                        onClick={() => onChange(prevMonth)}
                      />
                      <Typography.Text strong>
                        {formatThaiMonthYear(value)}
                      </Typography.Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<ChevronRight size={14} />}
                        onClick={() => onChange(nextMonth)}
                      />
                    </div>
                  );
                }}
                cellRender={(value, info) => {
                  if (info.type === "date") return dateCellRender(value);
                  return info.originNode;
                }}
              />

              <Space size={10} wrap style={{ marginTop: 10 }}>
                <Space size={4}>
                  <Badge color="blue" />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {appointmentStatusLabel[Status.Scheduled]}
                  </Typography.Text>
                </Space>
                <Space size={4}>
                  <Badge color="green" />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {appointmentStatusLabel[Status.Completed]}
                  </Typography.Text>
                </Space>
                <Space size={4}>
                  <Badge color="red" />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {appointmentStatusLabel[Status.Cancelled]}
                  </Typography.Text>
                </Space>
                <Space size={4}>
                  <Badge color="orange" />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {appointmentStatusLabel[Status.RequestCancel]}
                  </Typography.Text>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} xl={11}>
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              <Card
                variant="borderless"
                style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
                styles={{ body: { padding: 20 } }}
                title={<Text strong>เพิ่มการนัดหมาย</Text>}
              >
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  เลือกวันที่จากปฏิทินหรือกดปุ่มเพิ่มการนัดหมายเพื่อจองคิวใหม่ภายใน 3 เดือนข้างหน้า
                </Paragraph>
                <Space size={8} wrap>
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    style={{ borderRadius: 10 }}
                    onClick={() => {
                      const seedDate = selectedDate ?? dayjs();
                      resetNewAppointment(seedDate);
                      setIsCreateOpen(true);
                    }}
                  >
                    เพิ่มการนัดหมาย
                  </Button>
                  <Button
                    icon={<Clock3 size={14} />}
                    disabled={selectedDate.isSame(dayjs(), "date")}
                    style={{ borderRadius: 10 }}
                    onClick={() => {
                      const today = dayjs();
                      setSelectedDate(today);
                      setViewMonth(today);
                    }}
                  >
                    กลับมาวันนี้
                  </Button>
                  <Button
                    disabled={!nextAppointment}
                    style={{ borderRadius: 10 }}
                    onClick={() => {
                      if (!nextAppointment) return;
                      const nextDate = dayjs(nextAppointment.date);
                      setSelectedDate(nextDate);
                      setViewMonth(nextDate);
                    }}
                  >
                    นัดหมายถัดไป
                  </Button>
                </Space>
              </Card>

              <Card
                variant="borderless"
                style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
                styles={{ body: { padding: 20 } }}
                title={<Text strong>{`นัดหมายวันที่ ${formatThaiDateValue(selectedDate)}`}</Text>}
              >
                <Segmented
                  block
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as Status | "all")}
                  options={[
                    { label: "ทั้งหมด", value: "all" },
                    { label: appointmentStatusLabel[Status.Scheduled], value: Status.Scheduled },
                    { label: appointmentStatusLabel[Status.Completed], value: Status.Completed },
                    { label: appointmentStatusLabel[Status.Cancelled], value: Status.Cancelled },
                    { label: appointmentStatusLabel[Status.RequestCancel], value: Status.RequestCancel },
                  ]}
                  style={{ marginBottom: 16 }}
                />

                {selectedDateAppointments.length ? (
                  <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                    {selectedDateAppointments.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          borderRadius: 14,
                          padding: "14px 16px",
                          border: "1px solid rgba(0, 0, 0, 0.06)",
                          background: "#ffffff",
                        }}
                      >
                        <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                          <Space wrap>
                            <Tag color={statusColor[item.status]} style={{ borderRadius: 999 }}>
                              {appointmentStatusLabel[item.status]}
                            </Tag>
                            <Text strong>{item.time} น.</Text>
                          </Space>
                          <Space size={8}>
                            <Stethoscope size={14} color="#1677ff" />
                            <Text>{item.service}</Text>
                          </Space>
                          <Space size={8}>
                            <UserRound size={14} color="#8c8c8c" />
                            <Text type="secondary">{item.dentist}</Text>
                          </Space>
                        </Space>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="ไม่มีนัดหมายในวันที่เลือก"
                  />
                )}
              </Card>
            </Space>
          </Col>
        </Row>

        <Modal
          title={
            <Space orientation="vertical" size={2}>
              <Text strong style={{ fontSize: 20 }}>
                เพิ่มการนัดหมาย
              </Text>
              <Text type="secondary">
                เลือกวัน เวลา และบริการที่ต้องการจอง
              </Text>
            </Space>
          }
          open={isCreateOpen}
          onCancel={() => setIsCreateOpen(false)}
          onOk={handleAddAppointment}
          okText="บันทึกการนัดหมาย"
          cancelText="ยกเลิก"
          width={640}
          styles={{
            header: { padding: "20px 24px 8px" },
            body: { padding: "12px 24px 8px" },
            footer: { padding: "12px 24px 20px" },
          }}
          okButtonProps={{
            disabled:
              !newAppointmentDate ||
              !newAppointmentTime ||
              isPastDate(newAppointmentDate) ||
              newAppointmentDate.isAfter(maxAppointmentDate, "day"),
            style: { borderRadius: 10, fontWeight: 600 },
          }}
          cancelButtonProps={{ style: { borderRadius: 10 } }}
          destroyOnHidden
        >
          <Space orientation="vertical" size={18} style={{ width: "100%" }}>
            <div
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
                border: "1px solid rgba(22, 119, 255, 0.08)",
              }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                วันที่ที่เลือก
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {newAppointmentDate ? formatThaiDateValue(newAppointmentDate) : "ยังไม่ได้เลือกวันที่"}
              </Text>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                  <Typography.Text strong>เลือกวันที่ต้องการนัดหมาย</Typography.Text>
                  <DatePicker
                    size="large"
                    style={{ width: "100%", borderRadius: 10 }}
                    value={newAppointmentDate}
                    onChange={(value) => setNewAppointmentDate(value)}
                    format={(value) => (value ? formatThaiDateValue(value) : "")}
                    disabledDate={(current) =>
                      current
                        ? current.isBefore(dayjs(), "day") ||
                          current.isAfter(maxAppointmentDate, "day")
                        : false
                    }
                  />
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                  <Typography.Text strong>เลือกเวลา</Typography.Text>
                  <Select
                    size="large"
                    showSearch
                    placeholder={
                      !newAppointmentDate
                        ? "กรุณาเลือกวันที่ก่อน"
                        : availableSlots.length
                          ? "เลือกเวลา"
                          : "ไม่มีเวลาว่างในวันที่เลือก"
                    }
                    options={availableSlots.map((time) => ({
                      label: `${time} น.`,
                      value: time,
                    }))}
                    value={newAppointmentTime?.format("HH:mm")}
                    loading={loadingSlots}
                    disabled={!newAppointmentDate || !availableSlots.length}
                    onChange={(value) =>
                      setNewAppointmentTime(value ? dayjs(value, "HH:mm") : null)
                    }
                  />
                </Space>
              </Col>
            </Row>

            <Space orientation="vertical" size={6} style={{ width: "100%" }}>
              <Typography.Text strong>บริการ</Typography.Text>
              <Select
                size="large"
                showSearch
                placeholder="เลือกหรือพิมพ์บริการ"
                popupMatchSelectWidth={175}
                styles={{ popup: { root: { width: 320 } } }}
                options={serviceOptions}
                value={newAppointmentService || undefined}
                onChange={(value) => setNewAppointmentService(value)}
                onSearch={(value) => setNewAppointmentService(value)}
              />
              <Text type="secondary">
                สามารถพิมพ์ชื่อบริการเองได้ หากไม่พบในรายการที่มีอยู่
              </Text>
            </Space>
          </Space>
        </Modal>

        <style jsx global>{`
          .appointment-calendar {
            font-size: 0.92rem;
          }

          .appointment-calendar-month .ant-picker-content {
            table-layout: fixed;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-date {
            width: 100%;
            aspect-ratio: 1 / 1;
            min-height: 0;
            height: auto;
            box-sizing: border-box;
            overflow: hidden;
            padding: 0.18em 0.3em 0.95em;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-date
            .ant-picker-calendar-date-value {
            line-height: 1.2;
            margin-bottom: 0;
            position: relative;
            z-index: 1;
            font-size: 0.92em;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-date
            .ant-picker-calendar-date-content {
            height: 0.9em;
            margin-top: 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-month
            .ant-picker-calendar-date-value {
            line-height: 1.15;
            margin-bottom: 0.2em;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-month
            .ant-picker-calendar-date-content {
            height: auto !important;
            max-height: none !important;
            margin-top: 0.35em !important;
            display: block !important;
            overflow: visible !important;
          }

          @media (max-width: 767px) {
            .appointment-calendar {
              font-size: 0.95rem;
            }

            .appointment-calendar-month
              .ant-picker-cell-inner.ant-picker-calendar-date {
              aspect-ratio: 1 / 1;
              min-height: 0;
              padding: 0.2em 0.3em 0.95em;
            }

            .appointment-calendar-month
              .ant-picker-cell-inner.ant-picker-calendar-date
              .ant-picker-calendar-date-value {
              line-height: 1.3;
            }

            .appointment-calendar-month
              .ant-picker-cell-inner.ant-picker-calendar-date
              .ant-picker-calendar-date-content {
              height: 0.92em;
            }

            .appointment-calendar-month
              .ant-picker-cell-inner.ant-picker-calendar-month
              .ant-picker-calendar-date-content {
              margin-top: 0.3em !important;
            }
          }
        `}</style>
      </Space>
    </div>
  );
}
