"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  Divider,
  Empty,
  Grid,
  Segmented,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Stethoscope,
} from "lucide-react";
import {
  mockAppointmentList,
  type Data,
  Status,
} from "@/mock/mockAppointmentById";

type Appointment = {
  id: string;
  date: string;
  time: string;
  service: string;
  dentist: string;
  status: Status;
};

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

const appointmentDateFormat = "YYYY-MM-DD";
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
const formatThaiDate = (dateValue: string) => {
  const date = dayjs(dateValue);
  if (!date.isValid()) return dateValue;
  return formatThaiDateValue(date);
};
const formatThaiMonthYear = (value: Dayjs) =>
  `${thaiMonthsShort[value.month()]} ${value.format("YYYY")}`;

const storageKey = "userAppointments";

const toAppointmentId = (item: Data) => {
  const dateKey = item.appointment_date.replaceAll("-", "");
  const seq = String(item.appointment_id).padStart(3, "0");
  return `AP-${dateKey}-${seq}`;
};

const mapToAppointment = (item: Data): Appointment => ({
  id: toAppointmentId(item),
  date: item.appointment_date,
  time: item.appointment_time,
  service: item.type,
  dentist: item.staff?.name ?? "ไม่ระบุ",
  status: item.status,
});

const mergeAppointments = (base: Appointment[], extra: Appointment[]) => {
  const map = new Map<string, Appointment>();
  base.forEach((item) => map.set(item.id, item));
  extra.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};
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

const sortAppointmentsByTime = (items: Appointment[]) => {
  return [...items].sort((a, b) => a.time.localeCompare(b.time));
};

const getAppointmentDateTimeValue = (item: Appointment) =>
  dayjs(`${item.date}T${item.time}`).valueOf();

const filterAppointmentsByStatus = (
  items: Appointment[],
  statusFilter: Status | "all",
) => {
  if (statusFilter === "all") return items;
  return items.filter((item) => item.status === statusFilter);
};

