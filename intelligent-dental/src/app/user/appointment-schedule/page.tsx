"use client";

import { useMemo, useState } from "react";
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
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Stethoscope,
} from "lucide-react";
import {
  appointmentStatusLabel,
  mockAppointments,
  type Appointment,
  type AppointmentStatus,
} from "@/mock/mockAppointment";

const statusColor: Record<
  AppointmentStatus,
  "blue" | "green" | "red" | "orange"
> = {
  scheduled: "blue",
  completed: "green",
  cancelled: "red",
  request_cancel: "orange",
};

const appointmentDateFormat = "YYYY-MM-DD";

const sortAppointmentsByTime = (items: Appointment[]) => {
  return [...items].sort((a, b) => a.time.localeCompare(b.time));
};

const getAppointmentDateTimeValue = (item: Appointment) =>
  dayjs(`${item.date}T${item.time}`).valueOf();

const filterAppointmentsByStatus = (
  items: Appointment[],
  statusFilter: AppointmentStatus | "all",
) => {
  if (statusFilter === "all") return items;
  return items.filter((item) => item.status === statusFilter);
};

export default function UserAppointmentSchedulePage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [viewMonth, setViewMonth] = useState<Dayjs>(dayjs());
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all",
  );

  const appointmentsByDate = useMemo(() => {
    return mockAppointments.reduce<Record<string, Appointment[]>>(
      (acc, item) => {
        acc[item.date] ??= [];
        acc[item.date].push(item);
        return acc;
      },
      {},
    );
  }, []);

  const selectedDateKey = selectedDate.format(appointmentDateFormat);
  const selectedDateAppointments = useMemo(() => {
    const items = appointmentsByDate[selectedDateKey] ?? [];
    const filtered = filterAppointmentsByStatus(items, statusFilter);
    return sortAppointmentsByTime(filtered);
  }, [appointmentsByDate, selectedDateKey, statusFilter]);

  const upcomingAppointments = useMemo(() => {
    const nowValue = dayjs().valueOf();
    return mockAppointments
      .filter((item) => item.status === "scheduled")
      .map((item) => ({ item, timeValue: getAppointmentDateTimeValue(item) }))
      .filter(({ timeValue }) => timeValue >= nowValue)
      .sort((a, b) => a.timeValue - b.timeValue)
      .map(({ item }) => item);
  }, []);

  const nextAppointment = upcomingAppointments[0];

  const summary = useMemo(() => {
    const viewKey = viewMonth.format("YYYY-MM");

    return mockAppointments
      .filter((item) => item.date.startsWith(viewKey))
      .reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        {
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          request_cancel: 0,
        } satisfies Record<AppointmentStatus, number>,
      );
  }, [viewMonth]);
  const summaryTotal =
    summary.scheduled + summary.completed + summary.cancelled + summary.request_cancel;

  const summaryTitle = `ข้อมูลเดือน ${viewMonth.format("MM/YYYY")}`;

  const appointmentCardTitle = `นัดหมายวันที่ ${selectedDate.format(
    "DD/MM/YYYY",
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
              <Tag color="default">{selectedDate.format("DD/MM/YYYY")}</Tag>
            </Space>
          }
          bodyStyle={{ padding: "1rem" }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Card size="small" title="สรุปสถานะ" bordered={false}>
                <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {summaryTitle}
                  </Typography.Text>
                  <Row gutter={[8, 8]}>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="ทั้งหมด"
                        value={summaryTotal}
                        valueStyle={{ fontSize: 20 }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel.scheduled}
                        value={summary.scheduled}
                        valueStyle={{ color: "#1677ff", fontSize: 18 }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel.completed}
                        value={summary.completed}
                        valueStyle={{ color: "#52c41a", fontSize: 18 }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel.cancelled}
                        value={summary.cancelled}
                        valueStyle={{ color: "#ff4d4f", fontSize: 18 }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title={appointmentStatusLabel.request_cancel}
                        value={summary.request_cancel}
                        valueStyle={{ color: "#fa8c16", fontSize: 18 }}
                      />
                    </Col>
                  </Row>
                  <Space size={8} wrap>
                    <Tag color="blue">
                      {appointmentStatusLabel.scheduled}: {summary.scheduled}
                    </Tag>
                    <Tag color="green">
                      {appointmentStatusLabel.completed}: {summary.completed}
                    </Tag>
                    <Tag color="red">
                      {appointmentStatusLabel.cancelled}: {summary.cancelled}
                    </Tag>
                    <Tag color="orange">
                      {appointmentStatusLabel.request_cancel}: {summary.request_cancel}
                    </Tag>
                  </Space>
                </Space>
              </Card>

              <Card
                size="small"
                title="นัดหมายถัดไป"
                style={{ marginTop: 12 }}
                bordered={false}
              >
                {nextAppointment ? (
                  <Space
                    orientation="vertical"
                    size={6}
                    style={{ width: "100%" }}
                  >
                    <Space wrap>
                      <Tag color="blue">
                        {appointmentStatusLabel.scheduled}
                      </Tag>
                      <Typography.Text strong>
                        {dayjs(nextAppointment.date).format("DD/MM/YYYY")} •{" "}
                        {nextAppointment.time} น.
                      </Typography.Text>
                    </Space>
                    <Space size={6}>
                      <Stethoscope size={14} />
                      <Typography.Text>{nextAppointment.service}</Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      ทันตแพทย์: {nextAppointment.dentist}
                    </Typography.Text>
                    <Space size={6}>
                      <MapPin size={14} />
                      <Typography.Text type="secondary">
                        {nextAppointment.branch}
                      </Typography.Text>
                    </Space>
                    {nextAppointment.note && (
                      <Typography.Text type="secondary">
                        หมายเหตุ: {nextAppointment.note}
                      </Typography.Text>
                    )}
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
                bordered={false}
              >
                <Segmented
                  block
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter(value as AppointmentStatus | "all")
                  }
                  options={[
                    { label: "ทั้งหมด", value: "all" },
                    {
                      label: appointmentStatusLabel.scheduled,
                      value: "scheduled",
                    },
                    {
                      label: appointmentStatusLabel.completed,
                      value: "completed",
                    },
                    {
                      label: appointmentStatusLabel.cancelled,
                      value: "cancelled",
                    },
                    {
                      label: appointmentStatusLabel.request_cancel,
                      value: "request_cancel",
                    },
                  ]}
                  style={{ marginBottom: 12 }}
                />

                {appointmentListData.length ? (
                  <List
                    dataSource={appointmentListData}
                    renderItem={(item) => (
                      <List.Item key={item.id} style={{ paddingInline: 0 }}>
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
                          <Space size={6}>
                            <MapPin size={14} />
                            <Typography.Text type="secondary">
                              {item.branch}
                            </Typography.Text>
                          </Space>
                          {item.note && (
                            <Typography.Text type="secondary">
                              หมายเหตุ: {item.note}
                            </Typography.Text>
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
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
                          {value.format("MMMM YYYY")}
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
                      {appointmentStatusLabel.scheduled}
                    </Typography.Text>
                  </Space>
                  <Space size={4}>
                    <Badge color="green" />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {appointmentStatusLabel.completed}
                    </Typography.Text>
                  </Space>
                  <Space size={4}>
                    <Badge color="red" />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {appointmentStatusLabel.cancelled}
                    </Typography.Text>
                  </Space>
                  <Space size={4}>
                    <Badge color="orange" />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {appointmentStatusLabel.request_cancel}
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
