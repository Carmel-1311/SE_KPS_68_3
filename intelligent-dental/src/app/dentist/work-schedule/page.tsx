'use client';

import React, { useEffect, useState, useMemo } from "react";
import { 
  Button, Card, Table, Typography, Breadcrumb, Tag, 
  Modal, Form, Select, TimePicker, message, Descriptions 
} from "antd";
import { useRouter } from "next/navigation";
import { 
  HomeOutlined, CalendarOutlined, PlusOutlined, 
  ClockCircleOutlined, UserOutlined, InfoCircleOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

// --- Interfaces ---
interface WorkScheduleType {
  id: number;
  staff_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  staff?: {
    first_name: string;
    last_name: string;
    roles?: { role_name: string; };
  };
}

const DAYS = [
  { key: 'Monday', label: 'จันทร์' },
  { key: 'Tuesday', label: 'อังคาร' },
  { key: 'Wednesday', label: 'พุธ' },
  { key: 'Thursday', label: 'พฤหัสบดี' },
  { key: 'Friday', label: 'ศุกร์' },
  { key: 'Saturday', label: 'เสาร์' },
  { key: 'Sunday', label: 'อาทิตย์' }
];

const START_HOUR = 8;
const END_HOUR = 20;

export default function SingleDentistSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [allData, setAllData] = useState<WorkScheduleType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkScheduleType | null>(null);

  const [currentUser] = useState({
    id: 5,
    first_name: "สมหญิง",
    last_name: "ใจดี",
    role: "ทันตแพทย์เฉพาะทาง"
  });

  const initialMockData: WorkScheduleType[] = [
  {
    id: 101,
    staff_id: 5,
    date: "Monday",
    start_time: "09:00:00",
    end_time: "12:00:00",
    is_active: true,
    staff: { first_name: "สมหญิง", last_name: "ใจดี", roles: { role_name: "ทันตแพทย์เฉพาะทาง" } }
  },
  {
    id: 102,
    staff_id: 5,
    date: "Wednesday",
    start_time: "13:00:00",
    end_time: "17:00:00",
    is_active: true,
    staff: { first_name: "สมหญิง", last_name: "ใจดี", roles: { role_name: "ทันตแพทย์เฉพาะทาง" } }
  },
  {
    id: 103,
    staff_id: 5,
    date: "Friday",
    start_time: "09:00:00",
    end_time: "11:00:00",
    is_active: false, // สถานะงดตรวจ
    staff: { first_name: "สมหญิง", last_name: "ใจดี", roles: { role_name: "ทันตแพทย์เฉพาะทาง" } }
  }
];

  useEffect(() => {
  const loadData = () => {
    setLoading(true);
    const storedData = localStorage.getItem('work_schedules');
    
    if (storedData) {
      // ถ้ามีข้อมูลในเครื่องแล้ว ให้ใช้ข้อมูลนั้น
      setAllData(JSON.parse(storedData));
    } else {
      // ถ้าเปิดครั้งแรกและยังไม่มีข้อมูล ให้ใช้ Mock Data และบันทึกลง LocalStorage ทันที
      setAllData(initialMockData);
      localStorage.setItem('work_schedules', JSON.stringify(initialMockData));
    }
    setLoading(false);
  };
  loadData();
}, []);

  const filteredData = useMemo(() => 
    allData.filter(item => item.staff_id === currentUser.id), 
    [allData, currentUser.id]
  );

  const handleAddSchedule = (values: any) => {
    const startTime = values.timeRange[0].format("HH:00:00");
    const endTime = values.timeRange[1].format("HH:00:00");

    const newEntry: WorkScheduleType = {
      id: Date.now(),
      staff_id: currentUser.id,
      date: values.date,
      start_time: startTime,
      end_time: endTime,
      is_active: values.status === 'active',
      staff: {
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        roles: { role_name: currentUser.role }
      }
    };

    const updatedData = [...allData, newEntry];
    setAllData(updatedData);
    localStorage.setItem('work_schedules', JSON.stringify(updatedData));
    message.success('เพิ่มตารางการทำงานเรียบร้อยแล้ว');
    setIsAddModalOpen(false);
    form.resetFields();
  };

  const tableData = useMemo(() => {
    const matrix: Record<string, any[]> = {};
    const totalSlots = END_HOUR - START_HOUR;

    DAYS.forEach(d => {
      matrix[d.key] = Array(totalSlots).fill(null).map(() => ({ type: 'empty', span: 1 }));
    });

    filteredData.forEach(sched => {
      const day = sched.date;
      const startH = parseInt(sched.start_time.split(':')[0], 10);
      const endH = parseInt(sched.end_time.split(':')[0], 10);
      const startIndex = startH - START_HOUR;
      const span = endH - startH;

      if (startIndex >= 0 && startIndex < totalSlots) {
        matrix[day][startIndex] = { type: 'start', schedule: sched, span };
        for (let i = 1; i < span; i++) {
          if (startIndex + i < totalSlots) matrix[day][startIndex + i] = { type: 'span', span: 0 };
        }
      }
    });

    return Array.from({ length: totalSlots }, (_, i) => {
      const currentHour = START_HOUR + i;
      const timeLabel = `${String(currentHour).padStart(2, '0')}:00 - ${String(currentHour + 1).padStart(2, '0')}:00`;
      const row: any = { key: timeLabel, time: timeLabel };
      DAYS.forEach(d => { row[d.key] = matrix[d.key][i]; });
      return row;
    });
  }, [filteredData]);

  const columns: any = [
    {
      title: "เวลา",
      dataIndex: "time",
      key: "time",
      width: 120,
      align: 'center',
      render: (text: string) => <Text strong style={{ color: '#595959' }}>{text}</Text>
    },
    ...DAYS.map(day => ({
      title: day.label,
      dataIndex: day.key,
      key: day.key,
      width: 160,
      onCell: () => ({ style: { padding: 0 } }), // กำหนดให้ช่องตารางไม่มี Padding เพื่อให้เนื้อหาเต็มช่อง
      render: (cellData: any) => {
        if (!cellData || cellData.type === 'empty') return { props: { rowSpan: 1 } };
        if (cellData.type === 'span') return { props: { rowSpan: 0 } };
        
        const sched = cellData.schedule;
        const isActive = sched.is_active;

        return {
          children: (
            <div 
              onClick={() => { setSelectedSchedule(sched); setIsDetailModalOpen(true); }}
              style={{ 
                backgroundColor: isActive ? '#e6f7ff' : '#fff2f0', 
                borderLeft: `5px solid ${isActive ? '#1890ff' : '#ffccc7'}`, 
                padding: '12px', 
                height: '100%', // ขยายความสูงเต็มช่อง
                width: '100%',  // ขยายความกว้างเต็มช่อง
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', // จัดเนื้อหาไว้ตรงกลางแนวตั้ง
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isActive ? '#bae7ff' : '#ffd8d3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive ? '#e6f7ff' : '#fff2f0'}
            >
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: isActive ? '#0050b3' : '#cf1322', marginBottom: '4px' }}>
                <ClockCircleOutlined /> {sched.start_time.substring(0, 5)} - {sched.end_time.substring(0, 5)}
              </div>
              <Tag color={isActive ? 'blue' : 'error'} style={{ width: 'fit-content', margin: 0 }}>
                {isActive ? 'ลงตรวจ' : 'งดตรวจ'}
              </Tag>
            </div>
          ),
          props: { rowSpan: cellData.span }
        };
      }
    }))
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
    

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '4px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการทำงาน</Title>
            <Text type="secondary"><UserOutlined /> ทพ. {currentUser.first_name} {currentUser.last_name} | {currentUser.role}</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
            เพิ่มตารางงาน
          </Button>
        </div>

        <Table 
          dataSource={tableData} 
          columns={columns} 
          pagination={false} 
          bordered 
          loading={loading}
          scroll={{ x: 1000 }} 
          // ปรับความสูงขั้นต่ำของแต่ละแถวในตารางเพื่อให้รายการดูใหญ่ขึ้น
          rowClassName={() => 'schedule-row'}
        />
      </Card>

      {/* สไตล์เพิ่มเติมเพื่อให้ตารางดูใหญ่ขึ้น */}
      <style jsx global>{`
        .ant-table-cell {
          height: 80px !important; /* ปรับความสูงของช่องตาราง */
          vertical-align: top !important;
        }
        .schedule-row:hover > td {
          background-color: inherit !important; /* ปิด hover effect ของ antd เพื่อไม่ให้รบกวนแถบงาน */
        }
      `}</style>

      {/* Modal เพิ่มตารางงาน */}
      <Modal
        title="เพิ่มตารางการทำงานใหม่"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => form.submit()}
        okText="บันทึกข้อมูล"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddSchedule} style={{ marginTop: 16 }}>
          <Form.Item label="แพทย์เจ้าของตาราง">
            <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px', border: '1px solid #d9d9d9' }}>
               ทพ. {currentUser.first_name} {currentUser.last_name}
            </div>
          </Form.Item>
          <Form.Item name="date" label="เลือกวันทำงาน" rules={[{ required: true, message: 'กรุณาเลือกวัน' }]}>
            <Select placeholder="เลือกวัน">{DAYS.map(d => <Select.Option key={d.key} value={d.key}>{d.label}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="timeRange" label="ช่วงเวลาทำงาน" rules={[{ required: true, message: 'กรุณาระบุเวลา' }]}>
            <TimePicker.RangePicker format="HH:00" showNow={false} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="สถานะการลงตรวจ" initialValue="active">
            <Select>
              <Select.Option value="active">ลงตรวจ (Active)</Select.Option>
              <Select.Option value="inactive">งดตรวจ (Inactive)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal ดูรายละเอียด */}
      <Modal
        title={<span><InfoCircleOutlined /> รายละเอียดงาน</span>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsDetailModalOpen(false)}>ปิด</Button>]}
      >
        {selectedSchedule && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="แพทย์">{`ทพ. ${currentUser.first_name} ${currentUser.last_name}`}</Descriptions.Item>
            <Descriptions.Item label="วันที่">{DAYS.find(d => d.key === selectedSchedule.date)?.label}</Descriptions.Item>
            <Descriptions.Item label="ช่วงเวลา">{`${selectedSchedule.start_time.substring(0, 5)} - ${selectedSchedule.end_time.substring(0, 5)} น.`}</Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              <Tag color={selectedSchedule.is_active ? 'blue' : 'error'}>{selectedSchedule.is_active ? 'ลงตรวจ' : 'งดตรวจ'}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}