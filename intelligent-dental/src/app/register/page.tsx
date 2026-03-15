"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Form, Grid, Input, Row, Space, Typography, message, Radio } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Title, Text } = Typography;

type RegisterForm = {
  role: "patient" | "staff";
  staff_role?: "staff" | "dentist";
  first_name: string;
  last_name: string;
  birthday: string;
  allergy?: string;
  email: string;
  phone: string;
  license_number?: string;
  password: string;
};

const highlights = [
  "บันทึกข้อมูลผู้ใช้งานใหม่เข้าสู่ระบบได้ทันที",
  "รองรับข้อมูลพื้นฐานสำหรับผู้ป่วยตามโครงสร้างฐานข้อมูล",
  "ส่งข้อมูลผ่าน API และจัดเก็บอย่างเป็นระบบ",
];

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterForm>();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: RegisterForm) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: values.role,
          staff_role: values.role === "staff" ? values.staff_role : undefined,
          first_name: values.first_name,
          last_name: values.last_name,
          birthday: values.birthday,
          allergy: values.role === "patient" ? values.allergy || "" : "",
          email: values.email,
          phone: values.phone,
          license_number: values.role === "staff" ? values.license_number || "" : "",
          password: values.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Register failed");
      }

      messageApi.success("สมัครสมาชิกเรียบร้อย");
      form.resetFields();
      router.push("/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้";
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
          "radial-gradient(circle at top right, #8bf8f8 0%, #e6fdfd 38%, #d7f9ff 72%, #c5f2ff 100%)",
        padding: isMobile ? "20px 12px" : "34px 20px",
      }}
    >
      {contextHolder}

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          href="/login"
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
          กลับหน้าเข้าสู่ระบบ
        </Link>

        <Card
          styles={{ body: { padding: 0 } }}
          style={{
            borderRadius: 24,
            border: "1px solid #cdeaf2",
            boxShadow: "0 18px 40px rgba(7, 74, 92, 0.14)",
            overflow: "hidden",
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
                <Text style={{ color: "#9decee", fontSize: 13 }}>INTELLIGENT DENTAL</Text>
                <Title
                  level={2}
                  style={{
                    marginTop: 8,
                    marginBottom: 10,
                    color: "#ffffff",
                    lineHeight: 1.2,
                    fontSize: isMobile ? 26 : 34,
                  }}
                >
                  สร้างบัญชีใหม่
                </Title>
                <Text style={{ color: "#d9fbff", fontSize: 14 }}>
                  ลงทะเบียนผู้ใช้งานด้วยข้อมูลที่จำเป็นสำหรับผู้ป่วย
                </Text>

                <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                  {highlights.map((item) => (
                    <Space
                      key={item}
                      align="start"
                      size={8}
                      style={{
                        borderRadius: 12,
                        padding: "8px 10px",
                        background: "rgba(230, 253, 253, 0.12)",
                        border: "1px solid rgba(194, 248, 255, 0.24)",
                      }}
                    >
                      <CheckCircleOutlined style={{ color: "#7dfff3", marginTop: 2 }} />
                      <Text style={{ color: "#e4fbff" }}>{item}</Text>
                    </Space>
                  ))}
                </div>
              </div>
            </Col>

            <Col xs={24} md={14}>
              <div style={{ padding: isMobile ? "20px 16px" : "28px 28px 24px" }}>
                <Title level={3} style={{ margin: 0, color: "#0d3f56" }}>
                  Register
                </Title>
                <Text style={{ color: "#587284" }}>
                  กรอกข้อมูล: first_name, last_name, birthday, allergy, email, phone
                </Text>

                <Form<RegisterForm>
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={onFinish}
                  initialValues={{ role: "patient", staff_role: "staff" }}
                  style={{ marginTop: 16 }}
                >
                  <Form.Item
                    name="role"
                    label={<Text strong style={{ color: "#16445f" }}>role</Text>}
                    rules={[{ required: true, message: "à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸ role" }]}
                  >
                    <Radio.Group>
                      <Radio value="patient">patient</Radio>
                      <Radio value="staff">staff</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item shouldUpdate={(prev, next) => prev.role !== next.role} noStyle>
                    {({ getFieldValue }) =>
                      getFieldValue("role") === "staff" ? (
                        <Form.Item
                          name="staff_role"
                          label={<Text strong style={{ color: "#16445f" }}>staff_role</Text>}
                          rules={[{ required: true, message: "à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸ staff_role" }]}
                        >
                          <Radio.Group>
                            <Radio value="staff">staff</Radio>
                            <Radio value="dentist">dentist</Radio>
                          </Radio.Group>
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>

                  <Row gutter={[12, 8]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="first_name"
                        label={<Text strong style={{ color: "#16445f" }}>first_name</Text>}
                        rules={[{ required: true, message: "กรุณากรอก first_name" }]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#88a1b2" }} />}
                          placeholder="ชื่อ"
                          style={{ height: 44, borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="last_name"
                        label={<Text strong style={{ color: "#16445f" }}>last_name</Text>}
                        rules={[{ required: true, message: "กรุณากรอก last_name" }]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#88a1b2" }} />}
                          placeholder="นามสกุล"
                          style={{ height: 44, borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="birthday"
                        label={<Text strong style={{ color: "#16445f" }}>birthday</Text>}
                        rules={[{ required: true, message: "กรุณาเลือกวันเกิด" }]}
                      >
                        <Input type="date" style={{ height: 44, borderRadius: 10 }} />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label={<Text strong style={{ color: "#16445f" }}>phone</Text>}
                        rules={[
                          { required: true, message: "กรุณากรอก phone" },
                          { pattern: /^0\d{9}$/, message: "กรุณากรอกเบอร์โทร 10 หลัก" },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: "#88a1b2" }} />}
                          placeholder="08xxxxxxxx"
                          maxLength={10}
                          style={{ height: 44, borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="password"
                        label={<Text strong style={{ color: "#16445f" }}>password</Text>}
                        rules={[{ required: true, message: "à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸ password" }]}
                      >
                        <Input.Password
                          placeholder="password"
                          style={{ height: 44, borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item
                        name="email"
                        label={<Text strong style={{ color: "#16445f" }}>email</Text>}
                        rules={[
                          { required: true, message: "กรุณากรอก email" },
                          { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: "#88a1b2" }} />}
                          placeholder="name@email.com"
                          style={{ height: 44, borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item shouldUpdate={(prev, next) => prev.role !== next.role} noStyle>
                        {({ getFieldValue }) =>
                          getFieldValue("role") === "patient" ? (
                            <Form.Item
                              name="allergy"
                              label={<Text strong style={{ color: "#16445f" }}>allergy</Text>}
                            >
                              <Input.TextArea
                                placeholder="à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸à¸²à¸£à¹à¸žà¹‰à¸¢à¸²/à¹à¸žà¹‰à¸­à¸²à¸«à¸²à¸£ (à¸–à¹‰à¸²à¸¡à¸µ)"
                                autoSize={{ minRows: 3, maxRows: 4 }}
                                style={{ borderRadius: 10 }}
                              />
                            </Form.Item>
                          ) : (
                            <Form.Item
                              name="license_number"
                              label={<Text strong style={{ color: "#16445f" }}>license_number</Text>}
                            >
                              <Input
                                placeholder="DEN-123456"
                                style={{ height: 44, borderRadius: 10 }}
                              />
                            </Form.Item>
                          )
                        }
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginTop: 6, marginBottom: 8 }}>
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
                      บันทึกข้อมูลลงทะเบียน
                    </Button>
                  </Form.Item>
                </Form>

                <Flex justify="center" style={{ marginTop: 8 }}>
                  <Text style={{ color: "#57748a", fontSize: 13 }}>
                    มีบัญชีอยู่แล้ว?{" "}
                    <Link href="/login" style={{ color: "#0c6175", fontWeight: 700 }}>
                      เข้าสู่ระบบ
                    </Link>
                  </Text>
                </Flex>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}

