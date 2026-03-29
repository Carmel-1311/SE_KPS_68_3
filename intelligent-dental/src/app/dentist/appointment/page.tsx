"use client";

import React, { useState } from "react";
import { useAppointments } from "@/hook/useAppointments";
import { useEffect } from "react";
import { 
  Table, Typography, Tag, Input, Modal, Descriptions, 
  Tooltip, Button, Space, Card, message 
} from "antd";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { 
  SearchOutlined, ReadOutlined, IdcardOutlined,
  ClockCircleOutlined, CalendarOutlined, SolutionOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");
const { Title, Text } = Typography;

// --- Interface ---
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ใช้ custom hook ดึงข้อมูลจาก API
  const {
    filteredAppointments,
    appointments,
    loading,
    error,
    setSearch,
    refresh,
  } = useAppointments();

  useEffect(() => {
    console.debug("useAppointments -> appointments:", appointments?.length, appointments);
  }, [appointments, filteredAppointments, loading, error]);

  // เมื่อกลับมาหน้านี้ ถ้ามี record id ใหม่ใน query string ให้อัปเดต selectedAppointment
  useEffect(() => {
    if (!selectedAppointment) return;
    // รองรับทั้ง medical_record_id (เก่า) และ examination_id (ใหม่)
    const medId = searchParams.get("examination_id") || searchParams.get("medical_record_id");
    const inspId = searchParams.get("inspection_record_id");
    let changed = false;
    let updated = { ...selectedAppointment };
    if (medId && !selectedAppointment.medical_record_id) {
      updated.medical_record_id = Number(medId);
      changed = true;
    }
    if (inspId && !selectedAppointment.inspection_record_id) {
      updated.inspection_record_id = Number(inspId);
      changed = true;
    }
    if (changed) {
      setSelectedAppointment(updated);
      // ลบ query string ออก (optional)
      const url = new URL(window.location.href);
      url.searchParams.delete("examination_id");
      url.searchParams.delete("medical_record_id");
      url.searchParams.delete("inspection_record_id");
      window.history.replaceState({}, document.title, url.pathname);
      // refresh appointment list เพื่อ sync กับ backend
      refresh();
    }
  }, [searchParams, selectedAppointment]);

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
        const statusMap: Record<string, { color: string; text: string }> = {
          scheduled: { color: "blue", text: "Scheduled" },
          completed: { color: "green", text: "Completed" },
          cancelled: { color: "red", text: "Cancelled" },
          request_cancel: { color: "orange", text: "Req. Cancel" }
        };
        const current = statusMap[status] || { color: "default", text: status };
        return <Tag color={current.color} variant={"filled"}>{current.text.toUpperCase()}</Tag>;
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

  // หากผู้ใช้พิมพ์ชื่อ ใช้ local state เพื่ออัพเดต hook
  const onSearchChange = (val: string) => {
    setSearchText(val);
    setSearch(val);
  };

  const filteredData = filteredAppointments || appointments || [];

  return (
    <div style={{ padding: '0px' }}>
      <Card 
        variant={"outlined"} 
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px' }}
        styles={{ body: { padding: '24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📅 ตารางการนัดหมาย</Title>
            <Text type="secondary">ตรวจสอบและจัดการรายการนัดหมายทั้งหมดในระบบ</Text>
          </div>
          <Input 
            placeholder="ค้นหาชื่อคนไข้..." 
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />} 
            style={{ width: 350 }} 
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData}
          rowKey="appointment_id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: "ไม่พบข้อมูลนัดหมาย" }}
        />
      </Card>

      {/* --- Modal รายละเอียด --- */}
      <Modal 
        title={<Space><SolutionOutlined style={{ color: '#1890ff' }} /><span>รายละเอียดการนัดหมาย</span></Space>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={[<Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>ปิด</Button>]} 
        width={650}
      >
        {selectedAppointment && (
          <div style={{ marginTop: '16px' }}>
            <Descriptions bordered column={2} size="small" styles={{ label: { background: '#fafafa', fontWeight: 'bold' } }}>
              <Descriptions.Item label="Appointment ID" span={2}><Text code>{selectedAppointment.appointment_id}</Text></Descriptions.Item>
              <Descriptions.Item label="ชื่อ-นามสกุล"><Text strong>{selectedAppointment.patient.name}</Text></Descriptions.Item>
              <Descriptions.Item label="Patient ID"><Tag icon={<IdcardOutlined />}>{selectedAppointment.patient.id}</Tag></Descriptions.Item>
              <Descriptions.Item label="ทันตแพทย์ที่ดูแล">{selectedAppointment.staff.name}</Descriptions.Item>
              <Descriptions.Item label="Staff ID">{selectedAppointment.staff.id}</Descriptions.Item>
              <Descriptions.Item label="วันที่"><CalendarOutlined /> {dayjs(selectedAppointment.appointment_date).format("D MMMM YYYY")}</Descriptions.Item>
              <Descriptions.Item label="เวลา"><ClockCircleOutlined /> {selectedAppointment.appointment_time.substring(0, 5)} น.</Descriptions.Item>
              <Descriptions.Item label="ประเภทการรักษา" span={2}>{selectedAppointment.type}</Descriptions.Item>
              <Descriptions.Item label="สถานะ" span={2}>{selectedAppointment.status.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Medical Record ID">{selectedAppointment.medical_record_id ? <Text strong style={{ color: '#52c41a' }}>{selectedAppointment.medical_record_id}</Text> : <Text type="secondary">ไม่มีข้อมูล</Text>}</Descriptions.Item>
              <Descriptions.Item label="Inspection ID">{selectedAppointment.inspection_record_id ? <Text strong style={{ color: '#1890ff' }}>{selectedAppointment.inspection_record_id}</Text> : <Text type="secondary">ไม่มีข้อมูล</Text>}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              
              <Button
                type="primary"
                onClick={() => {
                  if (selectedAppointment.medical_record_id) {
                    router.push(`/dentist/patients/${selectedAppointment.patient.id}/medical/${selectedAppointment.medical_record_id}`);
                  } else {
                    // ส่ง appointment_id ไปหน้า new medical
                    router.push(`/dentist/patients/${selectedAppointment.patient.id}/medical/new?appointment_id=${selectedAppointment.appointment_id}`);
                  }
                }}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                {selectedAppointment.medical_record_id ? 'แก้ไขประวัติการรักษา' : 'เพิ่มประวัติการรักษา'}
              </Button>

              <Button
                type="primary"
                onClick={() => {
                  if (selectedAppointment.inspection_record_id) {
                    router.push(`/dentist/patients/${selectedAppointment.patient.id}/inspect/${selectedAppointment.inspection_record_id}`);
                  } else {
                    // ส่ง appointment_id ไปหน้า new inspection
                    router.push(`/dentist/patients/${selectedAppointment.patient.id}/inspect/new?appointment_id=${selectedAppointment.appointment_id}`);
                  }
                }}
                style={{ background: '#1890ff', borderColor: '#1890ff' }}
              >
                {selectedAppointment.inspection_record_id ? 'แก้ไขประวัติการตรวจ' : 'เพิ่มประวัติการตรวจ'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}