export default function UserAppointmentSchedulePage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [appointments, setAppointments] = useState<Appointment[]>(
    mockAppointmentList.map(mapToAppointment),
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMonth, setViewMonth] = useState<Dayjs>(dayjs());
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  useEffect(() => {
    const stored = readStoredAppointments();
    setAppointments((prev) => mergeAppointments(prev, stored));
  }, []);

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, item) => {
      acc[item.date] ??= [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [appointments]);

  const selectedDateKey = selectedDate.format(appointmentDateFormat);
  const selectedDateAppointments = useMemo(() => {
    const items = appointmentsByDate[selectedDateKey] ?? [];
    const filtered = filterAppointmentsByStatus(items, statusFilter);
    return sortAppointmentsByTime(filtered);
  }, [appointmentsByDate, selectedDateKey, statusFilter]);

  const upcomingAppointments = useMemo(() => {
    const nowValue = dayjs().valueOf();
    return appointments
      .filter((item) => item.status === Status.Scheduled)
      .map((item) => ({ item, timeValue: getAppointmentDateTimeValue(item) }))
      .filter(({ timeValue }) => timeValue >= nowValue)
      .sort((a, b) => a.timeValue - b.timeValue)
      .map(({ item }) => item);
  }, [appointments]);

  const nextAppointment = upcomingAppointments[0];

  const summary = useMemo(() => {
    const viewKey = viewMonth.format("YYYY-MM");

    return appointments
      .filter((item) => item.date.startsWith(viewKey))
      .reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        {
          [Status.Scheduled]: 0,
          [Status.Completed]: 0,
          [Status.Cancelled]: 0,
          [Status.RequestCancel]: 0,
        } satisfies Record<Status, number>,
      );
  }, [viewMonth, appointments]);
  const summaryTotal =
    summary[Status.Scheduled] +
    summary[Status.Completed] +
    summary[Status.Cancelled] +
    summary[Status.RequestCancel];

  const summaryTitle = `ข้อมูลเดือน ${formatThaiMonthYear(viewMonth)}`;

  const appointmentCardTitle = `นัดหมายวันที่ ${formatThaiDateValue(
    selectedDate,
  )}`;

  const appointmentListData = selectedDateAppointments;

  const dateCellRender = (value: Dayjs) => {
    const items = appointmentsByDate[value.format(appointmentDateFormat)] ?? [];
    if (!items.length) return null;
    const sorted = sortAppointmentsByTime(items);
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 12px",
      }}
    >
      <Space
        orientation="vertical"
        size={16}
        style={{ width: "100%", maxWidth: 1080, margin: "0 auto" }}
      >
        <Card
          title={
            <Space>
              <CalendarDays size={18} />
              <span>ตารางแสดงการนัดหมาย</span>
              <Tag color="default">{formatThaiDateValue(selectedDate)}</Tag>
            </Space>
          }
          extra={
            <Link href="/user/appointment-schedule/new">
              <Button type="primary">เพิ่มการนัดหมาย</Button>
            </Link>
          }
          styles={{ body: { padding: "1rem" } }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Card size="small" title="สรุปสถานะ" variant="borderless">
                <Space
                  orientation="vertical"
                  size={12}
                  style={{ width: "100%" }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {summaryTitle}
                  </Typography.Text>
                  <Row gutter={[8, 8]}>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="ทั้งหมด"
                        value={summaryTotal}
                        styles={{ content: { fontSize: 20 } }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel[Status.Scheduled]}
                        value={summary[Status.Scheduled]}
                        styles={{ content: { color: "#1677ff", fontSize: 18 } }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel[Status.Completed]}
                        value={summary[Status.Completed]}
                        styles={{ content: { color: "#52c41a", fontSize: 18 } }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel[Status.Cancelled]}
                        value={summary[Status.Cancelled]}
                        styles={{ content: { color: "#ff4d4f", fontSize: 18 } }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel[Status.RequestCancel]}
                        value={summary[Status.RequestCancel]}
                        styles={{ content: { color: "#fa8c16", fontSize: 18 } }}
                      />
                    </Col>
                  </Row>
                  <Space size={8} wrap>
                    <Tag color="blue">
                      {appointmentStatusLabel[Status.Scheduled]}:{" "}
                      {summary[Status.Scheduled]}
                    </Tag>
                    <Tag color="green">
                      {appointmentStatusLabel[Status.Completed]}:{" "}
                      {summary[Status.Completed]}
                    </Tag>
                    <Tag color="red">
                      {appointmentStatusLabel[Status.Cancelled]}:{" "}
                      {summary[Status.Cancelled]}
                    </Tag>
                    <Tag color="orange">
                      {appointmentStatusLabel[Status.RequestCancel]}:{" "}
                      {summary[Status.RequestCancel]}
                    </Tag>
                  </Space>
                </Space>
              </Card>

              <Card
                size="small"
                title="นัดหมายถัดไป"
                style={{ marginTop: 12 }}
                variant="borderless"
              >
                {nextAppointment ? (
                  <Space
                    orientation="vertical"
                    size={6}
                    style={{ width: "100%" }}
                  >
                    <Space wrap>
                      <Tag color="blue">
                        {appointmentStatusLabel[Status.Scheduled]}
                      </Tag>
                      <Typography.Text strong>
                        {formatThaiDate(nextAppointment.date)} •{" "}
                        {nextAppointment.time} น.
                      </Typography.Text>
                    </Space>
                    <Space size={6}>
                      <Stethoscope size={14} />
                      <Typography.Text>
                        {nextAppointment.service}
                      </Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      ทันตแพทย์: {nextAppointment.dentist}
                    </Typography.Text>
                    <Button
                      size="small"
                      onClick={() => {
                        const nextDate = dayjs(nextAppointment.date);
                        setSelectedDate(nextDate);
                        setViewMonth(nextDate);
                      }}
                    >
                      ไปยังนัดหมายถัดไป
                    </Button>
                  </Space>
                ) : (
                  <Empty
                    description="ไม่มีนัดหมายที่รออยู่"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>

              <Card
                size="small"
                title={appointmentCardTitle}
                style={{ marginTop: 12 }}
                variant="borderless"
              >
                <Segmented
                  block
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as Status | "all")}
                  options={[
                    { label: "ทั้งหมด", value: "all" },
                    {
                      label: appointmentStatusLabel[Status.Scheduled],
                      value: Status.Scheduled,
                    },
                    {
                      label: appointmentStatusLabel[Status.Completed],
                      value: Status.Completed,
                    },
                    {
                      label: appointmentStatusLabel[Status.Cancelled],
                      value: Status.Cancelled,
                    },
                    {
                      label: appointmentStatusLabel[Status.RequestCancel],
                      value: Status.RequestCancel,
                    },
                  ]}
                  style={{ marginBottom: 12 }}
                />

                {appointmentListData.length ? (
                  <Space
                    orientation="vertical"
                    size={12}
                    style={{ width: "100%" }}
                  >
                    {appointmentListData.map((item) => (
                      <div key={item.id} style={{ paddingInline: 0 }}>
                        <Space
                          orientation="vertical"
                          size={4}
                          style={{ width: "100%" }}
                        >
                          <Space wrap>
                            <Tag color={statusColor[item.status]}>
                              {appointmentStatusLabel[item.status]}
                            </Tag>
                            <Typography.Text strong>
                              {item.time} น.
                            </Typography.Text>
                          </Space>
                          <Divider style={{ margin: "4px 0" }} />
                          <Space size={6}>
                            <Stethoscope size={14} />
                            <Typography.Text>{item.service}</Typography.Text>
                          </Space>
                          <Space size={6}>
                            <Typography.Text type="secondary">
                              ทันตแพทย์: {item.dentist}
                            </Typography.Text>
                          </Space>
                        </Space>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Empty
                    description="ไม่มีนัดหมายในวันที่เลือก"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}

                <Space size={8} wrap style={{ marginTop: 8 }}>
                  <Button
                    icon={<Clock3 size={14} />}
                    disabled={selectedDate.isSame(dayjs(), "date")}
                    onClick={() => {
                      const today = dayjs();
                      setSelectedDate(today);
                      setViewMonth(today);
                    }}
                  >
                    กลับมาวันนี้
                  </Button>
                  <Button
                    type="default"
                    disabled={!nextAppointment}
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
            </Col>

            <Col xs={24} md={12}>
              <Space
                orientation="vertical"
                size={8}
                style={{
                  width: "100%",
                  maxWidth: 640,
                  margin: "0 auto",
                }}
              >
                <Calendar
                  className="appointment-calendar appointment-calendar-month"
                  fullscreen={false}
                  mode="month"
                  value={selectedDate}
                  onSelect={setSelectedDate}
                  onPanelChange={(value) => {
                    setViewMonth(value);
                  }}
                  headerRender={({ value, onChange }) => {
                    const prevMonth = value.subtract(1, "month");
                    const nextMonth = value.add(1, "month");
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
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
                <Space size={12} wrap>
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
              </Space>
            </Col>
          </Row>
        </Card>
        <style jsx global>{`
          .appointment-calendar {
            font-size: 1rem;
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
            padding: 0.25em 0.45em 1.25em;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-date
            .ant-picker-calendar-date-value {
            line-height: 1.35;
            margin-bottom: 0;
            position: relative;
            z-index: 1;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-date
            .ant-picker-calendar-date-content {
            height: 1.1em;
            margin-top: 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
          }

          .appointment-calendar-month
            .ant-picker-cell-inner.ant-picker-calendar-month
            .ant-picker-calendar-date-value {
            line-height: 1.25;
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
