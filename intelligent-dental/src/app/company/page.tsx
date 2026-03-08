"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Divider,
  Table,
  Empty,
  Tag,
  Alert,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";

import { getMobileDentalRequests, MobileDentalRequest } from "@/api/companyApi";
import { getCurrentCompanyId } from "@/mock/mockUser";

const { Title, Text } = Typography;

type Status =
  | "request"
  | "scheduled"
  | "completed"
  | "request_cancel"
  | "cancel";

const statusConfig: Record<Status, { color: string; label: string }> = {
  request: { color: "blue", label: "รอดำเนินการ" },
  scheduled: { color: "green", label: "นัดหมายแล้ว" },
  completed: { color: "default", label: "เสร็จสิ้น" },
  request_cancel: { color: "orange", label: "แจ้งขอยกเลิก" },
  cancel: { color: "red", label: "ยกเลิกแล้ว" },
};

export default function CompanyDashboard() {
  const router = useRouter();

  const [data, setData] = useState<MobileDentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyId = getCurrentCompanyId();
        const result = await getMobileDentalRequests(companyId);
        setData(result ?? []);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // statistics
  const totalRequests = data.length;

  const pendingRequests = useMemo(
    () => data.filter(d => d.status === "request").length,
    [data]
  );

  const approvedRequests = useMemo(
    () => data.filter(d => d.status === "scheduled").length,
    [data]
  );

  // recent requests
  const recentRequests = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [data]);

  // table columns
  const columns: ColumnsType<MobileDentalRequest> = [
    {
      title: "รหัสคำขอ",
      dataIndex: "mobile_dental_id",
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: "สถานที่",
      dataIndex: "address",
      render: (value?: string) => value ?? "-",
    },
    {
      title: "วันที่",
      dataIndex: "date",
    },
    {
      title: "จำนวนผู้ป่วย",
      dataIndex: "count",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      render: (status: Status) => {
        const config =
          statusConfig[status] ?? { color: "default", label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            หน้าหลักหน่วยงานภายนอก
          </Title>
          <Text type="secondary">ภาพรวมการขอออกหน่วยตรวจฟัน</Text>
        </Col>
      </Row>

      <Divider />

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message="เกิดข้อผิดพลาด"
          description={error}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Empty */}
      {!loading && !error && data.length === 0 ? (
        <Empty description="ยังไม่มีคำขอออกหน่วย" />
      ) : (
        <>
          {/* Statistics */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card hoverable style={{ borderRadius: 16, background: "linear-gradient(135deg, #e6f7ff 0%, #fff 100%)" }}>
                <Statistic
                  title="คำขอทั้งหมด"
                  value={totalRequests}
                  prefix={<FileTextOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card hoverable style={{ borderRadius: 16, background: "linear-gradient(135deg, #e6f7ff 0%, #fff 100%)" }}>
                <Statistic
                  title="รอดำเนินการ"
                  value={pendingRequests}
                  prefix={<ClockCircleOutlined />}
                  styles={{ content: { color: "#faad14" } }}
                  loading={loading}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card hoverable style={{ borderRadius: 16, background: "linear-gradient(135deg, #e6f7ff 0%, #fff 100%)" }}>
                <Statistic
                  title="นัดหมายแล้ว"
                  value={approvedRequests}
                  prefix={<CheckCircleOutlined />}
                  styles={{ content: { color: "#52c41a" } }}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>

          {/* Recent Requests */}
          {!loading && recentRequests.length > 0 && (
            <>
              <Divider />

              <Card
                title={<Text strong>คำขอล่าสุด</Text>}
                variant="borderless"
                style={{ borderRadius: 16 }}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  columns={columns}
                  dataSource={recentRequests}
                  rowKey="mobile_dental_id"
                  pagination={false}
                  loading={loading}
                  onRow={(record) => ({
                    onClick: () =>
                      router.push(`/company/status/${record.mobile_dental_id}`),
                    style: { cursor: "pointer" },
                  })}
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}