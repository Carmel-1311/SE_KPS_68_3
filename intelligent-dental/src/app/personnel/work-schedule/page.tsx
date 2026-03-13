'use client';

import { Button, Card, Space, Table, Typography, Breadcrumb, Tag } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HomeOutlined, CalendarOutlined, PlusOutlined, ClockCircleOutlined, UserOutlined, IdcardOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface WorkScheduleType {
  id: number;
  staff_id: number;
  date: string; // 🌟 ตรวจสอบ GET: ใช้ date ตรงตาม API
  start_time: string;
  end_time: string;
  is_active: boolean;
  staff?: {
    first_name: string;
    last_name: string;
    roles?: {
      role_name: string;
    };
  };
}

const mockApi = {
  data: [
    { 
      id: 1, staff_id: 5, date: "Monday", start_time: "09:00:00", end_time: "10:00:00", is_active: true,
      staff: { first_name: "สมหญิง", last_name: "ใจดี", roles: { role_name: "ทันตแพทย์" } }
    },
    { 
      id: 2, staff_id: 5, date: "Tuesday", start_time: "10:00:00", end_time: "12:00:00", is_active: true,
      staff: { first_name: "สมหญิง", last_name: "ใจดี", roles: { role_name: "ทันตแพทย์" } }
    },
    { 
      id: 3, staff_id: 6, date: "Wednesday", start_time: "13:00:00", end_time: "14:00:00", is_active: false,
      staff: { first_name: "มานะ", last_name: "อดทน", roles: { role_name: "ทันตแพทย์เฉพาะทาง" } }
    },
  ] as WorkScheduleType[]
};

const TIME_SLOTS = [
  { start: 8, end: 9, label: "08:00 - 09:00" },
  { start: 9, end: 10, label: "09:00 - 10:00" },
  { start: 10, end: 11, label: "10:00 - 11:00" },
  { start: 11, end: 12, label: "11:00 - 12:00" },
  { start: 12, end: 13, label: "12:00 - 13:00" },
  { start: 13, end: 14, label: "13:00 - 14:00" },
  { start: 14, end: 15, label: "14:00 - 15:00" },
  { start: 15, end: 16, label: "15:00 - 16:00" },
  { start: 16, end: 17, label: "16:00 - 17:00" },
  { start: 17, end: 18, label: "17:00 - 18:00" },
  { start: 18, end: 19, label: "18:00 - 19:00" },
  { start: 19, end: 20, label: "19:00 - 20:00" },
];

const DAYS = [
  { key: 'Monday', label: 'จันทร์' },
  { key: 'Tuesday', label: 'อังคาร' },
  { key: 'Wednesday', label: 'พุธ' },
  { key: 'Thursday', label: 'พฤหัสบดี' },
  { key: 'Friday', label: 'ศุกร์' },
  { key: 'Saturday', label: 'เสาร์' },
  { key: 'Sunday', label: 'อาทิตย์' }
];

