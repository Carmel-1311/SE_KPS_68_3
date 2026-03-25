"use client";

import {
  Button,
  Card,
  Space,
  Table,
  Typography,
  Breadcrumb,
  Tag,
  Select,
} from "antd";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  HomeOutlined,
  CalendarOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useWorkSchedule } from "@/hook/useWorkSchedule";

const { Title, Text } = Typography;

const TIME_SLOTS = [
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
];

const DAYS = [
  { key: "Mon", label: "จันทร์" },
  { key: "Tue", label: "อังคาร" },
  { key: "Wed", label: "พุธ" },
  { key: "Thu", label: "พฤหัสบดี" },
  { key: "Fri", label: "ศุกร์" },
  { key: "Sat", label: "เสาร์" },
  { key: "Sun", label: "อาทิตย์" },
];

export default function DentistWorkSchedulePage() {
  const router = useRouter();
  const { data: allData, loading } = useWorkSchedule();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  // 🔥 clean name
  const cleanName = (name?: string) =>
    name?.replace("null ", "") || "";

  // =========================
  // staff filter
  // =========================
  const staffOptions = useMemo(() => {
    const map = new Map();

    allData.forEach((item) => {
      const id = Number(item.staff?.id);
      if (!map.has(id)) map.set(id, item);
    });

    return Array.from(map.values()).map((item) => ({
      value: Number(item.staff?.id),
      label: cleanName(item.staff?.name)
        ? `ทพ. ${cleanName(item.staff?.name)}`
        : `แพทย์ ID: ${item.staff?.id}`,
    }));
  }, [allData]);

  const filteredData = useMemo(() => {
    if (!selectedStaffId) return [];
    return allData.filter(
      (item) => Number(item.staff?.id) === selectedStaffId
    );
  }, [allData, selectedStaffId]);

  // =========================
  // matrix
  // =========================
  const tableData = useMemo(() => {
    const matrix: Record<string, any[]> = {};

    DAYS.forEach((d) => {
      matrix[d.key] = Array(TIME_SLOTS.length)
        .fill(null)
        .map(() => ({ type: "empty", span: 1 }));
    });

    filteredData.forEach((sched) => {
      const day = sched.date;

      const startHour = parseInt(sched.start_time.split(":")[0]);
      const endHour = parseInt(sched.end_time.split(":")[0]);

      const startIndex = TIME_SLOTS.findIndex((s) => s.start === startHour);
      const endIndex = TIME_SLOTS.findIndex((s) => s.end === endHour);

      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        const span = endIndex - startIndex + 1;

        matrix[day][startIndex] = {
          type: "start",
          schedule: sched,
          span,
        };

        for (let i = startIndex + 1; i <= endIndex; i++) {
          matrix[day][i] = { type: "span", span: 0 };
        }
      }
    });

    return TIME_SLOTS.map((slot, index) => {
      const row: any = { key: slot.label, time: slot.label };
      DAYS.forEach((d) => {
        row[d.key] = matrix[d.key][index];
      });
      return row;
    });
  }, [filteredData]);

  // =========================
  // style
  // =========================
  const getStatusStyles = (isActive: boolean) =>
    isActive
      ? {
          bg: "#e6f7ff",
          border: "#1890ff",
          text: "#0050b3",
          label: "ลงตรวจ",
          tagColor: "blue",
        }
      : {
          bg: "#fff2f0",
          border: "#ff4d4f",
          text: "#cf1322",
          label: "งดตรวจ",
          tagColor: "error",
        };

  // =========================
  // columns
  // =========================
  const columns: any = [
    {
      title: "เวลา",
      dataIndex: "time",
      width: 110,
      align: "center",
      render: (text: string) => (
        <div style={{ fontWeight: 600 }}>{text}</div>
      ),
    },

    ...DAYS.map((day) => ({
      title: day.label,
      dataIndex: day.key,

      render: (cellData: any) => {
        if (!cellData || cellData.type === "empty")
          return { children: null, props: { rowSpan: 1 } };

        if (cellData.type === "span")
          return { children: null, props: { rowSpan: 0 } };

        const sched = cellData.schedule;
        const styles = getStatusStyles(sched.is_active ?? true);

        const name = cleanName(sched.staff?.name);

        return {
          children: (
            <div
              onClick={() =>
                router.push(`/personnel/work-schedule/${sched.id}`)
              }
              style={{
                background: "linear-gradient(135deg,#e6f7ff,#fff)",
                borderLeft: `4px solid ${styles.border}`,
                borderRadius: 10,
                padding: 12,
                minHeight: `${cellData.span * 70}px`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                <ClockCircleOutlined />{" "}
                {sched.start_time.slice(0, 5)} -{" "}
                {sched.end_time.slice(0, 5)}
              </div>

              <div style={{ marginTop: 6, fontWeight: 600 }}>
                <UserOutlined />{" "}
                {name ? `ทพ. ${name}` : `ID: ${sched.staff?.id}`}
              </div>

              <div style={{ fontSize: 12, color: "#666" }}>
                <IdcardOutlined /> {sched.staff?.role}
              </div>

              <Tag color={styles.tagColor} style={{ marginTop: 8 }}>
                {styles.label}
              </Tag>
            </div>
          ),
          props: { rowSpan: cellData.span },
        };
      },
    })),
  ];

  return (
    <div
      style={{
        padding: 24,
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <HomeOutlined /> },
          { title: "ตารางการทำงาน" },
        ]}
      />

      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <Title level={3}>ตารางการทำงาน</Title>
            <Text type="secondary">
              ตารางเวลาการทำงานของทันตแพทย์
            </Text>
          </div>

          <Space>
            <Select
              showSearch
              placeholder="🔍 ค้นหาทันตแพทย์..."
              style={{ width: 260 }}
              onChange={(v) => setSelectedStaffId(v)}
              options={staffOptions}
              allowClear
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
            >
              เพิ่มเวลาทำงาน
            </Button>
          </Space>
        </div>

        <Table
          rowKey="key"
          loading={loading}
          pagination={false}
          dataSource={tableData}
          columns={columns}
          bordered
        />
      </Card>
    </div>
  );
}