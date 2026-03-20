"use client";

import { useEffect, useState, type ChangeEvent } from "react";
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
import { usePatientProfile, type UserProfile } from "@/hook/usePatientProfile";
import { withAuthHeaders } from "@/app/utils/auth.client";

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
  const { profile, loading, error, setProfile } = usePatientProfile();
  const [formData, setFormData] = useState<UserProfile | null>(null);
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

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      form.setFieldsValue({ allergy: profile.allergy ?? "" });
    }
  }, [form, profile]);

  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error, messageApi]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : prev,
    );
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
      if (!formData) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      const allergy = form.getFieldValue("allergy") ?? "";
      const [firstName, ...rest] = formData.name.trim().split(" ");
      const lastName = rest.join(" ");
      const response = await fetch(`/api/patients/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders()
        },
        body: JSON.stringify({
          first_name: firstName || formData.name,
          last_name: lastName,
          birthday: formData.birthday,
          allergy,
          email: formData.email,
          phone: formData.phone
        })
      });

      const result = (await response.json()) as {
        data?: UserProfile;
        error?: { message?: string };
        message?: string;
      };
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || "บันทึกไม่สำเร็จ");
      }

      const updated = result.data ?? { ...formData, allergy };
      setFormData(updated);
      setProfile(updated);
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
    if (profile) {
      setFormData(profile);
      form.setFieldsValue({ allergy: profile.allergy ?? "" });
    }
    setIsEditing(false);
  };

  if (loading && !formData) {
    return <Typography.Text>กำลังโหลดข้อมูล...</Typography.Text>;
  }

  if (!formData) {
    return <Typography.Text>ไม่พบข้อมูล</Typography.Text>;
  }

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
