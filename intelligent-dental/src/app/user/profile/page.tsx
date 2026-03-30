"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { House, UserRound } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hook/useUser";

const { Title, Text, Paragraph } = Typography;

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

const formatThaiDate = (dateValue?: string) => {
  if (!dateValue) return "-";
  const date = dayjs(dateValue);
  if (!date.isValid()) return dateValue;
  return `${date.format("DD")} ${thaiMonthsShort[date.month()]} ${date.year() + 543}`;
};

const formatPhoneNumber = (phone?: string) => {
  if (!phone) return "-";

  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

function ProfileLoadingState() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <Card
        variant="borderless"
        style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
      >
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </Card>
    </div>
  );
}

type ProfileDetailsProps = {
  user: NonNullable<ReturnType<typeof useUser>["user"]>;
  error: string | null;
  updateProfile: ReturnType<typeof useUser>["updateProfile"];
};

function ProfileDetails({ user, error, updateProfile }: ProfileDetailsProps) {
  const [form] = Form.useForm<{ allergy: string }>();
  const [draftAllergy, setDraftAllergy] = useState(user.allergy ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  useEffect(() => {
    const allergy = user.allergy ?? "";
    form.setFieldsValue({ allergy });
    setDraftAllergy(allergy);
  }, [form, user]);

  const stats = useMemo(
    () => [
      {
        key: "birthday",
        label: "วันเกิด",
        value: formatThaiDate(user.birthday),
        accent: "#1677ff",
        background: "rgba(22, 119, 255, 0.08)",
      },
      {
        key: "allergy",
        label: "ข้อมูลแพ้ยา",
        value: user.allergy?.trim() ? "อัปเดตแล้ว" : "ยังไม่ระบุ",
        accent: user.allergy?.trim() ? "#fa8c16" : "#8c8c8c",
        background: user.allergy?.trim() ? "rgba(250, 140, 22, 0.10)" : "rgba(0, 0, 0, 0.04)",
      },
      {
        key: "contact",
        label: "ช่องทางติดต่อ",
        value: user.phone?.trim() && user.email?.trim() ? "ครบถ้วน" : "ควรตรวจสอบ",
        accent: user.phone?.trim() && user.email?.trim() ? "#13a8a8" : "#d46b08",
        background:
          user.phone?.trim() && user.email?.trim() ? "rgba(19, 168, 168, 0.10)" : "rgba(212, 107, 8, 0.10)",
      },
    ],
    [user]
  );

  const handleStartEdit = () => {
    const allergy = user.allergy ?? "";
    setDraftAllergy(allergy);
    form.setFieldsValue({ allergy });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    const allergy = user.allergy ?? "";
    setDraftAllergy(allergy);
    form.setFieldsValue({ allergy });
    setIsEditing(false);
  };

  const handleSubmitEdit = async () => {
    try {
      const values = await form.validateFields();
      setDraftAllergy(values.allergy ?? "");
      setShowConfirm(true);
    } catch {
      return;
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setIsSaving(true);

    try {
      await updateProfile({
        id: user.id,
        name: user.name,
        birthday: user.birthday,
        allergy: draftAllergy.trim(),
        email: user.email,
        phone: user.phone,
      });
      setIsEditing(false);
      messageApi.success("บันทึกข้อมูลโปรไฟล์เรียบร้อย");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      messageApi.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {messageContextHolder}

      <Modal
        open={showConfirm}
        title="ยืนยันการบันทึกข้อมูล"
        onOk={() => void handleConfirmSave()}
        onCancel={() => setShowConfirm(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={isSaving}
      >
        <Text>ต้องการบันทึกการเปลี่ยนแปลงข้อมูลแพ้ยาหรือไม่?</Text>
      </Modal>

      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Space orientation="vertical" size={24} style={{ width: "100%" }}>
          <div>
            <Space size={8} style={{ marginBottom: 16, color: "#8c8c8c" }} wrap>
              <Link
                href="/user/profile"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "inherit" }}
              >
                <House size={16} />
                <span>หน้าหลักผู้ใช้</span>
              </Link>
              <Text type="secondary">/</Text>
              <Space size={8}>
                <UserRound size={16} />
                <Text type="secondary">โปรไฟล์ของฉัน</Text>
              </Space>
            </Space>

            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Card
                  variant="borderless"
                  style={{
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                    border: "1px solid rgba(22, 119, 255, 0.08)",
                  }}
                  styles={{ body: { padding: 28 } }}
                >
                  <Space
                    align="start"
                    size={20}
                    style={{ width: "100%", justifyContent: "space-between" }}
                    wrap
                  >
                    <Space size={16} align="start">
                      <Avatar
                        size={72}
                        style={{
                          backgroundColor: "#e6f4ff",
                          color: "#1677ff",
                          fontSize: 24,
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>

                      <Space orientation="vertical" size={4}>
                        <Tag color="blue" style={{ width: "fit-content", borderRadius: 999 }}>
                          ข้อมูลผู้ใช้
                        </Tag>
                        <Title level={2} style={{ margin: 0 }}>
                          {user.name}
                        </Title>
                        <Space size={12} wrap>
                          <Space size={6}>
                            <MailOutlined style={{ color: "#8c8c8c" }} />
                            <Text type="secondary">{user.email || "-"}</Text>
                          </Space>
                          <Space size={6}>
                            <PhoneOutlined style={{ color: "#8c8c8c" }} />
                            <Text type="secondary">{formatPhoneNumber(user.phone)}</Text>
                          </Space>
                        </Space>

                        <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                          {stats.map((item) => (
                            <Col xs={24} sm={12} xl={8} key={item.key}>
                              <div
                                style={{
                                  minWidth: 140,
                                  borderRadius: 14,
                                  padding: "12px 14px",
                                  background: item.background,
                                  border: "1px solid rgba(0, 0, 0, 0.05)",
                                }}
                              >
                                <Text
                                  type="secondary"
                                  style={{ display: "block", fontSize: 12, marginBottom: 4 }}
                                >
                                  {item.label}
                                </Text>
                                <Text strong style={{ color: item.accent, fontSize: 15 }}>
                                  {item.value}
                                </Text>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Space>
                    </Space>

                    {!isEditing ? (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleStartEdit}
                        style={{ borderRadius: 10 }}
                      >
                        แก้ไขข้อมูลแพ้ยา
                      </Button>
                    ) : (
                      <Space wrap>
                        <Button onClick={handleCancelEdit} style={{ borderRadius: 10 }}>
                          ยกเลิก
                        </Button>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => void handleSubmitEdit()}
                          loading={isSaving}
                          style={{ borderRadius: 10 }}
                        >
                          บันทึกข้อมูล
                        </Button>
                      </Space>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>

          {error && (
            <Alert
              type="error"
              showIcon
              message="เกิดข้อผิดพลาด"
              description={error}
            />
          )}

          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card
                title={
                  <Space size={8}>
                    <SafetyCertificateOutlined />
                    <span>ข้อมูลแพ้ยา</span>
                  </Space>
                }
                extra={
                  <Tag color={user.allergy?.trim() ? "orange" : "default"} style={{ borderRadius: 999 }}>
                    {user.allergy?.trim() ? "มีข้อมูล" : "ยังไม่ระบุ"}
                  </Tag>
                }
                variant="borderless"
                style={{
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  height: "100%",
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Form form={form} layout="vertical">
                  <Form.Item
                    label={<Text strong>รายละเอียดการแพ้ยา / ข้อควรระวัง</Text>}
                    name="allergy"
                    rules={[
                      {
                        max: 1000,
                        message: "กรุณาระบุข้อมูลไม่เกิน 1000 ตัวอักษร",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={6}
                      placeholder="ระบุข้อมูลการแพ้ยา หรือข้อควรระวังด้านสุขภาพที่เกี่ยวข้อง"
                      disabled={!isEditing}
                      onChange={(event) => setDraftAllergy(event.target.value)}
                      style={{ borderRadius: 10, resize: "none" }}
                    />
                  </Form.Item>
                </Form>

                {!isEditing ? (
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    ข้อมูลส่วนนี้ใช้เพื่อช่วยให้ทีมทันตกรรมเห็นข้อควรระวังเบื้องต้นก่อนให้บริการ
                  </Paragraph>
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    title="โหมดแก้ไขข้อมูล"
                    description="ตรวจสอบรายละเอียดให้ถูกต้องก่อนกดบันทึก เพื่อให้ข้อมูลสุขภาพของคุณเป็นปัจจุบัน"
                    style={{ borderRadius: 12 }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </>
  );
}

function ProfileContent() {
  const { user, loading, error, updateProfile } = useUser();

  if (loading && !user) {
    return <ProfileLoadingState />;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Alert
          type="warning"
          showIcon
          message="ไม่พบข้อมูลผู้ใช้งาน"
          description={error ?? "ระบบไม่สามารถโหลดข้อมูลโปรไฟล์ได้"}
        />
      </div>
    );
  }

  return <ProfileDetails user={user} error={error} updateProfile={updateProfile} />;
}

export default function UserProfilePage() {
  return (
    <div style={{ padding: 24 }}>
      <ProfileContent />
    </div>
  );
}