export default function DentistWorkSchedulePage() {
  const router = useRouter();
  const [data, setData] = useState<WorkScheduleType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        setTimeout(async () => {
          const storedData = localStorage.getItem('work_schedules');
          if (storedData) {
            setData(JSON.parse(storedData));
          } else {
            setData(mockApi.data);
            localStorage.setItem('work_schedules', JSON.stringify(mockApi.data));
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        setLoading(false);
      }
    };
    loadData();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const tableData = useMemo(() => {
    const matrix: Record<string, any[]> = {};
    DAYS.forEach(d => {
      matrix[d.key] = Array(TIME_SLOTS.length).fill(null).map(() => ({ type: 'empty', span: 1 }));
    });

    data.forEach(sched => {
      // 🌟 ตรวจสอบ GET: อ้างอิงด้วย sched.date โดยตรง
      const day = sched.date; 
      if (!day || !matrix[day]) return;

      const startHour = parseInt(sched.start_time.split(':')[0], 10);
      const endHour = parseInt(sched.end_time.split(':')[0], 10);

      const startIndex = TIME_SLOTS.findIndex(s => s.start === startHour);
      const endIndex = TIME_SLOTS.findIndex(s => s.end === endHour);

      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        const span = endIndex - startIndex + 1;
        
        matrix[day][startIndex] = { type: 'start', schedule: sched, span };
        
        for (let i = startIndex + 1; i <= endIndex; i++) {
          matrix[day][i] = { type: 'span', schedule: sched, span: 0 };
        }
      }
    });

    return TIME_SLOTS.map((slot, index) => {
      const row: any = { key: slot.label, time: slot.label };
      DAYS.forEach(d => {
        row[d.key] = matrix[d.key][index];
      });
      return row;
    });
  }, [data]);

  const getStatusStyles = (isActive: boolean) => {
    if (isActive) {
      return { bg: '#e6f7ff', border: '#1890ff', text: '#0050b3', label: 'ลงตรวจ', tagColor: 'blue' };
    } else {
      return { bg: '#fff2f0', border: '#ffccc7', text: '#cf1322', label: 'งดตรวจ', tagColor: 'error' };
    }
  };

  const columns: any = [
    {
      title: "เวลา",
      dataIndex: "time",
      key: "time",
      width: 110,
      align: 'center',
      render: (text: string) => <div style={{ fontWeight: '600', color: '#555' }}>{text}</div>
    },
    ...DAYS.map(day => ({
      title: day.label,
      dataIndex: day.key,
      key: day.key,
      width: 160,
      render: (cellData: any) => {
        if (!cellData || cellData.type === 'empty') return { children: null, props: { rowSpan: 1 } };
        if (cellData.type === 'span') return { children: null, props: { rowSpan: 0 } };
        
        const sched: WorkScheduleType = cellData.schedule;
        const styles = getStatusStyles(sched.is_active); 
        
        const doctorName = sched.staff ? `ทพ. ${sched.staff.first_name} ${sched.staff.last_name}` : `รหัสแพทย์: ${sched.staff_id}`;
        const doctorRole = sched.staff?.roles?.role_name || 'ทันตแพทย์';

        const content = (
          <div 
            onClick={() => router.push(`/personnel/work-schedule/${sched.id}`)} 
            style={{
              backgroundColor: styles.bg,
              borderLeft: `4px solid ${styles.border}`,
              color: styles.text,
              padding: '10px 12px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              height: '100%',
              minHeight: `${(cellData.span * 65) - 8}px`, 
              margin: '2px 0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative', 
              transition: 'all 0.2s ease-in-out', 
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
            }}
          >
            <div style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0.6 }}>
              <EditOutlined />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.85, paddingRight: '16px' }}>
              <ClockCircleOutlined /> 
              {sched.start_time.substring(0, 5)} - {sched.end_time.substring(0, 5)}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserOutlined />
              <Text ellipsis style={{ color: 'inherit', margin: 0 }}>{doctorName}</Text>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IdcardOutlined />
              <span>{doctorRole}</span>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Tag color={styles.tagColor} style={{ margin: 0, borderRadius: '4px' }}>
                {styles.label}
              </Tag>
            </div>
          </div>
        );

        return {
          children: content,
          props: { rowSpan: cellData.span } 
        };
      }
    }))
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      <Breadcrumb
        style={{ marginBottom: '24px', fontSize: '15px' }}
        items={[
          { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
          { title: <span><CalendarOutlined /> ตารางการทำงาน</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>ตารางการทำงาน</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => router.push('/personnel/work-schedule/create')}
            >
              เพิ่มวันเวลาการทำงาน
            </Button>
          </Space>
        </div>

        <Table
          rowKey="key"
          loading={loading}
          pagination={false}
          dataSource={tableData}
          columns={columns}
          bordered={true}
          style={{ width: '100%' }}
          scroll={{ x: 1000 }} 
        />
      </Card>
    </div>
  );
}