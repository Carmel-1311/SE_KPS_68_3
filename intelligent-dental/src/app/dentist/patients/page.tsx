"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDentist } from "@/hook/useDentist"; // เรียกใช้ Hook
import { withAuthHeaders } from "@/app/utils/auth.client";
import { 
  Table, Button, Modal, Input, Space, Row, Col, 
  Tag, Tooltip, Tabs, Timeline, Card, Typography, Spin 
} from "antd";
import { 
  ReadOutlined, SearchOutlined, MedicineBoxOutlined, 
  HistoryOutlined, UserOutlined, PlusOutlined, EditOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const statusColor = (s?: string) => {
  if (!s) return 'default'
  return s === 'completed' ? 'green' : s === 'cancelled' ? 'red' : s === 'scheduled' ? 'blue' : 'orange'
}

export default function PatientsPage() {
  const router = useRouter();
  const { patients, loading, getPatientDetail } = useDentist(); // ใช้ข้อมูลจาก Hook
  const [searchText, setSearchText] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [inspectionRecords, setInspectionRecords] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // ค้นหาเฉพาะ id, name, email ที่มีอยู่ใน table
  const filteredItems = patients.filter((item) => {
    return item.name?.toLowerCase().includes(searchText.toLowerCase()) || 
           item.id?.toString().includes(searchText);
  });

  // เมื่อกดปุ่ม Detail ให้ไป fetch ข้อมูลเต็มมาโชว์
  const showDetail = async (record: any) => {
    setIsDetailOpen(true);
    setModalLoading(true);
    try {
      const fullData = await getPatientDetail(record.id);
      console.log("Patient Full Data:", fullData);
      if (fullData) setSelectedPatient(fullData);

      setRecordsLoading(true);
      await Promise.all([
        fetchInspectionRecords(record.id),
        fetchMedicalRecords(record.id)
      ]);
    } catch (err) {
      console.error("Error loading patient detail:", err);
    } finally {
      setModalLoading(false);
      setRecordsLoading(false);
    }
  };

  const fetchInspectionRecords = async (patientId: number) => {
    try {
      const res = await fetch(`/api/patients/${patientId}/inspection_records?page=1&limit=50`, { headers: withAuthHeaders() });
      if (!res.ok) {
        setInspectionRecords([]);
        return;
      }
      const j = await res.json();
      // `okList` response uses { data, meta } or similar; handle both
      setInspectionRecords(j.data || j || []);
    } catch (err) {
      console.error("fetchInspectionRecords error", err);
      setInspectionRecords([]);
    }
  };

  const fetchMedicalRecords = async (patientId: number) => {
    try {
      const res = await fetch(`/api/patients/${patientId}/medical_records?page=1&limit=50`, { headers: withAuthHeaders() });
      if (!res.ok) {
        setMedicalRecords([]);
        return;
      }
      const j = await res.json();
      setMedicalRecords(j.data || j || []);
    } catch (err) {
      console.error("fetchMedicalRecords error", err);
      setMedicalRecords([]);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "ชื่อ-นามสกุล", dataIndex: "name", key: "name", render: (text: string) => <b>{text}</b> },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    {
      title: "จัดการ",
      key: "action",
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Tooltip title="รายละเอียด">
          <Button 
            type="text" 
            icon={<ReadOutlined style={{ fontSize: '20px', color: '#1890ff' }} />} 
            onClick={() => showDetail(record)} 
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <Card variant={"outlined"} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📋 ระบบจัดการข้อมูลผู้ป่วย</Title>
            <Text type="secondary">ข้อมูลอัปเดตจากระบบฐานข้อมูล</Text>
          </div>
          <Space size="middle">
            <Input 
              placeholder="ค้นหาชื่อ หรือ ID..." 
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />} 
              style={{ width: 350 }} 
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredItems} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }} 
        />
      </Card>

      <Modal 
        open={isDetailOpen} 
        title={`แฟ้มประวัติ: ${selectedPatient?.name || 'กำลังโหลด...'}`} 
        onCancel={() => setIsDetailOpen(false)} 
        width={850} 
        footer={[<Button key="close" onClick={() => setIsDetailOpen(false)}>ปิดหน้าต่าง</Button>]}
      >
        <Spin spinning={modalLoading}>
          <Tabs items={[
            {
              key: '1', label: <span><UserOutlined /> ข้อมูลทั่วไป</span>,
              children: (
                <div style={{ padding: '16px 0' }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}><strong>ชื่อ-นามสกุล:</strong> {selectedPatient?.name}</Col>
                    <Col span={12}><strong>เลขบัตรประชาชน:</strong> {selectedPatient?.citizen_id || "-"}</Col>
                    <Col span={12}><strong>เบอร์โทรศัพท์:</strong> {selectedPatient?.phone || "-"}</Col>
                    <Col span={12}><strong>อีเมล:</strong> {selectedPatient?.email}</Col>
                    <Col span={12}><strong>วันเกิด:</strong> {selectedPatient?.birthday || "-"}</Col>
                    <Col span={12}>
                        <strong>สถานะ:</strong> 
                        <Tag color={selectedPatient?.status === 'active' ? 'green' : 'default'}>
                            {selectedPatient?.status === 'active' ? 'ปกติ' : 'ปิดการใช้งาน'}
                        </Tag>
                    </Col>
                    <Col span={24}><strong>ประวัติการแพ้ยา:</strong> <Tag color="red">{selectedPatient?.allergy || "ไม่มีข้อมูล"}</Tag></Col>
                  </Row>
                </div>
              )
            },
            {
              key: '2', label: <span><HistoryOutlined /> ประวัติการตรวจ</span>,
              children: (
                <div style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Title level={5} style={{ margin: 0 }}>บันทึกการตรวจ</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push(`/dentist/patients/${selectedPatient?.id}/inspect/new`)}>เพิ่มบันทึก</Button>
                  </div>
                  <Timeline items={inspectionRecords.map((r: any) => ({
                    content: (
                      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Tag color="blue">{r.date}</Tag>
                            <Tag color={statusColor(r.status)}>{(r.status || '').toString().toUpperCase()}</Tag>
                          </div>
                          <p style={{ margin: '8px 0' }}>{r.history}</p>
                          <div><small>Inspection ID: <code>{r.id}</code></small></div>
                        </div>
                        <Button type="link" icon={<EditOutlined />} onClick={() => router.push(`/dentist/patients/${selectedPatient?.id}/inspect/${r.id}`)}>แก้ไข</Button>
                      </div>
                    )
                  }))} />
                </div>
              )
            },
            {
                key: '3', label: <span><MedicineBoxOutlined /> ประวัติการรักษา</span>,
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <Title level={5} style={{ margin: 0 }}>บันทึกการรักษา</Title>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push(`/dentist/patients/${selectedPatient?.id}/medical/new`)}>เพิ่มบันทึก</Button>
                    </div>
                    <Timeline items={medicalRecords.map((r: any) => ({
                      content: (
                        <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <Tag color="green">{r.date}</Tag>
                              <Tag color={statusColor(r.status)}>{(r.status || '').toString().toUpperCase()}</Tag>
                            </div>
                            <p style={{ margin: '8px 0' }}>{r.history}</p>
                            <div><small>Medical ID: <code>{r.id}</code></small></div>
                          </div>
                          <Button type="link" icon={<EditOutlined />} onClick={() => router.push(`/dentist/patients/${selectedPatient?.id}/medical/${r.id}`)}>แก้ไข</Button>
                        </div>
                      )
                    }))} />
                  </div>
                )
            }
          ]} />
        </Spin>
      </Modal>
    </div>
  );
}