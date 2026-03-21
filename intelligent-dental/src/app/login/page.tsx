"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import {
  ArrowLeftOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Form, Grid, Input, Row, Space, Typography, message } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Title, Text } = Typography;

export default function LoginPage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setSubmitting(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Login failed");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", result?.data?.token || "");
        localStorage.setItem("account_role", result?.data?.role || "");
        localStorage.setItem("account_id", String(result?.data?.account_id || ""));
        localStorage.setItem("patient_id", String(result?.data?.patient_id || ""));
        const firstName = result?.data?.first_name || "";
        const lastName = result?.data?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();
        const username = result?.data?.username || values.username || "";
        localStorage.setItem(
          "account_name",
          result?.data?.display_name || fullName || username
        );
        localStorage.setItem("account_username", username);
      }

      messageApi.success("เข้าสู่ระบบสำเร็จ");
      const role = result?.data?.role;
      if (role === "patient") {
        router.push("/user");
      } else if (role === "staff") {
        router.push("/personnel");
      } else if (role === "dentist") {
        router.push("/dentist");
      } else if (role === "company") {
        router.push("/company");
      } else {
        router.push("/home");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้";
      messageApi.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #9bfaf7 0%, #e6fdfd 40%, #d9f8ff 72%, #c8f2ff 100%)",
        padding: isMobile ? "20px 12px" : "36px 20px",
      }}
    >
      {contextHolder}

      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Link
          href="/home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
            color: "#155f7b",
            fontWeight: 600,
          }}
        >
          <ArrowLeftOutlined />
          กลับหน้าแรก
        </Link>

        <Card
          styles={{ body: { padding: 0 } }}
          style={{
            borderRadius: 24,
            border: "1px solid #cdeaf2",
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(7, 74, 92, 0.14)",
          }}
        >
          <Row gutter={0}>
            <Col xs={24} md={10}>
              <div
                style={{
                  height: "100%",
                  padding: isMobile ? 18 : 26,
                  background: "linear-gradient(160deg, #032020 0%, #0c5f6a 60%, #0fa3a3 100%)",
                }}
              >
                <Space size={10} align="center">
                  <Image
                    src="/icon/icon.png"
                    alt="Clinic Icon"
                    width={46}
                    height={46}
                    style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.4)" }}
                  />
                  <Text style={{ color: "#d2fcff", fontSize: 13 }}>INTELLIGENT DENTAL</Text>
                </Space>

                <Title
                  level={2}
                  style={{
                    marginTop: 14,
                    marginBottom: 10,
                    color: "#ffffff",
                    lineHeight: 1.2,
                    fontSize: isMobile ? 26 : 34,
                  }}
                >
                  ยินดีต้อนรับกลับ
                </Title>
                <Text style={{ color: "#d9fbff", fontSize: 14 }}>
                  เข้าสู่ระบบเพื่อใช้งานการจัดการข้อมูลนัดหมาย ประวัติการรักษา และข้อมูลที่สำคัญของคลินิก
                </Text>

                <div
                  style={{
                    marginTop: 18,
                    borderRadius: 14,
                    padding: "10px 12px",
                    background: "rgba(230, 253, 253, 0.12)",
                    border: "1px solid rgba(194, 248, 255, 0.24)",
                  }}
                >
                  <Space size={8}>
                    <SafetyCertificateOutlined style={{ color: "#7dfff3" }} />
                    <Text style={{ color: "#e4fbff" }}>ระบบเข้ารหัสความปลอดภัยระหว่างการใช้งาน</Text>
                  </Space>
                </div>
              </div>
            </Col>

            <Col xs={24} md={14}>
              <div style={{ padding: isMobile ? "20px 16px" : "28px 28px 24px" }}>
                <Title level={3} style={{ margin: 0, color: "#0d3f56" }}>
                  Login
                </Title>
                <Text style={{ color: "#587284" }}>กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ</Text>

                <Form layout="vertical" requiredMark={false} size="large" style={{ marginTop: 16 }} onFinish={onFinish}>
                  <Form.Item
                    name="username"
                    label={<Text strong style={{ color: "#16445f" }}>ชื่อผู้ใช้</Text>}
                    rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#88a1b2" }} />}
                      placeholder="กรอกชื่อผู้ใช้งาน"
                      style={{ height: 44, borderRadius: 10 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={<Text strong style={{ color: "#16445f" }}>รหัสผ่าน</Text>}
                    rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#88a1b2" }} />}
                      placeholder="กรอกรหัสผ่าน"
                      style={{ height: 44, borderRadius: 10 }}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 10 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={submitting}
                      style={{
                        height: 46,
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 16,
                        background: ThemeWebColor.header,
                        borderColor: ThemeWebColor.header,
                      }}
                    >
                      เข้าสู่ระบบ
                    </Button>
                  </Form.Item>
                </Form>

                <Flex justify="center" gap={6} wrap="wrap">
                  <Text style={{ color: "#57748a", fontSize: 13 }}>ยังไม่มีบัญชี?</Text>
                  <Link
                    href="/register"
                    style={{
                      color: ThemeWebColor.header,
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "underline",
                    }}
                  >
                    สมัครสมาชิก
                  </Link>
                </Flex>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
