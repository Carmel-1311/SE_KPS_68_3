"use client";

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Typography,
  message,
  DatePicker,
  Breadcrumb,
  Space,
  Divider
} from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";

export default function CreateUserPage() {
  const { Title, Text } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();

  const onSubmit = () => {
    form.validateFields().then((values) => {
      console.log("mock create patient:", values);
      message.success("บันทึกข้อมูลสำเร็จ");
      router.push("/personnel/provider");
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: 40,
        background: "#f6f7fb"
      }}
    >
      <div style={{ width: 900 }}>

        {/* 🔹 Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            {
              title: (
                <Link href="/">
                  <HomeOutlined /> หน้าหลัก
                </Link>
              )
            },
            {
              title: (
                <Link href="/personnel/provider">
                  <UserOutlined /> ข้อมูลผู้ใช้
                </Link>
              )
            },
            {
              title: "เพิ่มผู้ให้บริการ"
            }
          ]}
        />

        {/* 🔹 Header */}
        <Card
          style={{
            borderRadius: 14,
            boxShadow: "0 6px 30px rgba(0,0,0,0.08)"
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ marginBottom: 4 }}>
                เพิ่มผู้ให้บริการใหม่
              </Title>
              <Text type="secondary">
                กรอกข้อมูลผู้ใช้งานใหม่เข้าสู่ระบบ
              </Text>
            </Col>

            <Col>
              <Button
                icon={<ArrowLeft size={16} />}
                onClick={() => router.back()}
              >
                กลับ
              </Button>
            </Col>
          </Row>

          <Divider />

          <Form layout="vertical" form={form}>

            {/* ================= ข้อมูลทั่วไป ================= */}
            <Card
              type="inner"
              title="ข้อมูลทั่วไป"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="firstName"
                    label="ชื่อ"
                    rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                  >
                    <Input placeholder="ชื่อ" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="lastName"
                    label="นามสกุล"
                    rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                  >
                    <Input placeholder="นามสกุล" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="citizenId"
                    label="เลขประจำตัวประชาชน"
                    rules={[
                      { required: true, message: "กรุณากรอก" },
                      { len: 13, message: "ต้องมี 13 หลัก" }
                    ]}
                  >
                    <Input maxLength={13} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="birthDate"
                    label="วันเกิด"
                    rules={[{ required: true }]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* ================= ข้อมูลติดต่อ ================= */}
            <Card
              type="inner"
              title="ข้อมูลติดต่อ"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="เบอร์โทรศัพท์"
                    rules={[
                      { required: true },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "ต้องมี 10 หลัก"
                      }
                    ]}
                  >
                    <Input maxLength={10} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="อีเมล"
                    rules={[{ type: "email" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="address" label="ที่อยู่">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* ================= ข้อมูลการรักษา ================= */}
            <Card type="inner" title="ข้อมูลการรักษา">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="allergy" label="ประวัติการแพ้ยา">
                    <Input placeholder="เช่น Penicillin" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider />

            {/* 🔹 ACTION */}
            <Row justify="end">
              <Space>
                <Button onClick={() => router.back()}>
                  ยกเลิก
                </Button>

                <Button
                  type="primary"
                  icon={<Save size={16} />}
                  onClick={onSubmit}
                >
                  บันทึกข้อมูล
                </Button>
              </Space>
            </Row>

          </Form>
        </Card>
      </div>
    </div>
  );
}