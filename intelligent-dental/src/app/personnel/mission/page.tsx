"use client";

import React, { useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Popconfirm,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  ReadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

import { useMission, STATUS_META, TAB_STATUS } from "@/hook/useMission";
import type { MobileDental, MobileDentalStatus } from "@/hook/useMission";
import { createTablePagination } from "@/app/utils/tablePagination";

const { Title, Text } = Typography;

function ApproveButton({
  id,
  onUpdate,
}: {
  id: number;
  onUpdate: (id: number, status: MobileDentalStatus) => void;
}) {
  return (
    <Tooltip title="อนุมัติ">
      <Popconfirm
        title="ยืนยันการอนุมัติ"
        description="ต้องการอนุมัติการออกหน่วยใช่หรือไม่?"
        onConfirm={() => onUpdate(id, "scheduled")}
        okText="ยืนยัน"
        cancelText="ปิด"
      >
        <Button type="text" icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />} />
      </Popconfirm>
    </Tooltip>
  );
}

function RejectButton({
  id,
  onUpdate,
}: {
  id: number;
  onUpdate: (id: number, status: MobileDentalStatus) => void;
}) {
  return (
    <Tooltip title="ไม่อนุมัติ">
      <Popconfirm
        title="ยืนยันการปฏิเสธ"
        description="ต้องการไม่อนุมัติการออกหน่วยใช่หรือไม่?"
        onConfirm={() => onUpdate(id, "cancel")}
        okText="ยืนยัน"
        cancelText="ปิด"
        okButtonProps={{ danger: true }}
      >
        <Button type="text" icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />} />
      </Popconfirm>
    </Tooltip>
  );
}

function ConfirmCancelButton({
  id,
  onUpdate,
}: {
  id: number;
  onUpdate: (id: number, status: MobileDentalStatus) => void;
}) {
  return (
    <Popconfirm
      title="ยืนยันการยกเลิก"
      description="ต้องการอนุมัติการยกเลิกออกหน่วยใช่หรือไม่?"
      onConfirm={() => onUpdate(id, "cancel")}
      okText="ยืนยัน"
      cancelText="ปิด"
      okButtonProps={{ danger: true }}
    >
      <Button type="primary" danger size="small">
        ยืนยันยกเลิก
      </Button>
    </Popconfirm>
  );
}

export default function MissionPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  const { data, loading, updateStatus, requestCancelCount } = useMission();

  const handleUpdateStatus = async (
    id: number,
    status: MobileDentalStatus
  ) => {
    try {
      await updateStatus(id, status);
      message.success(`${STATUS_META[status].label}เรียบร้อยแล้ว`);
    } catch {
      message.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const filteredData = data.filter((item) => {
    if (item.status === "cancel") return false;
    if (item.status !== TAB_STATUS[activeTab]) return false;

    const matchSearch =
      !searchText ||
      item.address.toLowerCase().includes(searchText.toLowerCase());
    const matchDate = !selectedDate || item.date.startsWith(selectedDate);

    return matchSearch && matchDate;
  });

  const columns: ColumnsType<MobileDental> = [
    {
      title: "ลำดับ",
      key: "index",
      width: 70,
      align: "center",
      render: (_value, _record, index) => <Text strong>{index + 1}</Text>,
    },
    {
      title: "วันที่ออกหน่วย",
      key: "date",
      width: 140,
      render: (_value, record) => (
        <Text>{dayjs(record.date).format("DD/MM/YYYY")}</Text>
      ),
    },
    {
      title: "สถานที่",
      key: "address",
      render: (_value, record) => <Text strong>{record.address || "-"}</Text>,
    },
    {
      title: "จำนวนคน",
      key: "count",
      width: 110,
      align: "center",
      render: (_value, record) => <Text>{record.count}</Text>,
    },
    {
      title: "สถานะ",
      key: "status",
      width: 140,
      render: (_value, record) => {
        const meta = STATUS_META[record.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 170,
      render: (_value, record) => (
        <Space size="middle">
          <Tooltip title="รายละเอียด">
            <Link href={`/personnel/mission/${record.mobile_dental_id}`}>
              <Button type="text" icon={<ReadOutlined />} />
            </Link>
          </Tooltip>

          {record.status === "request" && (
            <>
              <ApproveButton
                id={record.mobile_dental_id}
                onUpdate={handleUpdateStatus}
              />
              <RejectButton
                id={record.mobile_dental_id}
                onUpdate={handleUpdateStatus}
              />
            </>
          )}

          {record.status === "request_cancel" && (
            <ConfirmCancelButton
              id={record.mobile_dental_id}
              onUpdate={handleUpdateStatus}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
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

      <Card style={{ marginTop: 16 }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          ตารางการออกหน่วย
        </Title>
        <Text type="secondary">
          จัดการและตรวจสอบคิวการออกหน่วยทันตกรรมเคลื่อนที่
        </Text>

        <Row gutter={16} style={{ marginTop: 16, marginBottom: 16 }}>
          <Col xs={24} md={12} lg={10}>
            <Input
              placeholder="ค้นหาสถานที่..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={8} lg={6}>
            <DatePicker
              placeholder="เลือกวันที่ออกหน่วย"
              style={{ width: "100%" }}
              onChange={(_value, dateString) =>
                setSelectedDate(
                  Array.isArray(dateString) ? dateString[0] : dateString
                )
              }
            />
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
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
          ]}
        />

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="mobile_dental_id"
          pagination={createTablePagination(10)}
          loading={loading}
          locale={{ emptyText: "ไม่พบข้อมูลในสถานะนี้" }}
        />
      </Card>
    </div>
  );
}
