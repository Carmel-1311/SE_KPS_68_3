"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Table, Button, Modal, Input, Space, Row, Col, 
  Select, Tag, Tooltip, Tabs, Timeline, Card, Typography 
} from "antd";
import { 
  ReadOutlined, SearchOutlined, MedicineBoxOutlined, 
  HistoryOutlined, UserOutlined, PlusOutlined, EditOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const MOCK_PATIENTS = [
  { 
    id: 1, name: "สมชาย ใจดี", email: "somchai.j@email.com", first_name: "สมชาย", last_name: "ใจดี", phone: "081-234-5678", 
    birthday: "1990-05-15", citizen_id: "1-1001-01234-56-1", status: "active", patient_type: "general", allergy: "แพ้ยาเพนิซิลลิน",
    inspection_records: [
      { id: 101, date: "2024-03-01", history: "ตรวจสุขภาพประจำปี ความดันปกติ", status: "completed" }
    ],
    medical_records: [
      { id: 201, date: "2024-03-01", history: "มีอาการไอเล็กน้อย", status: "completed", patient_id: 1, inspection_record_id: 101, detail: [{ type_id: 1, diagnosis: "Common Cold" }] }
    ]
  },
  { 
    id: 2, name: "สมหญิง รักเรียน", email: "somying.r@email.com", first_name: "สมหญิง", last_name: "รักเรียน", phone: "082-345-6789", 
    birthday: "1985-11-20", citizen_id: "3-2104-55678-90-2", status: "active", patient_type: "onsite", allergy: null,
    inspection_records: [
      { id: 102, date: "2024-02-15", history: "คัดกรองนอกสถานที่ น้ำตาลในเลือดสูง", status: "cancelled", patient_id: 2 }
    ],
    medical_records: []
  },
  { id: 3, name: "มานะ อดทน", email: "mana.o@email.com", first_name: "มานะ", last_name: "อดทน", phone: "089-876-5432", birthday: "1995-02-10", citizen_id: "1-5509-99876-11-3", status: "inactive", patient_type: "general", allergy: "แพ้อาหารทะเล", inspection_records: [], medical_records: [] },
  { id: 4, name: "ชูใจ ใฝ่ดี", email: "choojai.f@email.com", first_name: "ชูใจ", last_name: "ใฝ่ดี", phone: "085-555-4444", birthday: "2000-08-25", citizen_id: "1-1234-56789-00-4", status: "active", patient_type: "onsite", allergy: null, inspection_records: [], medical_records: [] },
];

export default function PatientsPage() {
  const router = useRouter();
  const [items] = useState(MOCK_PATIENTS);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) || item.citizen_id.includes(searchText);
    const matchesType = typeFilter === "all" || item.patient_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const showDetail = (record: any) => {
    setSelectedPatient(record);
    setIsDetailOpen(true);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "ชื่อ-นามสกุล", dataIndex: "name", key: "name", render: (text: string) => <b>{text}</b> },
    { 
      title: "ประเภทผู้ป่วย", 
      dataIndex: "patient_type", 
      render: (type: string) => type === "onsite" ? <Tag color="blue">ตรวจนอกสถานที่</Tag> : <Tag color="default">ผู้ป่วยธรรมดา</Tag>
    },
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
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📋 ระบบจัดการข้อมูลผู้ป่วย</Title>
            <Text type="secondary">จัดการข้อมูลส่วนตัวและประวัติการรักษาของคนไข้</Text>
          </div>
          <Space size="middle">
            <Select 
              defaultValue="all" 
              style={{ width: 160 }} 
              onChange={setTypeFilter} 
              options={[
                { value: 'all', label: 'ทั้งหมด' }, 
                { value: 'general', label: 'ผู้ป่วยธรรมดา' }, 
                { value: 'onsite', label: 'นอกสถานที่' }
              ]} 
            />
            <Input 
              placeholder="ค้นหาชื่อ หรือเลขบัตร..." 
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />} 
              style={{ width: 300 }} 
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Space>
        </div>

        <Table columns={columns} dataSource={filteredItems} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal 
        open={isDetailOpen} 
        title={`แฟ้มประวัติ: ${selectedPatient?.name}`} 
        onCancel={() => setIsDetailOpen(false)} 
        width={850} 
        footer={[<Button key="close" onClick={() => setIsDetailOpen(false)}>ปิดหน้าต่าง</Button>]}
      >
        <Tabs items={[
          {
            key: '1', label: <span><UserOutlined /> ข้อมูลทั่วไป</span>,
            children: (
              <div style={{ padding: '16px 0' }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}><strong>ชื่อ-นามสกุล:</strong> {selectedPatient?.name}</Col>
                  <Col span={12}><strong>เลขบัตรประชาชน:</strong> {selectedPatient?.citizen_id}</Col>
                  <Col span={12}><strong>เบอร์โทรศัพท์:</strong> {selectedPatient?.phone}</Col>
                  <Col span={12}><strong>อีเมล:</strong> {selectedPatient?.email}</Col>
                  <Col span={12}><strong>วันเกิด:</strong> {selectedPatient?.birthday}</Col>
                  <Col span={12}><strong>ประเภท:</strong> {selectedPatient?.patient_type === 'onsite' ? 'ตรวจนอกสถานที่' : 'ผู้ป่วยธรรมดา'}</Col>
                  <Col span={24}><strong>ประวัติการแพ้ยา:</strong> <Tag color="red">{selectedPatient?.allergy || "ไม่มีข้อมูล"}</Tag></Col>
                </Row>
              </div>
            )
          },
          {
            key: '2', label: <span><HistoryOutlined /> ประวัติการตรวจ</span>,
            children: (
              <div style={{ padding: '16px 0' }}>
                {/* ส่วนหัวของ Tab ที่มีหัวข้อและปุ่มอยู่คนละฝั่ง */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Title level={5} style={{ margin: 0 }}>บันทึกการตรวจทั้งหมด</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => router.push(`/dentist/patients/${selectedPatient.id}/inspect/new`)} 
                  >
                    เพิ่มบันทึกการตรวจ
                  </Button>
                </div>
                
                <Timeline items={selectedPatient?.inspection_records?.map((r: any) => ({
                  children: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span><Tag color="blue">{r.date}</Tag> <Tag>{r.status}</Tag> {r.history}</span>
                      <Button 
                        type="link" 
                        icon={<ReadOutlined style={{ fontSize: '18px' }} />} 
                        onClick={() => router.push(`/dentist/patients/${selectedPatient.id}/inspect/${r.id}`)} 
                      >
                        
                      </Button>
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
                {/* ส่วนหัวของ Tab ที่มีหัวข้อและปุ่มอยู่คนละฝั่ง */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Title level={5} style={{ margin: 0 }}>บันทึกการรักษาทั้งหมด</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => router.push(`/dentist/patients/${selectedPatient.id}/medical/new`)} 
                  >
                    เพิ่มบันทึกการรักษา
                  </Button>
                </div>

                <Timeline items={selectedPatient?.medical_records?.map((r: any) => ({
                  children: (
                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Tag color="green">{r.date}</Tag> <Tag color="orange">{r.status}</Tag>
                        <p style={{ margin: '8px 0' }}>{r.history}</p>
                        {r.detail?.map((d: any, i: number) => <Tag key={i} color="orange">{d.diagnosis}</Tag>)}
                      </div>
                      <Button 
                        type="link" 
                        icon={<ReadOutlined style={{ fontSize: '18px' }} />} 
                        onClick={() => router.push(`/dentist/patients/${selectedPatient.id}/medical/${r.id}`)} 
                      >
                        
                      </Button>
                    </div>
                  )
                }))} />
              </div>
            )
          }
        ]} />
      </Modal>
    </div>
  );
}