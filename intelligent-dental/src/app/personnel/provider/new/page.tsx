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

      message.success("à¹€à¸žà¸´à¹ˆà¸¡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¸›à¹ˆà¸§à¸¢à¸ªà¸³à¹€à¸£à¹‡à¸ˆ (mock)");
      router.push("/personnel/provider");
    });
  };

  return (
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            à¹€à¸žà¸´à¹ˆà¸¡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¸›à¹ˆà¸§à¸¢
          </Title>
        </Col>

        <Col>
          <Button icon={<ArrowLeft size={16} />} onClick={() => router.back()}>
            à¸à¸¥à¸±à¸š
          </Button>
        </Col>
      </Row>

      <Form layout="vertical" form={form}>
        {/* ================= à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸±à¹ˆà¸§à¹„à¸› ================= */}
        <Card title="à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸±à¹ˆà¸§à¹„à¸›" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="firstName"
                label="à¸Šà¸·à¹ˆà¸­"
                rules={[{ required: true, message: "à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸Šà¸·à¹ˆà¸­" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="lastName"
                label="à¸™à¸²à¸¡à¸ªà¸à¸¸à¸¥"
                rules={[{ required: true, message: "à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸™à¸²à¸¡à¸ªà¸à¸¸à¸¥" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="citizenId"
                label="à¹€à¸¥à¸‚à¸šà¸±à¸•à¸£à¸›à¸£à¸°à¸Šà¸²à¸Šà¸™"
                rules={[
                  { required: true, message: "à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¹€à¸¥à¸‚à¸šà¸±à¸•à¸£" },
                  { len: 13, message: "à¸•à¹‰à¸­à¸‡ 13 à¸«à¸¥à¸±à¸" },
                ]}
              >
                <Input maxLength={13} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="birthDate"
                label="à¸§à¸±à¸™à¹€à¸à¸´à¸”"
                rules={[{ required: true, message: "à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸§à¸±à¸™à¹€à¸à¸´à¸”" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ================= à¸•à¸´à¸”à¸•à¹ˆà¸­ ================= */}
        <Card title="à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸•à¸´à¸”à¸•à¹ˆà¸­" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="à¹€à¸šà¸­à¸£à¹Œà¹‚à¸—à¸£"
                rules={[
                  { required: true },
                  { pattern: /^[0-9]{10}$/, message: "à¸•à¹‰à¸­à¸‡ 10 à¸«à¸¥à¸±à¸" },
                ]}
              >
                <Input maxLength={10} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="email"
                label="à¸­à¸µà¹€à¸¡à¸¥"
                rules={[{ type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="address" label="à¸—à¸µà¹ˆà¸­à¸¢à¸¹à¹ˆ">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ================= à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸à¸²à¸£à¸£à¸±à¸à¸©à¸² ================= */}
        <Card title="à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸²à¸‡à¸à¸²à¸£à¹à¸žà¸—à¸¢à¹Œ" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="allergy" label="à¸›à¸£à¸°à¸§à¸±à¸•à¸´à¸à¸²à¸£à¹à¸žà¹‰à¸¢à¸²">
                <Input placeholder="à¹€à¸Šà¹ˆà¸™ à¹à¸žà¹‰à¹€à¸žà¸™à¸´à¸‹à¸´à¸¥à¸¥à¸´à¸™" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="chronicDisease" label="à¹‚à¸£à¸„à¸›à¸£à¸°à¸ˆà¸³à¸•à¸±à¸§">
                <Input placeholder="à¹€à¸Šà¹ˆà¸™ à¹€à¸šà¸²à¸«à¸§à¸²à¸™ / à¸„à¸§à¸²à¸¡à¸”à¸±à¸™" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="note" label="à¸«à¸¡à¸²à¸¢à¹€à¸«à¸•à¸¸à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡">
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
            à¸šà¸±à¸™à¸—à¸¶à¸
          </Button>
        </Row>
      </Form>
    </div>
  );
}

