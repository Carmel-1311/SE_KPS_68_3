"use client";

import { useState, type ChangeEvent } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Col,
  Space,
  Typography,
  message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { mockUserProfile, type UserProfile } from "@/mock/mockUserProfile";

const thaiMonthsShort = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];
const formatThaiDate = (dateValue: string) => {
  const date = dayjs(dateValue);
  if (!date.isValid()) return dateValue;
  return `${date.format("DD")} ${thaiMonthsShort[date.month()]} ${date.format(
    "YYYY",
  )}`;
};

function UserForm() {
  const [form] = Form.useForm<UserProfile>();
  const [formData, setFormData] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  const showNotification = (type: "success" | "error", messageText: string) => {
    if (type === "success") {
      messageApi.success(messageText);
    } else {
      messageApi.error(messageText);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsEditing(false);
      showNotification("success", "ข้อมูลได้รับการบันทึกเรียบร้อย");
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("error", "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissConfirm = () => {
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      allergy: mockUserProfile.allergy,
    }));
    form.setFieldsValue({ allergy: mockUserProfile.allergy });
    setIsEditing(false);
  };

  return (
    <>
      {messageContextHolder}

      <Modal
        open={showConfirm}
        title="ยืนยันการบันทึก"
        onCancel={handleDismissConfirm}
        onOk={handleConfirmSave}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={isSaving}
      >
        <Typography.Text>คุณต้องการบันทึกข้อมูลใช่หรือไม่?</Typography.Text>
      </Modal>

      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Card>
          <Space size={16} align="center">
            <Avatar size={56} style={{ backgroundColor: "#e6f4ff", color: "#1677ff" }}>
              {formData.name.charAt(0)}
            </Avatar>
            <Space orientation="vertical" size={2}>
              <Typography.Text strong>{formData.name}</Typography.Text>
              <Typography.Text type="secondary">{formData.email}</Typography.Text>
              <Typography.Text type="secondary">{formData.phone}</Typography.Text>
            </Space>
          </Space>
        </Card>

        <Card title="ข้อมูลทั่วไป">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="วันเกิด (Birthday)">
              {formatThaiDate(formData.birthday)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="ข้อมูลอาการแพ้ (Allergy)">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ allergy: formData.allergy }}
          >
            <Form.Item name="allergy">
              <Input.TextArea
                name="allergy"
                rows={4}
                disabled={!isEditing}
                onChange={handleChange}
              />
            </Form.Item>
          </Form>
        </Card>

        <Space size={12} wrap>
          {!isEditing ? (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              แก้ไข (Edit)
            </Button>
          ) : (
            <>
              <Button type="primary" onClick={handleSave} loading={isSaving}>
                บันทึก (Save)
              </Button>
              <Button onClick={handleCancel}>ยกเลิก (Cancel)</Button>
            </>
          )}
        </Space>
      </Space>
    </>
  );
}

export default function UserProfilePage() {
  return (
    <div style={{ padding: "24px 16px" }}>
      <Row justify="center">
        <Col xs={24} sm={22} md={18} lg={12} xl={10}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Typography.Title level={3} style={{ margin: 0, textAlign: "center" }}>
              ข้อมูลส่วนตัว
            </Typography.Title>
            <UserForm />
          </Space>
        </Col>
      </Row>
    </div>
  );
}
