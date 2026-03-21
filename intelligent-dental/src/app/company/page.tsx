"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Space,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";

import { getCurrentCompanyId } from "@/mock/mockUser";
import { MobileDental } from "@/mock/mockMobileDental";

type MobileDentalStatus = MobileDental["status"];

const { Title, Text } = Typography;

const statusConfig: Record<MobileDentalStatus, { color: string; label: string }> = {
  request: { color: "blue", label: "รอดำเนินการ" },
  scheduled: { color: "green", label: "นัดหมายแล้ว" },
  completed: { color: "default", label: "เสร็จสิ้น" },
  request_cancel: { color: "orange", label: "แจ้งขอยกเลิก" },
  cancel: { color: "red", label: "ยกเลิกแล้ว" },
};

export default function CompanyDashboard() {
  const [data, setData] = useState<MobileDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyId = getCurrentCompanyId();

        const res = await fetch(
          `/api/mobile_dentals?company_id=${companyId}`,
          { cache: "no-store", headers: withAuthHeaders() }
        );

        if (!res.ok) throw new Error("fetch failed");

        const json: { data: MobileDental[] } = await res.json();

        setData(json.data ?? []);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRequests = data.length;

  const pendingRequests = useMemo(
    () => data.filter((d) => d.status === "request" || d.status === "request_cancel").length,
    [data]
  );

  const approvedRequests = useMemo(
    () => data.filter((d) => d.status === "scheduled").length,
    [data]
  );

  const historyRequests = useMemo(
    () => data.filter((d) => d.status === "completed" || d.status === "cancel").length,
    [data]
  );

  const recentRequests = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [data]);

  const formattedDate = useMemo(() => currentTime ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(currentTime) : "", [currentTime]);
  const formattedTime = useMemo(() => currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "", [currentTime]);

  const columns: ColumnsType<MobileDental> = useMemo(() => [
    {
      title: "รหัสคำขอ",
      dataIndex: "mobile_dental_id",
      render: (id: number, record: MobileDental) => {
        if (record.status === "scheduled" || record.status === "completed") {
          return (
            <Link href={`/company/status/${id}/patients`}>
              <Typography.Text strong style={{ color: '#1677ff' }}>#{id}</Typography.Text>
            </Link>
          );
        }
        return <Typography.Text strong>#{id}</Typography.Text>;
      },
    },
    {
      title: "สถานที่",
      dataIndex: "address",
      render: (value?: string) => value ?? "-",
    },
    {
      title: "วันที่",
      dataIndex: "date",
      render: (value?: string) => value ?? "-",
    },
    {
      title: "จำนวนผู้ป่วย",
      dataIndex: "count",
      render: (value?: number) => value ?? "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      render: (status: MobileDentalStatus) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ], []);

  const handleRowClick = useCallback((record: MobileDental) => {
    const tabMap: Record<string, string> = {
      request: "1",
      request_cancel: "1",
      scheduled: "2",
      completed: "3",
      cancel: "3",
    };
    const tab = tabMap[record.status] || "1";
    router.push(`/company/status?tab=${tab}&highlight=${record.mobile_dental_id}`);
  }, [router]);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            หน้าหลักหน่วยงานภายนอก
          </Title>
          <Space style={{ color: '#8c8c8c', marginTop: 8 }} size="middle">
            <Text type="secondary">ภาพรวมการขอออกหน่วยตรวจฟัน</Text>
            {currentTime && (
              <>
                <Divider orientation="vertical" />
                <Space size="small">
                  <CalendarOutlined />
                  <Text type="secondary">{formattedDate}</Text>
                </Space>
                <Space size="small">
                  <ClockCircleOutlined />
                  <Text type="secondary" style={{ fontFamily: 'monospace' }}>{formattedTime} น.</Text>
                </Space>
              </>
            )}
          </Space>
        </Col>
        <Col>
          <Card variant="borderless" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minWidth: '180px' }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>คำขอทั้งหมด</Text>}
              value={totalRequests}
              prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
              loading={loading}
              styles={{ content: { fontWeight: 'bold' } }}
            />
          </Card>
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
              <Card
                hoverable
                onClick={() => router.push("/company/status?tab=1")}
                style={{
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, #fffbe6 0%, #fff 100%)",
                }}
              >
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
              <Card
                hoverable
                onClick={() => router.push("/company/status?tab=2")}
                style={{
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, #f6ffed 0%, #fff 100%)",
                }}
              >
                <Statistic
                  title="นัดหมายแล้ว"
                  value={approvedRequests}
                  prefix={<CheckCircleOutlined />}
                  styles={{ content: { color: "#52c41a" } }}
                  loading={loading}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                hoverable
                onClick={() => router.push("/company/status?tab=3")}
                style={{
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, #f0f0f0 0%, #fff 100%)",
                }}
              >
                <Statistic
                  title="ประวัติอื่นๆ"
                  value={historyRequests}
                  prefix={<HistoryOutlined />}
                  styles={{ content: { color: "#8c8c8c" } }}
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
                  sticky={{ offsetHeader: 76 }}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
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
