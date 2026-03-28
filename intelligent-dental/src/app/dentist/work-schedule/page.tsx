"use client";

import React from "react";
import {
  Calendar,
  Card,
  Typography,
  Spin,
  Row,
  Col,
  List,
  Tag,
  Space,
  Breadcrumb,
  Empty,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  DENTIST_WORK_SCHEDULE_STATUS_META,
  useDentistWorkSchedulePage,
} from "@/hook/useDentistWorkSchedulePage";

dayjs.locale("th");
const { Title, Text } = Typography;

export default function WorkScheduleDashboard() {
  const { loading, selectedDate, setSelectedDate, dailyData, fullCellRender, goHome } =
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card
            variant="borderless"
            style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                <CalendarOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                ปฏิทินงาน
              </Title>
              <Text type="secondary">เลือกวันเพื่อดูตารางนัดหมาย</Text>
            </div>

            <Calendar
              fullscreen={false}
              onSelect={(date) => setSelectedDate(date)}
              value={selectedDate}
              fullCellRender={fullCellRender}
              style={{ borderRadius: 8 }}
            />

            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "#fafafa",
                borderRadius: 8,
              }}
            >
              <Space size={8}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: "#fff1f0",
                    border: "1px solid #ffccc7",
                    borderRadius: 3,
                  }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  วันที่มีนัดหมาย
                </Text>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              minHeight: 550,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                รายการวันที่{" "}
                <span style={{ color: "#1677ff" }}>{selectedDate.format("D MMMM YYYY")}</span>
              </Title>
              <Text type="secondary">
                {dailyData.length > 0
                  ? `พบ ${dailyData.length} รายการนัดหมาย`
                  : "ไม่มีนัดหมายสำหรับวันที่เลือก"}
              </Text>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div>
                  <Spin size="large" />
                  <div style={{ marginTop: 12, color: "#8c8c8c" }}>กำลังดึงข้อมูล...</div>
                </div>
              </div>
            ) : dailyData.length === 0 ? (
              <Empty
                image={<CalendarOutlined style={{ fontSize: 56, color: "#d9d9d9" }} />}
                styles={{ image: { height: 64 } }}
                description={<Text type="secondary">ไม่มีนัดหมายสำหรับวันนี้</Text>}
                style={{ padding: "60px 0" }}
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={dailyData}
                renderItem={(item) => {
                  const meta =
                    DENTIST_WORK_SCHEDULE_STATUS_META[item.status] ??
                    DENTIST_WORK_SCHEDULE_STATUS_META.processing;

                  return (
                    <List.Item style={{ padding: "0 0 12px 0", borderBottom: "none" }}>
                      <Card
                        size="small"
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          borderLeft: `4px solid ${meta.border}`,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Row align="middle" gutter={8}>
                          <Col
                            span={5}
                            style={{
                              borderRight: "1px solid #f0f0f0",
                              textAlign: "center",
                              paddingRight: 12,
                            }}
                          >
                            <div>
                              <ClockCircleOutlined
                                style={{ color: meta.border, marginBottom: 2 }}
                              />
                            </div>
                            <Text strong style={{ fontSize: 15 }}>
                              {item.startTime}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              ถึง {item.endTime}
                            </Text>
                          </Col>

                          <Col span={13} style={{ paddingLeft: 14 }}>
                            <Text strong>
                              <UserOutlined style={{ marginRight: 4, color: "#8c8c8c" }} />
                              {item.patientName}
                            </Text>
                            <div style={{ fontSize: 13, color: "#595959", marginTop: 2 }}>
                              {item.service}
                            </div>
                            {item.note && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {item.note}
                              </Text>
                            )}
                          </Col>

                          <Col span={6} style={{ textAlign: "right" }}>
                            <Tag color={meta.color} style={{ borderRadius: 6 }}>
                              {meta.label}
                            </Tag>
                          </Col>
                        </Row>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
