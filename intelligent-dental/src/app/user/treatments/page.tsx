"use client";

import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ClipboardPlus,
  FileText,
  House,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { createTablePagination } from "@/app/utils/tablePagination";
import { useTreatments } from "@/hook/useTreatments";
import { type Detail as TreatmentDetail } from "@/mock/mockTreatmentById";

const { Title, Text, Paragraph } = Typography;

const thaiMonthsShort = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const formatThaiDate = (dateValue: string | Date) => {
  const date = dayjs(dateValue);
  if (!date.isValid()) return String(dateValue);
  return `${date.format("DD")} ${thaiMonthsShort[date.month()]} ${date.year() + 543}`;
};

const normalizeStatus = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "done") return "completed";
  return normalized;
};

const formatStatusLabel = (status: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "completed") return "เสร็จสิ้น";
  if (normalized === "cancelled" || normalized === "canceled") return "ยกเลิก";
  if (normalized === "request_cancel" || normalized === "request cancel") return "ขอยกเลิก";
  if (normalized === "scheduled") return "นัดหมายแล้ว";
  if (normalized === "in_progress" || normalized === "in progress") return "กำลังรักษา";
  return status || "-";
};

const getStatusColor = (status: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "completed" || normalized === "เสร็จสิ้น") return "green";
  if (normalized === "cancelled" || normalized === "canceled" || normalized === "ยกเลิก") return "red";
  if (normalized === "request_cancel" || normalized === "request cancel" || normalized === "ขอยกเลิก") return "orange";
  if (normalized === "scheduled" || normalized === "นัดหมายแล้ว") return "blue";
  if (normalized === "in_progress" || normalized === "in progress" || normalized === "กำลังรักษา") return "processing";
  return "default";
};

