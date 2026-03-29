"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { withAuthHeaders } from "@/app/utils/auth.client";

import {
  Table,
  Card,
  Typography,
  Input,
  Space,
  Button,
  Tag,
  Spin,
  Breadcrumb
} from "antd";

import {
  ArrowLeftOutlined,
  SearchOutlined,
  ReadOutlined,
  HomeOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function MobilePatientsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ✅ pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 👉 fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/mobile_dentals/${id}/patients`,
        { headers: withAuthHeaders() }
      );

      if (!res.ok) {
        setPatients([]);
        return;
      }

      const data = await res.json();
      setPatients(data.data || data || []);
    } catch (err) {
      console.error("fetch mobile patients error:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPatients();
  }, [id]);

  // 👉 search filter
  const filtered = patients.filter((p) => {
    return (
      p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.idcard?.toString().includes(searchText)
    );
  });

  const columns = [
    // ✅ ลำดับ (ต่อเนื่องตามหน้า)
    {
      title: "ลำดับ",
      key: "index",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },

    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },

    { title: "เบอร์โทร", dataIndex: "phone", key: "phone" },

    { title: "เลขบัตรประชาชน", dataIndex: "idcard", key: "idcard" },

    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "active" ? "green" : "orange"}>
          {s || "-"}
        </Tag>
      ),
    },

    // ✅ สถานะการตรวจ
    {
      title: "สถานะการตรวจ",
      key: "inspection",
      render: (_: any, record: any) =>
        record.inspection_id ? (
          <Tag color="green">ตรวจแล้ว</Tag>
        ) : (
          <Tag color="orange">ยังไม่ตรวจ</Tag>
        ),
    },

    {
      title: "จัดการ",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: any) => {
        if (record.inspection_id) {
          return null;
        }

        return (
          <Button
            type="text"
            icon={<ReadOutlined style={{ fontSize: 18, color: "#1890ff" }} />}
            onClick={() =>
              router.push(
                `/dentist/patients/mobile_dental/${record.id}/patients/${record.patient_id}`
              )
            }
          />
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: (
              <a onClick={() => router.push("/dentist/work-schedule")}>
                <HomeOutlined /> หน้าหลัก
              </a>
            ),
          },
          {
            title: (
              <a onClick={() => router.push("/dentist/patients")}>
                <TeamOutlined /> ผู้ป่วย
              </a>
            ),
          },
          {
            title: "ผู้ป่วยนอกสถานที่",
          },
        ]}
      />

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              🚑 รายชื่อผู้ป่วย (Mobile Dental)
            </Title>
            <Text type="secondary">
              หน่วย ID: {id}
            </Text>
          </div>

          <Space>
            <Input
              placeholder="ค้นหาชื่อ / เลขบัตร"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPagination({ ...pagination, current: 1 }); // 🔥 reset page ตอน search
              }}
              allowClear
            />

            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
            >
              ย้อนกลับ
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="patient_id"
            pagination={pagination}
            onChange={(p) =>
              setPagination({
                current: p.current || 1,
                pageSize: p.pageSize || 10,
              })
            }
          />
        </Spin>
      </Card>
    </div>
  );
}