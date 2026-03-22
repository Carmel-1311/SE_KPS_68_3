"use client";

import React, { useState, useEffect } from "react";
import { 
  Table, Tag, Card, Typography, Button, Input, DatePicker, 
  Space, Tooltip, message, Breadcrumb, Popconfirm, Tabs, Badge, Spin
} from "antd";
import { 
  SearchOutlined, ReadOutlined, 
  HomeOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs"; // แนะนำให้ใช้ dayjs จัดการ format วันที่ (ถ้ายังไม่ได้ลง ใช้ npm install dayjs)

const { Title, Text } = Typography;

// 🌟 1. แก้ไข Interface ให้ตรงกับ Swagger API เป๊ะๆ
export interface CompanyData {
  id: number;
  name: string;
  taxId?: string;
  address?: string;
  phone: string;
  email?: string;
}

export interface MobileDental {
  id: number;
  userId?: number;
  companyId?: number;
  mobileDate: string; // วันที่ออกหน่วย
  address: string;    // สถานที่ (location เดิม)
  patientCount?: number;
  status: string; 
  createdAt: string;  // วันที่ยื่นคำขอ (requestDate เดิม)
  updatedAt?: string;
  Company: CompanyData; // ข้อมูลบริษัท/หน่วยงานที่ซ้อนอยู่ข้างใน
}

export default function MissionPage() {
  const router = useRouter(); 
  const [isMounted, setIsMounted] = useState(false); 
  const [data, setData] = useState<MobileDental[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("1"); 

  useEffect(() => {
    setIsMounted(true); 
    fetchMissions();
  }, []);

  // 🌟 2. เพิ่มการยิง API จริงๆ กลับเข้าไป (และมี Mock ไว้เผื่อ API ล่ม)
  const fetchMissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || ""; 
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/mobile-dentals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        const apiData = responseData?.data || responseData; // ดึง array ออกมา
        setData(apiData);
        setLoading(false);
        return; // ถ้า API สำเร็จ ให้ออกเลย ไม่ต้องไปทำ Mock Data
      }
    } catch (error) {
      console.error("API Error: ", error);
    }

    // --- Fallback โหมด Mock Data เมื่อ API ใช้ไม่ได้ ---
    message.warning("กำลังแสดงข้อมูลจำลอง (ไม่สามารถเชื่อมต่อ API ได้)");
    setTimeout(() => {
      const mockData: MobileDental[] = [
        {
          id: 1, address: "หอประชุมขอนแก่น", mobileDate: "2026-02-10", status: "1", createdAt: "2026-01-20T10:00:00Z",
          Company: { id: 101, name: "โรงเรียนอนุบาลขอนแก่น", phone: "0811111111" }
        },
        {
          id: 2, address: "ศาลาเชียงใหม่", mobileDate: "2026-02-15", status: "2", createdAt: "2026-02-01T10:00:00Z",
          Company: { id: 102, name: "ชุมชน A", phone: "0891112222" }
        },
        {
          id: 3, address: "ลานวัดอยุธยา", mobileDate: "2026-02-20", status: "5", createdAt: "2026-02-05T10:00:00Z",
          Company: { id: 103, name: "เทศบาลตำบลเมืองเก่า", phone: "0833333333" }
        },
        {
          id: 4, address: "โรงอาหารอุดรธานี", mobileDate: "2026-02-25", status: "3", createdAt: "2026-02-10T10:00:00Z",
          Company: { id: 104, name: "โรงเรียนบ้านหนองบัว", phone: "0844444444" }
        }
      ];
      setData(mockData);
      setLoading(false);
    }, 500);
  };

  const handleUpdateStatus = (id: number, newStatus: string) => {
    const updatedData = data.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setData(updatedData);
    
    if (newStatus === "2") message.success("อนุมัติการออกหน่วยเรียบร้อยแล้ว");
    else if (newStatus === "3") message.warning("ไม่อนุมัติการออกหน่วยเรียบร้อยแล้ว");
  };

  const handleConfirmCancel = (id: number) => {
    const updatedData = data.map(item => item.id === id ? { ...item, status: "4" } : item);
    setData(updatedData);
    message.success("ยืนยันการยกเลิกเรียบร้อยแล้ว ข้อมูลถูกซ่อนจากตาราง");
  };

  const requestCancelCount = (data || []).filter(item => item && String(item.status) === "5").length;

  // 🌟 3. ปรับ Logic การกรองข้อมูลตามฟิลด์ใหม่
  const finalFilteredData = (data || []).filter((item) => {
    if (!item) return false;
    const itemStatus = String(item.status);
    if (itemStatus === "4") return false; 

    let matchTab = false;
    if (activeTab === "1" && itemStatus === "1") matchTab = true; 
    else if (activeTab === "2" && itemStatus === "2") matchTab = true; 
    else if (activeTab === "3" && itemStatus === "3") matchTab = true; 
    else if (activeTab === "4" && itemStatus === "5") matchTab = true; 

    // ดึงชื่อและสถานที่มา Filter ตามโครงสร้างใหม่
    const safeName = item.Company?.name || "";
    const safeLocation = item.address || "";
    const safeSearch = searchText || "";

    const matchSearch = safeName.toLowerCase().includes(safeSearch.toLowerCase()) || 
                        safeLocation.toLowerCase().includes(safeSearch.toLowerCase());
                        
    // เช็ควันที่จาก mobileDate
    const matchDate = selectedDate ? item.mobileDate?.includes(selectedDate) : true;

    return matchTab && matchSearch && matchDate;
  });

  // 🌟 4. แก้ไขคอลัมน์ตารางให้ดึงข้อมูลจากโครงสร้างใหม่
  const columns: ColumnsType<MobileDental> = [
    { 
      title: "ลำดับ", key: "index", width: 60, align: "center",
      render: (text, record, index) => <Text strong>{index + 1}</Text> 
    },
    { 
      title: "วันที่ออกหน่วย", key: "mobileDate", width: 120,
      render: (_, record) => {
        const date = record.mobileDate ? dayjs(record.mobileDate).format('YYYY-MM-DD') : "-";
        return <Text strong>{date}</Text>;
      }
    },
    { 
      title: "ชื่อหน่วยงาน/ชุมชน", key: "name",
      render: (_, record) => <Text strong>{record.Company?.name || "-"}</Text> // ดึงจาก Company
    },
    { 
      title: "สถานที่", key: "address", 
      render: (_, record) => <Text>{record.address || "-"}</Text> 
    },
    { 
      title: "เบอร์ติดต่อ", key: "phone", 
      render: (_, record) => <Text>{record.Company?.phone || "-"}</Text> // ดึงจาก Company
    },
    { 
      title: "วันที่ยื่นคำขอ", key: "createdAt",
      render: (_, record) => {
         const date = record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD') : "-";
         return <Text type="secondary">{date}</Text>;
      }
    },
    {
      title: "สถานะ", key: "status", width: 140,
      render: (_, record) => {
        const status = String(record.status);
        let color = "blue"; let text = "รออนุมัติ";
        if (status === "1") { color = "blue"; text = "รออนุมัติ"; }
        else if (status === "2") { color = "green"; text = "อนุมัติแล้ว"; }
        else if (status === "3") { color = "red"; text = "ไม่อนุมัติ"; }
        else if (status === "4") { color = "default"; text = "ยกเลิกแล้ว"; }
        else if (status === "5") { color = "orange"; text = "คำขอยกเลิก"; }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "จัดการ", key: "action", align: "center", width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="รายละเอียด" placement="top">
            <Link href={`/personnel/mission/${record.id}`}>
              <Button type="text" icon={<ReadOutlined style={{ fontSize: "20px", color: "#1890ff" }} />} style={{ padding: 0 }} />
            </Link>
          </Tooltip>

          {String(record.status) === "1" && (
            <>
              <Tooltip title="อนุมัติ" placement="top">
                <Popconfirm title="ยืนยันการอนุมัติ" description={`ต้องการอนุมัติการออกหน่วยใช่หรือไม่?`} onConfirm={() => handleUpdateStatus(record.id, "2")} okText="ยืนยัน" cancelText="ปิด">
                  <Button type="text" icon={<CheckCircleOutlined style={{ fontSize: "20px", color: "#52c41a" }} />} style={{ padding: 0 }} />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="ไม่อนุมัติ" placement="top">
                <Popconfirm title="ยืนยันการปฏิเสธ" description={`ต้องการไม่อนุมัติการออกหน่วยใช่หรือไม่?`} onConfirm={() => handleUpdateStatus(record.id, "3")} okText="ยืนยัน" cancelText="ปิด" okButtonProps={{ danger: true }}>
                  <Button type="text" icon={<CloseCircleOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />} style={{ padding: 0 }} />
                </Popconfirm>
              </Tooltip>
            </>
          )}

          {String(record.status) === "5" && (
            <Popconfirm title="ยืนยันการยกเลิก" description={`ต้องการอนุมัติการยกเลิกออกหน่วยใช่หรือไม่?`} onConfirm={() => handleConfirmCancel(record.id)} okText="ยืนยัน" cancelText="ปิด" okButtonProps={{ danger: true }}>
              <Button type="primary" danger size="small" style={{ borderRadius: "4px" }}>ยืนยันยกเลิก</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "1", label: "รออนุมัติ" },
    { key: "2", label: "อนุมัติแล้ว" },
    { key: "3", label: "ไม่อนุมัติ" },
    { 
      key: "4", 
      label: (
        <span>
          คำขอยกเลิกการออกหน่วย{" "}
          <Badge count={requestCancelCount} style={{ backgroundColor: "#ff4d4f", marginLeft: 4 }} offset={[0, -2]} />
        </span>
      ) 
    },
  ];

  if (!isMounted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="กำลังโหลดหน้าจอ..." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "24px", gap: "10px" }}>
      <Breadcrumb
        style={{ marginBottom: "14px", fontSize: "15px" }}
        items={[
          { title: <a onClick={() => router.push("/")}><HomeOutlined /> หน้าหลัก</a> },
          { title: <span><EnvironmentOutlined /> ตารางการออกหน่วย</span> },
        ]}
      />

      <Card variant="borderless" style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>ตารางการออกหน่วย</Title>
            <Text type="secondary">จัดการและตรวจสอบคิวการออกหน่วยทันตกรรมเคลื่อนที่</Text>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: "16px" }} />

        <div style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Input 
            placeholder="ค้นหาชื่อหน่วยงาน หรือ สถานที่..." 
            prefix={<SearchOutlined />} 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)} 
            style={{ width: 280, borderRadius: "8px" }} 
            allowClear 
          />
          <DatePicker 
            placeholder="เลือกวันที่ออกหน่วย" 
            style={{ borderRadius: "8px", width: 160 }} 
            onChange={(_, dateString) => setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString)} 
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={finalFilteredData} 
          rowKey="id" 
          pagination={{ pageSize: 10 }} 
          loading={loading} 
          locale={{ emptyText: "ไม่พบข้อมูลในสถานะนี้" }}
        />
      </Card>
    </div>
  );
}