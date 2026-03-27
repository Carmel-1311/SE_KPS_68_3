"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Button,
  Input,
  DatePicker,
  Space,
  Tooltip,
  message,
  Breadcrumb,
  Popconfirm,
  Tabs,
  Badge,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ReadOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

import { useMission, STATUS_META, TAB_STATUS } from "@/hook/useMission";
import type { MobileDental, MobileDentalStatus } from "@/hook/useMission";

const { Title, Text } = Typography;

// ---------------------------------------------------------------------------
// ปุ่มจัดการสถานะ
// ---------------------------------------------------------------------------

function ApproveButton({ id, onUpdate }: { id: number; onUpdate: (id: number, status: MobileDentalStatus) => void }) {
  return (
    <Tooltip title="อนุมัติ" placement="top">
      <Popconfirm
        title="ยืนยันการอนุมัติ"
        description="ต้องการอนุมัติการออกหน่วยใช่หรือไม่?"
        onConfirm={() => onUpdate(id, "scheduled")}
        okText="ยืนยัน"
        cancelText="ปิด"
      >
        <Button
          type="text"
          icon={<CheckCircleOutlined style={{ fontSize: 20, color: "#52c41a" }} />}
          style={{ padding: 0 }}
        />
      </Popconfirm>
    </Tooltip>
  );
}

function RejectButton({ id, onUpdate }: { id: number; onUpdate: (id: number, status: MobileDentalStatus) => void }) {
  return (
    <Tooltip title="ไม่อนุมัติ" placement="top">
      <Popconfirm
        title="ยืนยันการปฏิเสธ"
        description="ต้องการไม่อนุมัติการออกหน่วยใช่หรือไม่?"
        onConfirm={() => onUpdate(id, "cancel")}
        okText="ยืนยัน"
        cancelText="ปิด"
        okButtonProps={{ danger: true }}
      >
        <Button
          type="text"
          icon={<CloseCircleOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />}
          style={{ padding: 0 }}
        />
      </Popconfirm>
    </Tooltip>
  );
}

function ConfirmCancelButton({ id, onUpdate }: { id: number; onUpdate: (id: number, status: MobileDentalStatus) => void }) {
  return (
    <Popconfirm
      title="ยืนยันการยกเลิก"
      description="ต้องการอนุมัติการยกเลิกออกหน่วยใช่หรือไม่?"
      onConfirm={() => onUpdate(id, "cancel")}
      okText="ยืนยัน"
      cancelText="ปิด"
      okButtonProps={{ danger: true }}
    >
      <Button type="primary" danger size="small" style={{ borderRadius: 4 }}>
        ยืนยันยกเลิก
      </Button>
    </Popconfirm>
  );
}

// ---------------------------------------------------------------------------
// หน้าหลัก
// ---------------------------------------------------------------------------

export default function MissionPage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("1");

  const { data, loading, updateStatus, requestCancelCount } = useMission();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── ฟังก์ชันจัดการ ────────────────────────────────────────────────────────

  const handleUpdateStatus = async (id: number, status: MobileDentalStatus) => {
    try {
      await updateStatus(id, status);
      message.success(STATUS_META[status].label + "เรียบร้อยแล้ว");
    } catch {
      message.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  // ── กรองข้อมูล ────────────────────────────────────────────────────────────

  const filteredData = data.filter((item) => {
    if (item.status === "cancel") return false;
    if (item.status !== TAB_STATUS[activeTab]) return false;

    const matchSearch =
      !searchText || item.address.toLowerCase().includes(searchText.toLowerCase());
    const matchDate =
      !selectedDate || item.date.startsWith(selectedDate);

    return matchSearch && matchDate;
  });

  // ── คอลัมน์ตาราง ──────────────────────────────────────────────────────────

  const columns: ColumnsType<MobileDental> = [
    {
      title: "ลำดับ",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
    },
    {
      title: "วันที่ออกหน่วย",
      key: "date",
      width: 130,
      render: (_, record) => (
        <Text strong>{dayjs(record.date).format("DD/MM/YYYY")}</Text>
      ),
    },
    {
      title: "สถานที่",
      key: "address",
      render: (_, record) => <Text>{record.address || "-"}</Text>,
    },
    {
      title: "จำนวน (คน)",
      key: "count",
      width: 110,
      align: "center",
      render: (_, record) => <Text>{record.count}</Text>,
    },
    {
      title: "สถานะ",
      key: "status",
      width: 140,
      render: (_, record) => {
        const meta = STATUS_META[record.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="รายละเอียด" placement="top">
            <Link href={`/personnel/mission/${record.mobile_dental_id}`}>
              <Button
                type="text"
                icon={<ReadOutlined style={{ fontSize: 20, color: "#1890ff" }} />}
                style={{ padding: 0 }}
              />
            </Link>
          </Tooltip>

          {record.status === "request" && (
            <>
              <ApproveButton id={record.mobile_dental_id} onUpdate={handleUpdateStatus} />
              <RejectButton id={record.mobile_dental_id} onUpdate={handleUpdateStatus} />
            </>
          )}

          {record.status === "request_cancel" && (
            <ConfirmCancelButton id={record.mobile_dental_id} onUpdate={handleUpdateStatus} />
          )}
        </Space>
      ),
    },
  ];

  // ── รายการแท็บ ────────────────────────────────────────────────────────────

  const tabItems = [
    { key: "1", label: "รออนุมัติ" },
    { key: "2", label: "อนุมัติแล้ว" },
    { key: "3", label: "เสร็จสิ้น" },
    {
      key: "4",
      label: (
        <span>
          คำขอยกเลิกการออกหน่วย{" "}
          <Badge
            count={requestCancelCount}
            style={{ backgroundColor: "#ff4d4f", marginLeft: 4 }}
            offset={[0, -2]}
          />
        </span>
      ),
    },
  ];

  // ── แสดงผล ────────────────────────────────────────────────────────────────

  if (!isMounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" description="กำลังโหลดหน้าจอ..." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: 24, gap: 10 }}>
      <Breadcrumb
        style={{ marginBottom: 14, fontSize: 15 }}
        items={[
          {
            title: (
              <a onClick={() => router.push("/")}>
                <HomeOutlined /> หน้าหลัก
              </a>
            ),
          },
          {
            title: (
              <span>
                <EnvironmentOutlined /> ตารางการออกหน่วย
              </span>
            ),
          },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            ตารางการออกหน่วย
          </Title>
          <Text type="secondary">จัดการและตรวจสอบคิวการออกหน่วยทันตกรรมเคลื่อนที่</Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="ค้นหาสถานที่..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280, borderRadius: 8 }}
            allowClear
          />
          <DatePicker
            placeholder="เลือกวันที่ออกหน่วย"
            style={{ borderRadius: 8, width: 160 }}
            onChange={(_, dateString) =>
              setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)
            }
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="mobile_dental_id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          locale={{ emptyText: "ไม่พบข้อมูลในสถานะนี้" }}
        />
      </Card>
    </div>
  );
}
