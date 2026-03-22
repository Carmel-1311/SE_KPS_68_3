"use client";

import React, { useState, useEffect } from "react";
import {
  Table, Tag, Card, Typography, Button, Input, DatePicker,
  Space, Tooltip, message, Breadcrumb, Popconfirm, Tabs, Badge, Spin
} from "antd";
import {
  SearchOutlined, ReadOutlined,
  HomeOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

// ✅ import hook และ type แทนที่จะเขียน interface เอง
import { useMission, STATUS_META, TAB_STATUS } from "@/hook/useMission";
import type { MobileDental, MobileDentalStatus } from "@/hook/useMission";

const { Title, Text } = Typography;

export default function MissionPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("1");

  // ✅ ใช้ hook แทน fetchMissions + useState ทั้งหมด
  const { data, loading, updateStatus, requestCancelCount } = useMission();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ handler ใช้ updateStatus จาก hook
  const handleUpdateStatus = async (id: number, status: MobileDentalStatus) => {
    try {
      await updateStatus(id, status);
      message.success(STATUS_META[status].label + "เรียบร้อยแล้ว");
    } catch {
      message.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  // ✅ filter ใช้ TAB_STATUS map แทน if-else เรียง status number
  const finalFilteredData = data.filter((item) => {
    if (item.status === "cancel") return false;

    const tabStatus = TAB_STATUS[activeTab];
    if (item.status !== tabStatus) return false;

    const matchSearch =
      !searchText ||
      item.address.toLowerCase().includes(searchText.toLowerCase());

    const matchDate =
      !selectedDate || item.date.startsWith(selectedDate);

    return matchSearch && matchDate;
  });

  // ✅ columns ใช้ field จาก API จริง (mobile_dental_id, date, status)
  const columns: ColumnsType<MobileDental> = [
    {
      title: "ลำดับ", key: "index", width: 60, align: "center",
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
    },
    {
      title: "วันที่ออกหน่วย", key: "date", width: 130,
      render: (_, record) => (
        <Text strong>{dayjs(record.date).format("DD/MM/YYYY")}</Text>
      ),
    },
    {
      title: "สถานที่", key: "address",
      render: (_, record) => <Text>{record.address || "-"}</Text>,
    },
    {
      title: "จำนวน (คน)", key: "count", width: 110, align: "center",
      render: (_, record) => <Text>{record.count}</Text>,
    },
    {
      title: "สถานะ", key: "status", width: 140,
      render: (_, record) => {
        const meta = STATUS_META[record.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "จัดการ", key: "action", align: "center", width: 160,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="รายละเอียด" placement="top">
            {/* ✅ ใช้ mobile_dental_id แทน id */}
            <Link href={`/personnel/mission/${record.mobile_dental_id}`}>
              <Button
                type="text"
                icon={<ReadOutlined style={{ fontSize: "20px", color: "#1890ff" }} />}
                style={{ padding: 0 }}
              />
            </Link>
          </Tooltip>

          {record.status === "request" && (
            <>
              <Tooltip title="อนุมัติ" placement="top">
                <Popconfirm
                  title="ยืนยันการอนุมัติ"
                  description="ต้องการอนุมัติการออกหน่วยใช่หรือไม่?"
                  onConfirm={() => handleUpdateStatus(record.mobile_dental_id, "scheduled")}
                  okText="ยืนยัน" cancelText="ปิด"
                >
                  <Button
                    type="text"
                    icon={<CheckCircleOutlined style={{ fontSize: "20px", color: "#52c41a" }} />}
                    style={{ padding: 0 }}
                  />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="ไม่อนุมัติ" placement="top">
                <Popconfirm
                  title="ยืนยันการปฏิเสธ"
                  description="ต้องการไม่อนุมัติการออกหน่วยใช่หรือไม่?"
                  onConfirm={() => handleUpdateStatus(record.mobile_dental_id, "cancel")}
                  okText="ยืนยัน" cancelText="ปิด"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    icon={<CloseCircleOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />}
                    style={{ padding: 0 }}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}

          {record.status === "request_cancel" && (
            <Popconfirm
              title="ยืนยันการยกเลิก"
              description="ต้องการอนุมัติการยกเลิกออกหน่วยใช่หรือไม่?"
              onConfirm={() => handleUpdateStatus(record.mobile_dental_id, "cancel")}
              okText="ยืนยัน" cancelText="ปิด"
              okButtonProps={{ danger: true }}
            >
              <Button type="primary" danger size="small" style={{ borderRadius: "4px" }}>
                ยืนยันยกเลิก
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "1", label: "รออนุมัติ" },
    { key: "2", label: "อนุมัติแล้ว" },
    { key: "3", label: "เสร็จสิ้น" },
    {
      key: "4",
      label: (
        <span>
          คำขอยกเลิกการออกหน่วย{" "}
          {/* ✅ requestCancelCount มาจาก hook โดยตรง */}
          <Badge
            count={requestCancelCount}
            style={{ backgroundColor: "#ff4d4f", marginLeft: 4 }}
            offset={[0, -2]}
          />
        </span>
      ),
    },
  ];

  if (!isMounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" description="กำลังโหลดหน้าจอ..." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "24px", gap: "10px" }}>
      <Breadcrumb
        style={{ marginBottom: "14px", fontSize: "15px" }}
        items={[
          { title: <a onClick={() => router.push("/")}><HomeOutlined /> หน้าหลัก</a> },
          { title: <span><EnvironmentOutlined /> ตารางการออกหน่วย</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการออกหน่วย</Title>
            <Text type="secondary">จัดการและตรวจสอบคิวการออกหน่วยทันตกรรมเคลื่อนที่</Text>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: "16px" }} />

        <div style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Input
            placeholder="ค้นหาสถานที่..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280, borderRadius: "8px" }}
            allowClear
          />
          <DatePicker
            placeholder="เลือกวันที่ออกหน่วย"
            style={{ borderRadius: "8px", width: 160 }}
            onChange={(_, dateString) =>
              setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)
            }
          />
        </div>

        <Table
          columns={columns}
          dataSource={finalFilteredData}
          rowKey="mobile_dental_id"  
          pagination={{ pageSize: 10 }}
          loading={loading}
          locale={{ emptyText: "ไม่พบข้อมูลในสถานะนี้" }}
        />
      </Card>
    </div>
  );
}