export default function UserTreatmentsPage() {
  const {
    search,
    setSearch,
    error,
    treatments,
    filteredTreatments,
    activeId,
    setActiveId,
    activeTreatment,
    filteredDetails,
    hasActiveTreatment,
  } = useTreatments();

  const inspection = activeTreatment?.inspection_record;
  const hasInspectionRecord = Boolean(
    inspection && (inspection.date || inspection.history || inspection.status)
  );

  const columns: ColumnsType<TreatmentDetail> = [
    {
      title: "ประเภทการรักษา",
      dataIndex: ["examination_type", "name"],
      key: "examination_type",
      width: 260,
      render: (value: string) => (
        <Space size={8}>
          <Stethoscope size={15} color="#1677ff" />
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: "ผลการวินิจฉัย",
      dataIndex: "diagnosis",
      key: "diagnosis",
      render: (value: string) => value || "-",
    },
  ];

  if (!hasActiveTreatment && treatments.length === 0) {
    return (
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: 16 }}>
        <Card
          variant="borderless"
          style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
          styles={{ body: { padding: 24 } }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="ยังไม่มีข้อมูลประวัติการรักษา"
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: 16 }}>
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Space size={8} style={{ color: "#8c8c8c" }} wrap>
          <Link
            href="/user/profile"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "inherit" }}
          >
            <House size={16} />
            <span>หน้าหลักผู้ใช้</span>
          </Link>
          <Text type="secondary">/</Text>
          <Space size={8}>
            <FileText size={16} />
            <Text type="secondary">ประวัติการรักษา</Text>
          </Space>
        </Space>

        <Card
          variant="borderless"
          style={{
            borderRadius: 16,
            background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            border: "1px solid rgba(22, 119, 255, 0.08)",
          }}
          styles={{ body: { padding: 20 } }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={16}>
              <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                <Tag color="blue" style={{ width: "fit-content", borderRadius: 999 }}>
                  Treatment History
                </Tag>
                <Title level={3} style={{ margin: 0 }}>
                  ตรวจสอบประวัติการรักษา
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  ดูวันเข้ารับบริการ รายละเอียดการรักษา และบันทึกการตรวจจากรายการที่ผ่านมาได้ในหน้าเดียว
                </Text>
                {activeTreatment ? (
                  <Space
                    size={12}
                    wrap
                    style={{
                      marginTop: 4,
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: "rgba(22, 119, 255, 0.06)",
                      border: "1px solid rgba(22, 119, 255, 0.08)",
                    }}
                  >
                    <Space size={8}>
                      <ClipboardPlus size={16} color="#1677ff" />
                      <Text strong>{formatThaiDate(activeTreatment.date)}</Text>
                    </Space>
                    <Tag color={getStatusColor(activeTreatment.status)} style={{ borderRadius: 999 }}>
                      {formatStatusLabel(activeTreatment.status)}
                    </Tag>
                    <Space size={8}>
                      <UserRound size={16} color="#1677ff" />
                      <Text>{activeTreatment.detail.length} รายการตรวจ</Text>
                    </Space>
                  </Space>
                ) : null}
              </Space>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 16,
                  background: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
                styles={{ body: { padding: 16 } }}
              >
                <Text type="secondary">รายการประวัติทั้งหมด</Text>
                <Title level={3} style={{ margin: "4px 0 2px" }}>
                  {filteredTreatments.length}
                </Title>
                <Text type="secondary">แสดงตามผลลัพธ์ที่ค้นหาในขณะนี้</Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {error && (
          <Alert
            type="error"
            showIcon
            title="เกิดข้อผิดพลาด"
            description={error}
          />
        )}

        <Card
          variant="borderless"
          style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
          styles={{ body: { padding: 18 } }}
        >
          <Space orientation="vertical" size={14} style={{ width: "100%" }}>
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} lg={10}>
                <Space orientation="vertical" size={4}>
                  <Title level={4} style={{ margin: 0 }}>
                    เลือกประวัติการรักษา
                  </Title>
                  <Text type="secondary">
                    ค้นหาวันที่ที่เคยเข้ารับบริการ แล้วเลือกดูรายละเอียดของรอบการรักษานั้น
                  </Text>
                </Space>
              </Col>

              <Col xs={24} lg={10}>
                <Input
                  prefix={<Search size={16} color="#8c8c8c" />}
                  placeholder="ค้นหาวันที่นัดหมาย เช่น 2024-03-14 หรือ 14 มี.ค. 2567"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                  style={{ borderRadius: 10 }}
                />
              </Col>
            </Row>

            {filteredTreatments.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="ไม่พบประวัติการรักษาตามคำค้นหา"
              />
            ) : (
              <Row gutter={[12, 12]}>
                {filteredTreatments.map((item) => {
                  const active = item.id === activeId;

                  return (
                    <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                      <Button
                        block
                        type={active ? "primary" : "default"}
                        onClick={() => setActiveId(item.id)}
                        style={{
                          height: "auto",
                          borderRadius: 14,
                          padding: "10px 12px",
                          textAlign: "left",
                        }}
                      >
                        <Space orientation="vertical" size={2} style={{ width: "100%", alignItems: "flex-start" }}>
                          <Text
                            strong
                            style={{ color: active ? "#ffffff" : "#262626" }}
                          >
                            {formatThaiDate(item.date)}
                          </Text>
                          <Text style={{ color: active ? "rgba(255,255,255,0.85)" : "#8c8c8c" }}>
                            {formatStatusLabel(item.status)}
                          </Text>
                        </Space>
                      </Button>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Space>
        </Card>

        {hasActiveTreatment ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={9}>
              <Card
                variant="borderless"
                style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", height: "100%" }}
                styles={{ body: { padding: 18 } }}
                title={<Text strong>สรุปรายการที่เลือก</Text>}
              >
                <div style={{ maxHeight: "calc(100vh - 390px)", overflowY: "auto", paddingRight: 4 }}>
                  <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  <div
                    style={{
                      borderRadius: 14,
                      padding: "12px 14px",
                      background: "rgba(22, 119, 255, 0.05)",
                      border: "1px solid rgba(22, 119, 255, 0.08)",
                    }}
                  >
                    <Text type="secondary" style={{ display: "block", marginBottom: 6 }}>
                      วันที่เข้ารับบริการ
                    </Text>
                    <Text strong style={{ fontSize: 16 }}>
                      {formatThaiDate(activeTreatment.date)}
                    </Text>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      padding: "12px 14px",
                      background: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <Text type="secondary" style={{ display: "block", marginBottom: 6 }}>
                      สถานะ
                    </Text>
                    <Tag color={getStatusColor(activeTreatment.status)} style={{ borderRadius: 999 }}>
                      {formatStatusLabel(activeTreatment.status)}
                    </Tag>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      padding: "12px 14px",
                      background: "rgba(82, 196, 26, 0.05)",
                      border: "1px solid rgba(82, 196, 26, 0.08)",
                    }}
                  >
                    <Text type="secondary" style={{ display: "block", marginBottom: 6 }}>
                      จำนวนรายการตรวจ
                    </Text>
                    <Text strong style={{ fontSize: 16 }}>
                      {activeTreatment.detail.length} รายการ
                    </Text>
                  </div>

                  <div
                    style={{
                      borderRadius: 14,
                      padding: "12px 14px",
                      background: "#ffffff",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <Text type="secondary" style={{ display: "block", marginBottom: 6 }}>
                      รายละเอียดเพิ่มเติม
                    </Text>
                    <Paragraph style={{ marginBottom: 0 }}>
                      {activeTreatment.history || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </Paragraph>
                  </div>
                  </Space>
                </div>
              </Card>
            </Col>

            <Col xs={24} xl={15}>
              <Card
                variant="borderless"
                style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
                styles={{ body: { padding: 18 } }}
                title={<Text strong>ผลการตรวจและการวินิจฉัย</Text>}
              >
                <div style={{ maxHeight: "calc(100vh - 390px)", overflowY: "auto", paddingRight: 4 }}>
                  <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                  {hasInspectionRecord && (
                    <div
                      style={{
                        borderRadius: 14,
                        padding: "12px 14px",
                        background: "#fafafa",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                        <Text strong>บันทึกการตรวจ</Text>
                        <Text>
                          วันที่ตรวจ: {inspection?.date ? formatThaiDate(inspection.date) : "-"}
                        </Text>
                        <Text>
                          สถานะ: {inspection?.status ? formatStatusLabel(inspection.status) : "-"}
                        </Text>
                        <Text>
                          ประวัติ: {inspection?.history || "-"}
                        </Text>
                      </Space>
                    </div>
                  )}

                  <Table
                    columns={columns}
                    dataSource={filteredDetails}
                    rowKey="id"
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="ไม่มีข้อมูลผลการตรวจ"
                      />
                    ),
                  }}
                    pagination={createTablePagination(3)}
                    style={{ borderRadius: 12, overflow: "hidden" }}
                    components={{
                      header: {
                        cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
                          <th
                            {...props}
                            style={{
                              ...props.style,
                              background: "#fafafa",
                              fontWeight: 600,
                              color: "#262626",
                            }}
                          />
                        ),
                      },
                    }}
                  />
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <Card
            variant="borderless"
            style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
            styles={{ body: { padding: 24 } }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="ไม่พบรายละเอียดของประวัติการรักษาที่เลือก"
            />
          </Card>
        )}
      </Space>
    </div>
  );
}
