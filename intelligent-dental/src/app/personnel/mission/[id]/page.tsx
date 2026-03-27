'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, Typography, Button, Input, Form,
  Select, Spin, Space, Modal, Breadcrumb, Divider, Tag,
} from 'antd';
import {
  SaveOutlined, DeleteOutlined, HomeOutlined,
  EditOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';

import { useMobileDentalDetail } from '@/hook/useMobileDentalDetail';
import type { MobileDentalStatus } from '@/hook/useMobileDentalDetail';

const { Title, Text } = Typography;

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_META: Record<MobileDentalStatus, { label: string; color: string }> = {
  request:        { label: 'รออนุมัติ',           color: 'blue'    },
  scheduled:      { label: 'อนุมัติแล้ว',          color: 'green'   },
  completed:      { label: 'เสร็จสิ้น',            color: 'default' },
  request_cancel: { label: 'คำขอยกเลิกจากผู้ใช้',  color: 'orange'  },
  cancel:         { label: 'ยกเลิกการออกหน่วย',    color: 'red'     },
};

// สถานะที่อนุญาตให้แก้ไขข้อมูลได้
const EDITABLE_STATUSES: MobileDentalStatus[] = ['request'];

// สถานะที่อนุญาตให้กดยกเลิกได้
const CANCELLABLE_STATUSES: MobileDentalStatus[] = ['request', 'request_cancel'];

// ── Component ──────────────────────────────────────────────────────────────────

export default function MobileDentalDetailPage() {
  const router  = useRouter();
  const params  = useParams();
  const idParam = params.id as string;

  const [form]              = Form.useForm();
  const [isMounted, setIsMounted]                     = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  const { mobileDental, loading, saving, updateMobileDental } =
    useMobileDentalDetail(idParam);

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => { setIsMounted(true); }, []);

  // pre-fill form เมื่อได้ข้อมูลจาก API
  useEffect(() => {
    if (mobileDental) {
      form.setFieldsValue({
        date:    dayjs(mobileDental.date).format('YYYY-MM-DD'),
        address: mobileDental.address,
        count:   mobileDental.count,
        status:  mobileDental.status,
      });
    }
  }, [mobileDental, form]);

  // ── Derived state ─────────────────────────────────────────────────────────────

  const currentStatus  = mobileDental?.status;
  const isReadOnly     = !currentStatus || !EDITABLE_STATUSES.includes(currentStatus);
  const canCancel      = !!currentStatus && CANCELLABLE_STATUSES.includes(currentStatus);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleUpdate = async (values: { status: MobileDentalStatus }) => {
    if (!mobileDental) return;
    await updateMobileDental(
      {
        company: mobileDental.company, // ส่ง company object เดิมกลับไป
        status:  values.status,
      },
      () => router.push('/personnel/mission'),
    );
  };

  const handleConfirmCancel = async () => {
    if (!mobileDental) return;
    await updateMobileDental(
      {
        company: mobileDental.company,
        status:  'cancel',
      },
      () => {
        setIsCancelModalVisible(false);
        router.push('/personnel/mission');
      },
    );
  };

  // ── Loading / Mount guard ─────────────────────────────────────────────────────

  if (!isMounted || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!mobileDental) return null;

  const statusMeta = STATUS_META[mobileDental.status];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <a onClick={() => router.push('/personnel/mission')}><EnvironmentOutlined /> ตารางการออกหน่วย</a> },
          { title: <span><EditOutlined /> รายละเอียดการออกหน่วย</span> },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ marginBottom: '4px' }}>
              รายละเอียดการออกหน่วย (รหัส: {idParam})
            </Title>
            <Text type="secondary">ปรับปรุงข้อมูลหรือตรวจสอบสถานะของการออกหน่วย</Text>
          </div>

          <Button
            danger
            type={currentStatus === 'request_cancel' ? 'primary' : 'default'}
            icon={<DeleteOutlined />}
            disabled={!canCancel}
            onClick={() => setIsCancelModalVisible(true)}
          >
            {currentStatus === 'request_cancel' ? 'ยืนยันการยกเลิก' : 'ยกเลิกการออกหน่วย'}
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpdate}>

          {/* ชื่อบริษัท — อ่านอย่างเดียว */}
          <Form.Item label="ชื่อหน่วยงาน/บริษัท">
            <Input size="large" disabled value={mobileDental.company?.office_name || 'ไม่ระบุ'} />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* วันที่ — อ่านอย่างเดียว (API ไม่รับ field นี้ใน PUT) */}
            <Form.Item name="date" label="วันที่ออกหน่วย" style={{ flex: 1, minWidth: '250px' }}>
              <Input type="date" size="large" disabled />
            </Form.Item>

            {/* จำนวนคน — อ่านอย่างเดียว (API ไม่รับ field นี้ใน PUT) */}
            <Form.Item name="count" label="จำนวนคนไข้ (ประเมิน)" style={{ flex: 1, minWidth: '250px' }}>
              <Input type="number" size="large" disabled />
            </Form.Item>
          </div>

          {/* ที่อยู่ — อ่านอย่างเดียว (API ไม่รับ field นี้ใน PUT) */}
          <Form.Item name="address" label="สถานที่จัดกิจกรรม">
            <Input.TextArea rows={3} size="large" disabled />
          </Form.Item>

          <Divider />

          {/* สถานะ */}
          <Form.Item label="สถานะ">
            {!isReadOnly ? (
              <Form.Item name="status" noStyle>
                <Select size="large">
                  <Select.Option value="request">รออนุมัติ (Request)</Select.Option>
                  <Select.Option value="scheduled">อนุมัติแล้ว (Scheduled)</Select.Option>
                  <Select.Option value="cancel">ยกเลิก (Cancel)</Select.Option>
                </Select>
              </Form.Item>
            ) : (
              <div style={{ marginTop: '8px' }}>
                <Tag
                  color={statusMeta.color}
                  style={{ fontSize: '14px', padding: '4px 12px' }}
                >
                  {statusMeta.label}
                </Tag>
                {currentStatus === 'request_cancel' && (
                  <Text type="danger" style={{ marginLeft: '12px' }}>
                    * ผู้ใช้งานต้องการยกเลิก กรุณากดปุ่ม <b>"ยืนยันการยกเลิก"</b> ที่มุมขวาบน
                  </Text>
                )}
              </div>
            )}
          </Form.Item>

          {/* ปุ่ม */}
          <Form.Item style={{ marginTop: '32px', marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => router.push('/personnel/mission')}>
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

      {/* Modal ยืนยันการยกเลิก */}
      <Modal
        title={
          <span>
            <DeleteOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
            ยืนยันการยกเลิกการออกหน่วย
          </span>
        }
        open={isCancelModalVisible}
        onOk={handleConfirmCancel}
        onCancel={() => setIsCancelModalVisible(false)}
        okText="ยืนยันยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true, loading: saving }}
      >
        <Text>คุณแน่ใจหรือไม่ที่จะยกเลิกคิวการออกหน่วยทันตกรรมเคลื่อนที่นี้?</Text>
      </Modal>

    </div>
  );
}