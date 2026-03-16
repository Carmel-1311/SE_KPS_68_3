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
} from "antd";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateUserPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();

  const onSubmit = () => {
    form.validateFields().then((values) => {
      console.log("mock create patient:", values);

      message.success("ย้อนกลับไปยังหน้าผู้ให้บริการ");
      router.push("/personnel/provider");
    });
  };

  return (
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            ดำเนินการเพิ่มผู้ให้บริการใหม่
          </Title>
        </Col>

        <Col>
          <Button icon={<ArrowLeft size={16} />} onClick={() => router.back()}>
            กลับ
          </Button>
        </Col>
      </Row>

      <Form layout="vertical" form={form}>
        {/* ================= ข้อมูลทั่วไป ================= */}
        <Card title="ข้อมูลทั่วไป" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="firstName"
                label="ชื่อ"
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="lastName"
                label="นามสกุล"
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="citizenId"
                label="เลขประจำตัวประชาชน"
                rules={[
                  { required: true, message: "กรุณากรอกเลขประจำตัวประชาชน" },
                  { len: 13, message: "ต้องมี 13 หลัก" },
                ]}
              >
                <Input maxLength={13} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="birthDate"
                label="วันเกิด"
                rules={[{ required: true, message: "กรุณาเลือกวันเกิด" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ================= ข้อมูลติดต่อ ================= */}
        <Card title="ข้อมูลติดต่อ" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="เบอร์โทรศัพท์"
                rules={[
                  { required: true },
                  { pattern: /^[0-9]{10}$/, message: "ต้องมี 10 หลัก" },
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
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ================= ข้อมูลการรักษา ================= */}
        <Card title="ข้อมูลการรักษา" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="allergy" label="ประวัติการแพ้ยา">
                <Input placeholder="เช่น แพ้ยาอะไรรึเปล่า" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="chronicDisease" label="โรคประจำตัว">
                <Input placeholder="เช่น เบาหวาน / ความดัน" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="note" label="หมายเหตุ">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ================= ACTION ================= */}
        <Row justify="end">
          <Button
            type="primary"
            icon={<Save size={16} />}
            onClick={onSubmit}
          >
            บันทึก
          </Button>
        </Row>
      </Form>
    </div>
  );
}

