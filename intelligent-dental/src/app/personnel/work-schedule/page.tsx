"use client";

import {
  Button,
  Card,
  Table,
  Typography,
  Breadcrumb,
  Empty,
  Avatar,
  Space,
} from "antd";
import { HomeOutlined, CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { usePersonnelWorkSchedulePage } from "@/hook/usePersonnelWorkSchedulePage";
import dynamic from "next/dynamic";

const { Title, Text } = Typography;
const ClientSelect = dynamic(() => import("antd").then((mod) => mod.Select), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      style={{
        width: 280,
        height: 40,
        borderRadius: 8,
        border: "1px solid #d9d9d9",
        background: "#ffffff",
      }}
    />
  ),
});

type StaffSelectValue = number | undefined;

function toStaffSelectValue(value: unknown): StaffSelectValue {
  return typeof value === "number" ? value : undefined;
}

export default function PersonnelWorkSchedulePage() {
  const {
    loading,
    selectedStaffId,
    setSelectedStaffId,
    staffOptions,
    selectedStaff,
    filteredData,
    activeCount,
    tableData,
    columns,
    getDisplayName,
    getRoleLabel,
    goHome,
    goToCreatePage,
  } = usePersonnelWorkSchedulePage();

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        style={{ marginBottom: 24, fontSize: 15 }}
        items={[
          {
            title: (
              <a onClick={goHome}>
                <HomeOutlined /> หน้าหลัก
              </a>
            ),
          },
          {
            title: (
              <span>
                <CalendarOutlined /> ตารางการทำงาน
              </span>
            ),
          },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              ตารางการทำงาน
            </Title>
            <Text type="secondary">ตารางเวลาการทำงานของบุคลากรและทันตแพทย์</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            style={{ borderRadius: 8 }}
            onClick={goToCreatePage}
          >
            เพิ่มเวลาทำงาน
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <ClientSelect
            showSearch
            placeholder="ค้นหาหรือเลือกบุคลากร..."
            style={{ width: 280 }}
            value={selectedStaffId ?? undefined}
            onChange={(value) => setSelectedStaffId(toStaffSelectValue(value) ?? null)}
            options={staffOptions}
            filterOption={(input, option) =>
              String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            allowClear
            size="large"
          />

          {selectedStaff && (
            <Space size={8}>
              <Avatar size={32} style={{ background: "#1677ff", fontWeight: 700 }}>
                {getDisplayName(selectedStaff).charAt(0) || "U"}
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 13 }}>
                  {getDisplayName(selectedStaff)}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  {getRoleLabel(selectedStaff.role)} · {filteredData.length} รายการ · ลงตรวจ{" "}
                  {activeCount} รายการ
                </Text>
              </div>
            </Space>
          )}
        </div>

        <style>{`
          .work-schedule-table .ant-table-tbody > tr > td {
            padding: 4px 6px !important;
            vertical-align: top;
          }
          .work-schedule-table .ant-table-thead > tr > th {
            padding: 10px 8px !important;
          }
        `}</style>

        {!selectedStaffId ? (
          <Empty
            image={<CalendarOutlined style={{ fontSize: 56, color: "#d9d9d9" }} />}
            styles={{ image: { height: 64 } }}
            description={
              <>
                <Text style={{ fontSize: 15, color: "#8c8c8c", display: "block" }}>
                  ยังไม่ได้เลือกบุคลากร
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  กรุณาเลือกบุคลากรหรือทันตแพทย์เพื่อดูตารางการทำงาน
                </Text>
              </>
            }
            style={{ padding: "60px 0" }}
          />
        ) : (
          <div className="work-schedule-table">
            <Table
              rowKey="key"
              loading={loading}
              pagination={false}
              dataSource={tableData}
              columns={columns}
              bordered
              size="small"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
