'use client';

import React, { useEffect } from 'react';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';

import { useEditAppointment } from '@/hook/useEditAppointment';

const { Title, Text } = Typography;

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id as string;

  const [form] = Form.useForm();
  const [isCancelModalVisible, setIsCancelModalVisible] = React.useState(false);

  const {
    appointment,
    loading,
    saving,
    availableSlots,
    loadingSlots,
    fetchAvailableSlots,
    updateAppointment,
    deleteAppointment,
  } = useEditAppointment(idParam);

  useEffect(() => {
    if (!appointment) return;

    form.setFieldsValue({
      appointment_date: dayjs(appointment.appointment_date).format('YYYY-MM-DD'),
      appointment_time: dayjs(`2000-01-01 ${appointment.appointment_time}`).format(
        'HH:mm'
      ),
      type: appointment.type,
      status: appointment.status,
    });

    fetchAvailableSlots(appointment.appointment_date);
  }, [appointment, form, fetchAvailableSlots]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldValue('appointment_time', undefined);
    fetchAvailableSlots(new Date(e.target.value).toISOString());
  };

  const handleUpdate = async (values: {
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'request_cancel';
  }) => {
    if (!appointment) return;

    await updateAppointment(
      {
        appointment_date: values.appointment_date,
        appointment_time: new Date(
          `2026-01-01T${dayjs(`2000-01-01 ${values.appointment_time}`)
            .add(7, 'hour')
            .format('HH:mm:ss')}`
        ).toISOString(),
        type: values.type,
        status: values.status,
        staff_id: appointment.staff.id,
      },
      () => router.push('/personnel/appointment-schedule')
    );
  };

  const handleConfirmDelete = async () => {
    await deleteAppointment(() => {
      setIsCancelModalVisible(false);
      router.push('/personnel/appointment-schedule');
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!appointment) return null;

  const isRequestCancel = appointment.status === 'request_cancel';
  const isCompleted = appointment.status === 'completed';
  const isReadOnly = isRequestCancel || isCompleted;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Breadcrumb
        items={[
          {
            title: (
              <a onClick={() => router.push('/')}>
                <HomeOutlined /> หน้าหลัก
              </a>
            ),
          },
          {
            title: (
              <a onClick={() => router.push('/personnel/appointment-schedule')}>
                <CalendarOutlined /> ตารางการนัดหมาย
              </a>
            ),
          },
          {
            title: (
              <span>
                <EditOutlined /> แก้ไขการนัดหมาย
              </span>
            ),
          },
        ]}
      />

      <Card style={{ marginTop: 16 }}>
        <Row
          gutter={[16, 16]}
          align="middle"
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
          <Col xs={24} md={16}>
            <Title level={3} style={{ margin: 0 }}>
              แก้ไขการนัดหมาย (รหัส: {appointment.appointment_id})
            </Title>
            <Text type="secondary">ปรับปรุงข้อมูลหรือสถานะของการนัดหมายนี้</Text>
          </Col>

          <Col xs={24} md="auto">
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={appointment.status === 'cancelled'}
              onClick={() => setIsCancelModalVisible(true)}
            >
              ยกเลิกการนัดหมาย
            </Button>
          </Col>
        </Row>

        {isRequestCancel && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
            message="ผู้ป่วยส่งคำขอยกเลิกมาแล้ว"
            description='กรุณาเปลี่ยนสถานะเป็น &quot;ยกเลิกการนัดหมาย&quot; เพื่อยืนยัน'
          />
        )}

        {isCompleted && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
            message="นัดหมายนี้เสร็จสิ้นแล้ว"
            description="ระบบปิดการแก้ไขรายละเอียดนัดหมายนี้"
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="คนไข้">
                <Input size="large" value={appointment.patient.name} disabled />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="ทันตแพทย์">
                <Input size="large" value={appointment.staff.name} disabled />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="appointment_date"
                label="วันที่นัด"
                rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
              >
                <Input
                  type="date"
                  size="large"
                  onChange={handleDateChange}
                  disabled={isReadOnly}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="appointment_time"
                label="เวลา"
                rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}
              >
                <Select
                  size="large"
                  placeholder="เลือกเวลา"
                  loading={loadingSlots}
                  disabled={isReadOnly || loadingSlots}
                >
                  {availableSlots.map((slot) => {
                    const displayTime = dayjs(`2000-01-01 ${slot.time}`)
                      .subtract(7, 'hour')
                      .format('HH:mm');

                    return (
                      <Select.Option key={slot.time} value={displayTime}>
                        {displayTime} น.
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="type"
                label="ประเภทการรักษา"
                rules={[{ required: true, message: 'ระบุประเภทการนัดหมาย' }]}
              >
                <Select
                  size="large"
                  placeholder="เลือกประเภทการรักษา"
                  disabled={isReadOnly}
                >
                  {[
                    'ตรวจฟัน',
                    'อุดฟัน',
                    'ขูดหินปูน',
                    'ถอนฟัน',
                    'รักษารากฟัน',
                    'ครอบฟัน',
                    'ฟอกสีฟัน',
                  ].map((type) => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="status" label="สถานะ">
                <Select size="large" disabled={isReadOnly}>
                  <Select.Option value="scheduled">รอดำเนินการ</Select.Option>
                  <Select.Option value="completed">เสร็จสิ้น</Select.Option>
                  <Select.Option value="cancelled">ยกเลิกการนัดหมาย</Select.Option>
                  {appointment.status === 'request_cancel' && (
                    <Select.Option value="request_cancel">
                      ส่งคำขอยกเลิกแล้ว
                    </Select.Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                size="large"
                onClick={() => router.push('/personnel/appointment-schedule')}
              >
                ย้อนกลับ
              </Button>
              {!isReadOnly && (
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                >
                  บันทึกการแก้ไข
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={
          <span>
            <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            ยืนยันการยกเลิกนัดหมาย
          </span>
        }
        open={isCancelModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsCancelModalVisible(false)}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true }}
      >
        <Text>
          คุณแน่ใจหรือไม่ที่จะยกเลิกการนัดหมายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
        </Text>
      </Modal>
    </div>
  );
}
