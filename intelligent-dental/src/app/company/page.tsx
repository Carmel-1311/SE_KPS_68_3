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
  SyncOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";

import type { MobileDental, MobileDentalStatus } from "@/hook/useMobileDentals";
import { useAllMobileDentals } from "@/hook/useAllMobileDentals";
import { createTablePagination } from "@/app/utils/tablePagination";

const { Title, Text } = Typography;

const statusConfig: Record<MobileDentalStatus, { color: string; label: string; icon?: React.ReactNode }> = {
  request: { color: "gold", label: "รอดำเนินการ", icon: <SyncOutlined spin /> },
  scheduled: { color: "green", label: "นัดหมายแล้ว", icon: <ClockCircleOutlined /> },
  completed: { color: "default", label: "เสร็จสิ้น", icon: <CheckCircleOutlined /> },
  request_cancel: { color: "volcano", label: "แจ้งขอยกเลิก", icon: <ExclamationCircleOutlined /> },
  cancel: { color: "default", label: "ยกเลิกแล้ว", icon: <CloseCircleOutlined /> },
};

export default function CompanyDashboard() {
  const { data, loading, error, isTruncated } = useAllMobileDentals();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setTimeout(() => setCurrentTime(new Date()), 0); // Avoid sync setState warning
    return () => {
      clearInterval(timer);
    };
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
      .sort((a, b) => {
        const bt = new Date(b.date).getTime();
        const at = new Date(a.date).getTime();
        return (Number.isNaN(bt) ? 0 : bt) - (Number.isNaN(at) ? 0 : at);
      })
      .slice(0, 5);
  }, [data]);

  const formattedDate = useMemo(
    () => (currentTime ? new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(currentTime) : ""),
    [currentTime]
  );

  const formattedTime = useMemo(
    () =>
      currentTime
        ? currentTime.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        : "",
    [currentTime]
  );

  const columns: ColumnsType<MobileDental> = useMemo(
    () => [
      {
        title: "รหัสคำขอ",
        dataIndex: "mobile_dental_id",
        sorter: (a, b) => a.mobile_dental_id - b.mobile_dental_id,
        defaultSortOrder: 'descend',
        render: (id: number, record: MobileDental) => {
          if (record.status === "scheduled" || record.status === "completed") {
            return (
              <Link href={`/company/status/${id}/patients`} onClick={(e) => e.stopPropagation()}>
                <Typography.Text strong style={{ color: "#1677ff" }}>#{id}</Typography.Text>
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
        sorter: (a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        },
        render: (value?: string) => {
          if (!value) return "-";
          const dateObj = new Date(value);
          if (Number.isNaN(dateObj.getTime())) return "-";
          return dateObj.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      {
        title: "จำนวนผู้ป่วย",
        dataIndex: "count",
        sorter: (a, b) => (a.count ?? 0) - (b.count ?? 0),
        render: (value?: number) => value ?? "-",
      },
      {
        title: "สถานะ",
        dataIndex: "status",
        sorter: (a, b) => {
          const statusOrder: Record<MobileDentalStatus, number> = {
            request: 1,
            request_cancel: 2,
            scheduled: 3,
            completed: 4,
            cancel: 5,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        },
        render: (status: MobileDentalStatus) => {
          const config = statusConfig[status];
          return <Tag color={config.color} style={{ borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {config.icon}
            {config.label}
          </Tag>;
        },
      },
    ],
    []
  );

  const handleRowClick = useCallback(
    (record: MobileDental) => {
      const tabMap: Record<string, string> = {
        request: "1",
        request_cancel: "1",
        scheduled: "2",
        completed: "3",
        cancel: "3",
      };
      const tab = tabMap[record.status] || "1";
      router.push(`/company/status?tab=${tab}&highlight=${record.mobile_dental_id}`);
    },
    [router]
  );

  return (
    <div style={{ padding: 24 }}>
      <style jsx>{`
        .practical-card {
          transition: all 0.2s ease;
        }
        .practical-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
        }
        .table-row-light {
          background: #fafafa;
        }
        .table-row-light:hover {
          background: #f0f0f0 !important;
        }
      `}</style>
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            หน้าหลักหน่วยงานภายนอก
          </Title>
          <Space style={{ color: "#8c8c8c", marginTop: 8 }} size="middle">
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
                  <Text type="secondary" style={{ fontFamily: "monospace" }}>
                    {formattedTime} น.
                  </Text>
                </Space>
              </>
            )}
          </Space>
        </Col>
        <Col>
          <Card variant="borderless" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)", minWidth: "180px" }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: "12px", fontWeight: "bold" }}>คำขอทั้งหมด</Text>}
              value={totalRequests}
              prefix={<FileTextOutlined style={{ color: "#1677ff" }} />}
              loading={loading}
              styles={{ content: { fontWeight: "bold" } }}
            />
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '24px 0' }} />

      {error && (
        <Alert
          type="error"
          message="เกิดข้อผิดพลาด"
          description={error}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {isTruncated && (
        <Alert
          type="warning"
          message="แจ้งเตือนข้อมูลทะลุขีดจำกัด"
          description="ข้อมูลในระบบมีจำนวนมากเกินไป ระบบกำลังแสดงผลเพียง 3000 รายการล่าสุด"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {!loading && !error && data.length === 0 ? (
        <Empty description="ยังไม่มีคำขอออกหน่วย" />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card
                hoverable
                className="practical-card"
                onClick={() => router.push("/company/status?tab=1")}
                style={{ 
                  borderRadius: 16, 
                  background: "linear-gradient(135deg, #fffbe6 0%, #fff 100%)",
                  cursor: "pointer",
                  border: "1px solid rgba(255, 197, 61, 0.15)",
                  boxShadow: "0 2px 8px rgba(255, 197, 61, 0.08)"
                }}
              >
                <Statistic
                  title={
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#595959" }}>
                      รอดำเนินการ
                    </span>
                  }
                  value={pendingRequests}
                  prefix={<ClockCircleOutlined style={{ color: "#ffc53d", fontSize: 26 }} />}
                  styles={{ content: { color: "#ffc53d" } }}
                  loading={loading}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                hoverable
                className="practical-card"
                onClick={() => router.push("/company/status?tab=2")}
                style={{ 
                  borderRadius: 16, 
                  background: "linear-gradient(135deg, #f6ffed 0%, #fff 100%)",
                  cursor: "pointer",
                  border: "1px solid rgba(115, 209, 61, 0.15)",
                  boxShadow: "0 2px 8px rgba(115, 209, 61, 0.08)"
                }}
              >
                <Statistic
                  title={
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#595959" }}>
                      นัดหมายแล้ว
                    </span>
                  }
                  value={approvedRequests}
                  prefix={<CheckCircleOutlined style={{ color: "#73d13d", fontSize: 26 }} />}
                  styles={{ content: { color: "#73d13d" } }}
                  loading={loading}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                hoverable
                className="practical-card"
                onClick={() => router.push("/company/status?tab=3")}
                style={{ 
                  borderRadius: 16, 
                  background: "linear-gradient(135deg, #f5f5f5 0%, #fff 100%)",
                  cursor: "pointer",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                }}
              >
                <Statistic
                  title={
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#595959" }}>
                      ประวัติอื่นๆ
                    </span>
                  }
                  value={historyRequests}
                  prefix={<HistoryOutlined style={{ color: "#8c8c8c", fontSize: 26 }} />}
                  styles={{ content: { color: "#8c8c8c" } }}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>

          {!loading && recentRequests.length > 0 && (
            <>
              <Divider style={{ margin: '32px 0' }} />

              <Card
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                    <Text strong style={{ fontSize: 16 }}>คำขอล่าสุด</Text>
                  </Space>
                }
                variant="borderless"
                style={{ 
                  borderRadius: 16, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: "1px solid rgba(0, 0, 0, 0.06)"
                }}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  columns={columns}
                  dataSource={recentRequests}
                  rowKey="mobile_dental_id"
                  pagination={createTablePagination(5)}
                  loading={loading}
                  sticky={{ offsetHeader: 76 }}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: "pointer" },
                  })}
                  rowClassName={(record, index) => 
                    index % 2 === 0 ? "table-row-light" : ""
                  }
                  components={{
                    header: {
                      cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} style={{ ...props.style, background: '#fafafa', fontWeight: 600, color: '#262626', fontSize: 14 }} />
                    }
                  }}
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
