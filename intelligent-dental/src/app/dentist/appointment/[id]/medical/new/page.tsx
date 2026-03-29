"use client";

import {
  Form,
  DatePicker,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Divider,
  Row,
  Col,
  message,
  Spin,
} from "antd";

import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

// ✅ hooks
import { useMedicalRecord } from "@/hook/useMedicalRecord";
import { useAppointments } from "@/hook/useAppointments2";
import { useEditAppointment } from "@/hook/useEditAppointment"; // 👈 แนะนำให้มี
import { withAuthHeaders } from "@/app/utils/auth.client";
const { Title, Text } = Typography;

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointment_id");

  const [form] = Form.useForm();

  // 🔥 hooks
  const { createMedical, loading: creating } = useMedicalRecord();
  const { updateAppointment } = useEditAppointment(Number(appointmentId));
  const { getAppointmentById, loading: loadingAppointment } = useAppointments();

  const [appointment, setAppointment] = useState<any>(null);
  const [examTypes, setExamTypes] = useState<any[]>([]);

  // 🔥 load appointment
  useEffect(() => {
    const load = async () => {
      if (!appointmentId) return;

      const data = await getAppointmentById(Number(appointmentId));
      setAppointment(data);
    };

    load();
  }, [appointmentId]);

useEffect(() => {
  const loadTypes = async () => {
    const res = await fetch("/api/types", {
      headers: await withAuthHeaders(),
    });
    const data = await res.json();

    const types = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    setExamTypes(types);
  };

  loadTypes();
}, []);

  // 🔥 submit
  const onFinish = async (values: any) => {
    if (!appointment) {
      message.error("ไม่พบ appointment");
      return;
    }

    try {
      message.loading({ content: "กำลังบันทึก...", key: "save" });

      // ✅ 1. create medical
      const medical = await createMedical({
        patient_id: Number(params.id),
        date: values.date.format("YYYY-MM-DD"),
        history: values.history,
        status: "done",
        detail: values.detail.map((d: any) => ({
          type_id: Number(d.type_id),
          diagnosis: d.diagnosis,
        })),
        inspection_record_id: appointment.inspection_record_id || undefined,
      });

      // ✅ 2. update appointment
      await updateAppointment( {
        staff_id: appointment.staff_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        type: appointment.type,
        status: "completed",
        medical_record_id: String(medical.id),
        inspection_record_id: appointment.inspection_record_id || null,
      });

      message.success({ content: "บันทึกสำเร็จ", key: "save" });

      router.push(`/dentist/appointment?medical_record_id=${medical.id}`);
    } catch (err) {
      console.error(err);
      message.error({ content: "เกิดข้อผิดพลาด", key: "save" });
    }
  };

  if (loadingAppointment) {
    return <Spin style={{ display: "block", margin: "100px auto" }} />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: 16 }}
      >
        ย้อนกลับ
      </Button>

      <Card>
        <Title level={3}>
          <MedicineBoxOutlined style={{ color: "#52c41a" }} /> เพิ่มประวัติการรักษา
        </Title>

        {/* 🔥 Appointment Info */}
        {appointment && (
          <Card style={{ marginBottom: 16, background: "#fafafa" }}>
            <Text strong>ข้อมูลการนัด</Text>
            <br />
            <Text>วันที่: {appointment.appointment_date}</Text>
            <br />
            <Text>เวลา: {appointment.appointment_time}</Text>
            <br />
            <Text>ประเภท: {appointment.type}</Text>
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            date: dayjs(),
            detail: [{ type_id: undefined, diagnosis: "" }],
          }}
        >
          {/* inspection auto */}
          <Form.Item label="ประวัติการตรวจ">
            {appointment?.inspection_record_id ? (
              <Text strong style={{ color: "#1890ff" }}>
                มี (ID: {appointment.inspection_record_id})
              </Text>
            ) : (
              <Text type="secondary">ไม่มี</Text>
            )}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="วันที่" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="history"
            label="ประวัติการรักษา"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Divider>Diagnosis</Divider>

          <Form.List name="detail">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card key={key} style={{ marginBottom: 12 }}>
                    <Row gutter={16}>
                      <Col span={10}>
                        <Form.Item
                          name={[name, "type_id"]}
                          label="ประเภท"
                          rules={[{ required: true }]}
                        >
                          <Select>
                            {examTypes.map((t) => (
                              <Select.Option key={t.id} value={t.id}>
                                {t.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={10}>
                        <Form.Item
                          name={[name, "diagnosis"]}
                          label="Diagnosis"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Button
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}

                <Button onClick={() => add()} icon={<PlusOutlined />} block>
                  เพิ่มรายการ
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={creating}
            block
            style={{ background: "#52c41a" }}
          >
            บันทึก
          </Button>
        </Form>
      </Card>
    </div>
  );
}