"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Skeleton, Alert, Divider, Timeline, Empty, Tag } from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

import { getMobileDentalRequests, MobileDentalRequest } from "@/api/companyApi";
import { getCurrentCompanyId } from "@/mock/mockUser";

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "orange", label: "รอดำเนินการ" },
  approved: { color: "green", label: "อนุมัติแล้ว" },
  rejected: { color: "red", label: "ถูกปฏิเสธ" },
  in_progress: { color: "blue", label: "กำลังดำเนินการ" },
  completed: { color: "default", label: "เสร็จสิ้น" },
};

export default function CompanyDashboard() {
  const router = useRouter();
  const [data, setData] = useState<MobileDentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const companyId = getCurrentCompanyId();
        const result = await getMobileDentalRequests(companyId);

        if (mounted) {
          setData(result ?? []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const totalRequests = data.length;
  const pendingRequests = data.filter(d => d.status === "pending").length;
  const approvedRequests = data.filter(d => d.status === "approved").length;

  // คำขอล่าสุด 5 รายการ (เรียงตามวันที่ล่าสุดก่อน)
  const recentRequests = [...data]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div style={{ padding: "24px" }}>
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
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 ? (
        <Empty
          description="ยังไม่มีคำขอออกหน่วย"
          style={{ marginTop: 48, marginBottom: 48 }}
        />
      ) : (
        <>
          {/* Cards */}
          <Row gutter={[24, 24]}>
            {/* Total Requests */}
            <Col xs={24} sm={8}>
              <Card hoverable style={{ borderRadius: 16, background: "linear-gradient(135deg, #e6f7ff 0%, #fff 100%)" }}>
                {loading ? (
                  <Skeleton active />
                ) : (
                  <Statistic
                    title="คำขอทั้งหมด"
                    value={totalRequests}
                    prefix={<FileTextOutlined />}
                  />
                )}
              </Card>
            </Col>

            {/* Pending Requests */}
            <Col xs={24} sm={8}>
              <Card hoverable style={{ borderRadius: 16, background: "linear-gradient(135deg, #e6f7ff 0%, #fff 100%)" }}>
                {loading ? (
                  <Skeleton active />
                ) : (
                  <Statistic
                    title="รอดำเนินการ"
                    value={pendingRequests}
                    prefix={<ClockCircleOutlined />}
                    styles={{ content: { color: "#faad14" } }}
                  />
                )}
              </Card>
            </Col>

            {/* Approved Requests */}
            <Col xs={24} sm={8}>
              <Card hoverable style={{ borderRadius: 16, background: "linear-gradient(135deg, #e6f7ff 0%, #fff 100%)" }}>
                {loading ? (
                  <Skeleton active />
                ) : (
                  <Statistic
                    title="อนุมัติแล้ว"
                    value={approvedRequests}
                    prefix={<CheckCircleOutlined />}
                    styles={{ content: { color: "#52c41a" } }}
                  />
                )}
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
              >
                <Timeline
                  items={recentRequests.map((item) => {
                    const config = statusConfig[item.status ?? ""] ?? { color: "gray", label: item.status };
                    return {
                      color: config.color,
                      content: (
                        <div
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push("/company/status")}
                        >
                          <Text>คำขอ #{item.mobile_dental_id}</Text>
                          {" — "}
                          <Text type="secondary">{item.date}</Text>
                          {" "}
                          <Tag color={config.color}>{config.label}</Tag>
                        </div>
                      ),
                    };
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

