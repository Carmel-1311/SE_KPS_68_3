"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Button, Flex, Form, Input, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";

const { Title, Text } = Typography;

export default function LoginPage() {

  return (
    <div
      style={{
        minHeight: "100vh",
        background: ThemeWebColor.Background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 16,
          padding: "40px 36px 32px",
          boxShadow: "0 8px 32px rgba(3,32,32,0.12)",
        }}
      >
        {/* Logo & Title */}
        <Flex align="center" justify="center" gap={12} style={{ marginBottom: 8 }}>
          <Image
            src="/icon/icon.png"
            alt="Clinic Icon"
            width={44}
            height={44}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          <Title
            level={4}
            style={{
              margin: 0,
              color: ThemeWebColor.header,
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            ระบบบริหารจัดการ
            <br />
            คลินิกทันตกรรม
          </Title>
        </Flex>

        <Text
          style={{
            display: "block",
            textAlign: "center",
            color: "#666",
            marginBottom: 28,
            fontSize: 14,
          }}
        >
          เข้าสู่ระบบเพื่อใช้งาน
        </Text>

        <Form layout="vertical" requiredMark={false} size="large">
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 600, color: ThemeWebColor.header }}>ชื่อผู้ใช้งาน</span>}
            rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้งาน" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#aaa" }} />}
              placeholder="กรอกชื่อผู้ใช้งาน"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600, color: ThemeWebColor.header }}>รหัสผ่าน</span>}
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#aaa" }} />}
              placeholder="กรอกรหัสผ่าน"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{
                height: 44,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                background: ThemeWebColor.header,
                borderColor: ThemeWebColor.header,
                color: "#20d8dc",
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>

        <Flex justify="center">
          <Link
            href="/home"
            style={{
              color: "#666",
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            กลับหน้าหลัก
          </Link>
        </Flex>
      </div>
    </div>
  );
}
