"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, Typography, Tag, Input, Modal, Descriptions, 
  Tooltip, Button, Space, Card 
} from "antd";
import { 
  SearchOutlined, ReadOutlined, IdcardOutlined,
  ClockCircleOutlined, CalendarOutlined, SolutionOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { ThemeWebColor } from "@/app/utils/constants";

dayjs.locale("th");
const { Title, Text } = Typography;

// --- Interface เดิม (คงเดิม) ---
interface Appointment {
  appointment_id: number;
  patient: { id: number; name: string };
  staff: { id: number; name: string };
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled" | "request_cancel";
  medical_record_id: number | null;
  inspection_record_id: number | null;
}

export default function AppointmentPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const mockApiResponse = {
      "data": [
        {
          "appointment_id": 1,
          "patient": { "id": 35, "name": "คุณวิภาดา สวยงาม" },
          "staff": { "id": 1, "name": "ทพ. สมพงษ์" },
          "appointment_date": "2026-03-16",
          "appointment_time": "09:30:00",
          "type": "ผู้ป่วยธรรมดา",
          "status": "scheduled",
          "medical_record_id": 501,
          "inspection_record_id": null
        },
        {
          "appointment_id": 2,
          "patient": { "id": 42, "name": "คุณสมชาย ใจดี" },
          "staff": { "id": 1, "name": "ทพ. สมพงษ์" },
          "appointment_date": "2026-03-16",
          "appointment_time": "13:00:00",
          "type": "ผู้ป่วยธรรมดา",
          "status": "completed",
          "medical_record_id": 502,
          "inspection_record_id": 601
        }
      ]
    };
    setTimeout(() => {
      setAppointments(mockApiResponse.data as Appointment[]);
      setLoading(false);
    }, 500);
  };

  const columns = [
    { title: "ID", dataIndex: "appointment_id", key: "id", width: 70 },
    { 
      title: "ชื่อ-นามสกุล", 
      dataIndex: ["patient", "name"], 
      key: "patientName", 
      render: (text: string) => <Text strong>{text}</Text> 
    },
    { 
      title: "วันที่", 
      dataIndex: "appointment_date", 
      key: "date", 
      render: (date: string) => dayjs(date).format("DD/MM/YYYY") 
    },
    { 
      title: "เวลา", 
      dataIndex: "appointment_time", 
      key: "time", 
      render: (time: string) => time.substring(0, 5) 
    },
    { title: "ประเภท", dataIndex: "type", key: "type" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: any = {
          scheduled: { color: "blue", text: "Scheduled" },
          completed: { color: "green", text: "Completed" },
          cancelled: { color: "red", text: "Cancelled" },
          request_cancel: { color: "orange", text: "Req. Cancel" }
        };
        const current = statusMap[status] || { color: "default", text: status };
        return <Tag color={current.color} bordered={false}>{current.text.toUpperCase()}</Tag>;
      },
    },
    {
      title: "จัดการ",
      key: "action",
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Appointment) => (
        <Tooltip title="รายละเอียด">
          <Button 
            type="text" 
            icon={<ReadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />} 
            onClick={() => { setSelectedAppointment(record); setIsModalOpen(true); }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <Card 
        bordered={false} 
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px' }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* ส่วน Header ที่อยู่ภายใน Card และไม่มีเส้นคั่น */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📅 ตารางการนัดหมาย</Title>
            <Text type="secondary">ตรวจสอบและจัดการรายการนัดหมายทั้งหมดในระบบ</Text>
          </div>
          <Input 
            placeholder="ค้นหาชื่อคนไข้..." 
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />} 
            style={{ width: 300 }} 
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        {/* ตารางข้อมูลที่อยู่ใต้ Header ทันที */}
        <Table 
          columns={columns} 
          dataSource={appointments.filter(a => a.patient.name.includes(searchText))}
          rowKey="appointment_id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15 }}
        />
      </Card>

      {/* --- Modal (คงเดิม) --- */}
      <Modal 
        title={<Space><SolutionOutlined style={{ color: '#1890ff' }} /><span>Full Appointment Details</span></Space>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={[<Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>Close</Button>]} 
        width={650}
      >
        {selectedAppointment && (
          <div style={{ marginTop: '16px' }}>
            <Descriptions bordered column={2} size="small" labelStyle={{ background: '#fafafa', fontWeight: 'bold' }}>
              <Descriptions.Item label="Appointment ID" span={2}><Text code>{selectedAppointment.appointment_id}</Text></Descriptions.Item>
              <Descriptions.Item label="ชื่อ-นามสกุล"><Text strong>{selectedAppointment.patient.name}</Text></Descriptions.Item>
              <Descriptions.Item label="Patient ID"><Tag icon={<IdcardOutlined />}>{selectedAppointment.patient.id}</Tag></Descriptions.Item>
              <Descriptions.Item label="Attending Staff">{selectedAppointment.staff.name}</Descriptions.Item>
              <Descriptions.Item label="Staff ID">{selectedAppointment.staff.id}</Descriptions.Item>
              <Descriptions.Item label="วันที่"><CalendarOutlined /> {dayjs(selectedAppointment.appointment_date).format("D MMMM YYYY")}</Descriptions.Item>
              <Descriptions.Item label="เวลา"><ClockCircleOutlined /> {selectedAppointment.appointment_time.substring(0, 5)} น.</Descriptions.Item>
              <Descriptions.Item label="ประเภทการรักษา" span={2}>{selectedAppointment.type}</Descriptions.Item>
              <Descriptions.Item label="สถานะ" span={2}>{selectedAppointment.status.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Medical Record ID">{selectedAppointment.medical_record_id ? <Text strong style={{ color: '#52c41a' }}>{selectedAppointment.medical_record_id}</Text> : <Text type="secondary">N/A</Text>}</Descriptions.Item>
              <Descriptions.Item label="Inspection ID">{selectedAppointment.inspection_record_id ? <Text strong style={{ color: '#1890ff' }}>{selectedAppointment.inspection_record_id}</Text> : <Text type="secondary">N/A</Text>}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}