"use client";

import { Avatar, Breadcrumb, Button, Card, Empty, Space, Table, Typography } from "antd";
import { CalendarOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons";
import { useDentistWorkSchedulePage } from "@/hook/useDentistWorkSchedulePage";
import { getDisplayName, getRoleLabel } from "@/hook/usePersonnelWorkSchedulePage";

const { Title, Text } = Typography;

export default function DentistWorkSchedulePage() {
  const { loading, profile, filteredData, activeCount, tableData, columns, goHome, goToCreatePage } =
    useDentistWorkSchedulePage();

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
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              ตารางการทำงาน
            </Title>
            <Text type="secondary">ตารางเวลาการทำงานของทันตแพทย์เจ้าของบัญชีนี้</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={goToCreatePage}>
            เพิ่มตารางการทำงาน
          </Button>
        </div>

        {profile && (
          <Space size={8} style={{ marginBottom: 20 }}>
            <Avatar size={32} style={{ background: "#1677ff", fontWeight: 700 }}>
              {getDisplayName(profile).charAt(0) || "D"}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 13 }}>
                {getDisplayName(profile)}
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                {getRoleLabel(profile.role)} · {filteredData.length} รายการ · ลงตรวจ {activeCount} รายการ
              </Text>
            </div>
          </Space>
        )}

        <style>{`
          .work-schedule-table .ant-table-tbody > tr > td {
            padding: 4px 6px !important;
            vertical-align: top;
          }
          .work-schedule-table .ant-table-thead > tr > th {
            padding: 10px 8px !important;
          }
        `}</style>

        {filteredData.length === 0 && !loading ? (
          <Empty
            image={<CalendarOutlined style={{ fontSize: 56, color: "#d9d9d9" }} />}
            styles={{ image: { height: 64 } }}
            description={
              <>
                <Text style={{ fontSize: 15, color: "#8c8c8c", display: "block" }}>
                  ยังไม่มีตารางการทำงานของคุณ
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  ระบบจะแสดงเฉพาะตารางของทันตแพทย์ที่ล็อกอินอยู่เท่านั้น
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
