"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Flex, Form, Grid, Input, Radio, Row, Space, Typography, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/th";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Title, Text } = Typography;

dayjs.locale("th");

type RegisterForm = {
  role: "patient" | "company";
  first_name?: string;
  last_name?: string;
  birthday?: Dayjs;
  id_card?: string;
  allergy?: string;
  office_name?: string;
  contact_name?: string;
  address?: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
};

const highlights = [
  "สมัครได้เฉพาะผู้ป่วยและหน่วยงานภายนอก",
  "ยืนยันรหัสผ่าน 2 ครั้งก่อนส่งข้อมูล",
  "ส่งข้อมูลผ่าน API และจัดเก็บอย่างเป็นระบบ",
];

function formatThaiIdCard(value?: string) {
  const digits = (value || "").replace(/\D/g, "").slice(0, 13);
  const parts = [1, 4, 2, 3, 2, 1];
  const chunks: string[] = [];
  let index = 0;

  for (const size of parts) {
    const chunk = digits.slice(index, index + size);
    if (!chunk) break;
    chunks.push(chunk);
    index += size;
  }

  return chunks.join("-");
}

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
          first_name: values.role === "patient" ? values.first_name : undefined,
          last_name: values.role === "patient" ? values.last_name : undefined,
          birthday: values.role === "patient" && values.birthday ? values.birthday.format("YYYY-MM-DD") : undefined,
          id_card: values.role === "patient" ? values.id_card : undefined,
          allergy: values.role === "patient" ? values.allergy || "" : undefined,
          office_name: values.role === "company" ? values.office_name : undefined,
          contact_name: values.role === "company" ? values.contact_name : undefined,
          address: values.role === "company" ? values.address || "" : undefined,
          email: values.email,
          phone: values.phone,
          password: values.password,
          confirm_password: values.confirm_password,
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
                  ลงทะเบียนสำหรับผู้ป่วยหรือหน่วยงานภายนอกเท่านั้น
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
                  เลือกประเภทบัญชี แล้วกรอกข้อมูลให้ครบก่อนบันทึก
                </Text>

                <Form<RegisterForm>
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={onFinish}
                  initialValues={{ role: "patient" }}
                  style={{ marginTop: 16 }}
                >
                  <Form.Item
                    name="role"
                    label={<Text strong style={{ color: "#16445f" }}>role</Text>}
                    rules={[{ required: true, message: "กรุณาเลือก role" }]}
                  >
                    <Radio.Group>
                      <Radio value="patient">patient</Radio>
                      <Radio value="company">company</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item shouldUpdate={(prev, next) => prev.role !== next.role} noStyle>
                    {({ getFieldValue }) =>
                      getFieldValue("role") === "patient" ? (
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
                              <DatePicker
                                style={{ width: "100%", height: 44 }}
                                format="DD/MM/YYYY"
                                placeholder="เลือกวันเกิด"
                                inputReadOnly
                                allowClear
                                disabledDate={(current) => Boolean(current && current.endOf("day").isAfter(dayjs()))}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              name="id_card"
                              label={<Text strong style={{ color: "#16445f" }}>id_card</Text>}
                              rules={[
                                { required: true, message: "กรุณากรอกเลขบัตรประชาชน" },
                                {
                                  validator(_, value) {
                                    const digits = (value || "").replace(/\D/g, "");
                                    if (digits.length === 13) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("เลขบัตรประชาชนต้องมี 13 หลัก"));
                                  },
                                },
                              ]}
                            >
                              <Input
                                placeholder="1-2345-67-890-12-3"
                                maxLength={17}
                                onChange={(event) => {
                                  form.setFieldValue("id_card", formatThaiIdCard(event.target.value));
                                }}
                                style={{ height: 44, borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item
                              name="allergy"
                              label={<Text strong style={{ color: "#16445f" }}>allergy</Text>}
                            >
                              <Input.TextArea
                                placeholder="ข้อมูลการแพ้ยา/แพ้อาหาร (ถ้ามี)"
                                autoSize={{ minRows: 3, maxRows: 4 }}
                                style={{ borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ) : (
                        <Row gutter={[12, 8]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="office_name"
                              label={<Text strong style={{ color: "#16445f" }}>office_name</Text>}
                              rules={[{ required: true, message: "กรุณากรอก office_name" }]}
                            >
                              <Input
                                prefix={<UserOutlined style={{ color: "#88a1b2" }} />}
                                placeholder="ชื่อหน่วยงาน"
                                style={{ height: 44, borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              name="contact_name"
                              label={<Text strong style={{ color: "#16445f" }}>contact_name</Text>}
                              rules={[{ required: true, message: "กรุณากรอก contact_name" }]}
                            >
                              <Input
                                prefix={<UserOutlined style={{ color: "#88a1b2" }} />}
                                placeholder="ชื่อผู้ติดต่อ"
                                style={{ height: 44, borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item
                              name="address"
                              label={<Text strong style={{ color: "#16445f" }}>address</Text>}
                              rules={[{ required: true, message: "กรุณากรอก address" }]}
                            >
                              <Input.TextArea
                                placeholder="ที่อยู่หน่วยงาน"
                                autoSize={{ minRows: 3, maxRows: 4 }}
                                style={{ borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      )
                    }
                  </Form.Item>

                  <Row gutter={[12, 8]}>
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

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="password"
                        label={<Text strong style={{ color: "#16445f" }}>password</Text>}
                        rules={[
                          { required: true, message: "กรุณากรอก password" },
                          { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                        ]}
                      >
                        <Input.Password
                          placeholder="password"
                          style={{ height: 44, borderRadius: 10 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="confirm_password"
                        dependencies={["password"]}
                        label={<Text strong style={{ color: "#16445f" }}>confirm_password</Text>}
                        rules={[
                          { required: true, message: "กรุณายืนยัน password" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน"));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          placeholder="confirm password"
                          style={{ height: 44, borderRadius: 10 }}
                        />
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
