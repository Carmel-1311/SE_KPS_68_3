"use client";

import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  Empty,
  Grid,
  Segmented,
  List,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { CalendarDays, Clock3, MapPin, Stethoscope } from "lucide-react";
import {
  appointmentStatusLabel,
  mockAppointments,
  type Appointment,
  type AppointmentStatus,
} from "@/mock/mockAppointment";

const statusColor: Record<AppointmentStatus, "blue" | "green" | "red"> = {
  upcoming: "blue",
  completed: "green",
  cancelled: "red",
};

const appointmentDateFormat = "YYYY-MM-DD";

const sortAppointmentsByTime = (items: Appointment[]) => {
  return [...items].sort((a, b) => a.time.localeCompare(b.time));
};

const sortAppointmentsByDateTime = (items: Appointment[]) => {
  return [...items].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
};

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
  const [panelMode, setPanelMode] = useState<"month" | "year">("month");
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

  const appointmentsByMonth = useMemo(() => {
    return mockAppointments.reduce<Record<string, Appointment[]>>(
      (acc, item) => {
        const monthKey = dayjs(item.date).format("YYYY-MM");
        acc[monthKey] ??= [];
        acc[monthKey].push(item);
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

  const selectedMonthAppointments = useMemo(() => {
    const monthKey = selectedDate.format("YYYY-MM");
    const items = appointmentsByMonth[monthKey] ?? [];
    const filtered = filterAppointmentsByStatus(items, statusFilter);
    return sortAppointmentsByDateTime(filtered);
  }, [appointmentsByMonth, selectedDate, statusFilter]);

  const summary = useMemo(() => {
    const viewKey =
      panelMode === "year"
        ? viewMonth.format("YYYY")
        : viewMonth.format("YYYY-MM");

    return mockAppointments
      .filter((item) => item.date.startsWith(viewKey))
      .reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        {
          upcoming: 0,
          completed: 0,
          cancelled: 0,
        } satisfies Record<AppointmentStatus, number>,
      );
  }, [panelMode, viewMonth]);

  const summaryTitle =
    panelMode === "year"
      ? `ข้อมูลปี ${viewMonth.format("YYYY")}`
      : `ข้อมูลเดือน ${viewMonth.format("MM/YYYY")}`;

  const appointmentCardTitle =
    panelMode === "year"
      ? `นัดหมายเดือน ${selectedDate.format("MM/YYYY")}`
      : `นัดหมายวันที่ ${selectedDate.format("DD/MM/YYYY")}`;

  const appointmentListData =
    panelMode === "year" ? selectedMonthAppointments : selectedDateAppointments;

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

  const monthCellRender = (value: Dayjs) => {
    const monthKey = value.format("YYYY-MM");
    const monthItems = appointmentsByMonth[monthKey] ?? [];
    if (!monthItems.length) return null;
    const monthlySummary = monthItems.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      {
        upcoming: 0,
        completed: 0,
        cancelled: 0,
      } satisfies Record<AppointmentStatus, number>,
    );
    const monthlyRows = [
      { color: "blue", count: monthlySummary.upcoming },
      { color: "green", count: monthlySummary.completed },
      { color: "red", count: monthlySummary.cancelled },
    ].filter((row) => row.count > 0);

    return (
      <div
        style={{
          width: "100%",
          display: "grid",
          justifyContent: "center",
          gap: 1,
        }}
      >
        {monthlyRows.map((row) => (
          <div key={`${monthKey}-${row.color}`} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: row.color }} />
            <Typography.Text type="secondary" style={{ fontSize: 8, lineHeight: 1, margin: 0 }}>
              {row.count}
            </Typography.Text>
          </div>
        ))}
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
        direction="vertical"
        size={16}
        style={{ width: "100%", maxWidth: 1080, margin: "0 auto" }}
      >
        <Card
          title={
            <Space>
              <CalendarDays size={18} />
              <span>ตารางแสดงการนัดหมาย</span>
            </Space>
          }
          bodyStyle={{ padding: "1rem" }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Card size="small" title="สรุปสถานะ" bordered={false}>
                <Space
                  direction="vertical"
                  size={10}
                  style={{ width: "100%" }}
                  wrap
                >
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {summaryTitle}
                  </Typography.Text>
                  <Tag color="blue">
                    {appointmentStatusLabel.upcoming}: {summary.upcoming}
                  </Tag>
                  <Tag color="green">
                    {appointmentStatusLabel.completed}: {summary.completed}
                  </Tag>
                  <Tag color="red">
                    {appointmentStatusLabel.cancelled}: {summary.cancelled}
                  </Tag>
                </Space>
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
                      label: appointmentStatusLabel.upcoming,
                      value: "upcoming",
                    },
                    {
                      label: appointmentStatusLabel.completed,
                      value: "completed",
                    },
                    {
                      label: appointmentStatusLabel.cancelled,
                      value: "cancelled",
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
                          direction="vertical"
                          size={4}
                          style={{ width: "100%" }}
                        >
                          <Space wrap>
                            <Tag color={statusColor[item.status]}>
                              {appointmentStatusLabel[item.status]}
                            </Tag>
                            {panelMode === "year" && (
                              <Typography.Text type="secondary">
                                {dayjs(item.date).format("DD/MM/YYYY")}
                              </Typography.Text>
                            )}
                            <Typography.Text strong>
                              {item.time} น.
                            </Typography.Text>
                          </Space>
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
                    description={
                      panelMode === "year"
                        ? "ไม่มีนัดหมายในเดือนที่เลือก"
                        : "ไม่มีนัดหมายในวันที่เลือก"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}

                <Button
                  icon={<Clock3 size={14} />}
                  style={{ marginTop: 8 }}
                  disabled={selectedDate.isSame(dayjs(), "date")}
                  onClick={() => {
                    const today = dayjs();
                    setSelectedDate(today);
                    setViewMonth(today);
                  }}
                >
                  กลับมาวันนี้
                </Button>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Space
                direction="vertical"
                size={8}
                style={{
                  width: "100%",
                  maxWidth: panelMode === "year" ? 460 : 640,
                  margin: "0 auto",
                }}
              >
                <Calendar
                  className="appointment-calendar appointment-calendar-month"
                  fullscreen={false}
                  value={selectedDate}
                  onSelect={setSelectedDate}
                  onPanelChange={(value, mode) => {
                    setViewMonth(value);
                    setPanelMode(mode);
                  }}
                  cellRender={(value, info) => {
                    if (info.type === "date") return dateCellRender(value);
                    if (info.type === "month") return monthCellRender(value);
                    return info.originNode;
                  }}
                />
                <Space size={12} wrap>
                  <Space size={4}>
                    <Badge color="blue" />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {appointmentStatusLabel.upcoming}
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
