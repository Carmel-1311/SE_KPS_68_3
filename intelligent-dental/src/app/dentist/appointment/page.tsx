"use client";

import React, { useState, useEffect } from "react";
import { useAppointments } from "@/hook/useAppointments2";
import { useMedicalRecord } from "@/hook/useMedicalRecord"; 
import { useInspectionRecord } from "@/hook/useInspectionRecord"; 

import {
  Table,
  Typography,
  Tag,
  Input,
  Modal,
  Descriptions,
  Tooltip,
  Button,
  Space,
  Card,
  Breadcrumb,
  Tabs,
} from "antd";

import { useRouter, useSearchParams } from "next/navigation";
import {
  SearchOutlined,
  ReadOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const { Title, Text } = Typography;

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
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [inspectionRecord, setInspectionRecord] = useState<any>(null);

  const {
    filteredAppointments,
    appointments,
    loading,
    setSearch,
    refresh,
  } = useAppointments();

  // ✅ hook จริง
  const { getMedicalById } = useMedicalRecord();
  const { getInspectionById } = useInspectionRecord();

  // 🔹 sync query params
  useEffect(() => {
    if (!selectedAppointment) return;

    const medId =
      searchParams.get("examination_id") ||
      searchParams.get("medical_record_id");
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

      const url = new URL(window.location.href);
      url.searchParams.delete("examination_id");
      url.searchParams.delete("medical_record_id");
      url.searchParams.delete("inspection_record_id");
      window.history.replaceState({}, document.title, url.pathname);

      refresh();
    }
  }, [searchParams, selectedAppointment, refresh]);

  // 🔥 fetch data จาก hook จริง
  useEffect(() => {
    if (!selectedAppointment) return;

    setMedicalRecord(null);
    setInspectionRecord(null);

    const loadData = async () => {
      if (selectedAppointment.medical_record_id) {
        const med = await getMedicalById(
          selectedAppointment.medical_record_id
        );
        setMedicalRecord(med);
      }

      if (selectedAppointment.inspection_record_id) {
        const insp = await getInspectionById(
          selectedAppointment.inspection_record_id
        );
        setInspectionRecord(insp);
      }
    };

    loadData();
  }, [selectedAppointment]);

  // 🔹 search
  const onSearchChange = (val: string) => {
    setSearchText(val);
    setSearch(val);
  };

  const filteredData = filteredAppointments || appointments || [];

  // 🔹 table columns
  const columns = [
    { title: "ID", dataIndex: "appointment_id", width: 70 },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: ["patient", "name"],
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "วันที่",
      dataIndex: "appointment_date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "เวลา",
      dataIndex: "appointment_time",
      render: (time: string) => time.substring(0, 5),
    },
    { title: "ประเภท", dataIndex: "type" },
    {
      title: "สถานะ",
      dataIndex: "status",
      render: (status: string) => {
        const map: any = {
          scheduled: { color: "blue", text: "Scheduled" },
          completed: { color: "green", text: "Completed" },
          cancelled: { color: "red", text: "Cancelled" },
          request_cancel: { color: "orange", text: "Req. Cancel" },
        };
        const s = map[status] || { color: "default", text: status };
        return <Tag color={s.color}>{s.text.toUpperCase()}</Tag>;
      },
    },
    {
      title: "จัดการ",
      align: "center" as const,
      render: (_: any, record: Appointment) => (
        <Tooltip title="รายละเอียด">
          <Button
            type="text"
            icon={<ReadOutlined />}
            onClick={() => {
              setSelectedAppointment(record);
              setIsModalOpen(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  // 🔥 medical tab
  const renderMedical = () => {
    const hasData = !!selectedAppointment?.medical_record_id;

    return (
      <>
        <Button
          type="primary"
          style={{ marginBottom: 16, background: hasData ? undefined : "#52c41a" }}
          onClick={() =>
            router.push(
              hasData
                ? `/dentist/appointment/${selectedAppointment?.appointment_id}/medical/${selectedAppointment?.medical_record_id}`
                : `/dentist/appointment/${selectedAppointment?.appointment_id}/medical/new?appointment_id=${selectedAppointment?.appointment_id}`
            )
          }
        >
          {hasData ? "✏️ แก้ไขประวัติการรักษา" : "➕ เพิ่มประวัติการรักษา"}
        </Button>

        {!hasData && <Text type="secondary">ยังไม่มีข้อมูล</Text>}

        {hasData && !medicalRecord && (
          <Text type="secondary">กำลังโหลด...</Text>
        )}

        {hasData && medicalRecord && (
          <>
            <Descriptions bordered size="small">
              <Descriptions.Item label="ID">
                {medicalRecord.id}
              </Descriptions.Item>
              <Descriptions.Item label="วันที่">
                {dayjs(medicalRecord.date).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ">
                {medicalRecord.status}
              </Descriptions.Item>
              <Descriptions.Item label="History" span={2}>
                {medicalRecord.history}
              </Descriptions.Item>
            </Descriptions>

            <Table
              style={{ marginTop: 16 }}
              dataSource={medicalRecord.detail}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: "ประเภทการตรวจ",
                  dataIndex: ["examination_type", "name"],
                },
                {
                  title: "Diagnosis",
                  dataIndex: "diagnosis",
                },
              ]}
            />
          </>
        )}
      </>
    );
  };

  // 🔥 inspection tab
  const renderInspection = () => {
    const hasData = !!selectedAppointment?.inspection_record_id;

    return (
      <>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={() =>
            router.push(
              hasData
                ? `/dentist/appointment/${selectedAppointment?.appointment_id}/inspect/${selectedAppointment?.inspection_record_id}`
                : `/dentist/appointment/${selectedAppointment?.appointment_id}/inspect/new?appointment_id=${selectedAppointment?.appointment_id}`
            )
          }
        >
          {hasData ? "✏️ แก้ไขประวัติการตรวจ" : "➕ เพิ่มประวัติการตรวจ"}
        </Button>

        {!hasData && <Text type="secondary">ยังไม่มีข้อมูล</Text>}

        {hasData && !inspectionRecord && (
          <Text type="secondary">กำลังโหลด...</Text>
        )}

        {hasData && inspectionRecord && (
          <Descriptions bordered size="small">
            <Descriptions.Item label="ID">
              {inspectionRecord.id}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่">
              {dayjs(inspectionRecord.date).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">
              {inspectionRecord.status}
            </Descriptions.Item>
            <Descriptions.Item label="History" span={2}>
              {inspectionRecord.history}
            </Descriptions.Item>
          </Descriptions>
        )}
      </>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        items={[
          {
            title: (
              <a onClick={() => router.push("/dentist/work-schedule")}>
                <HomeOutlined /> หน้าหลัก
              </a>
            ),
          },
          {
            title: (
              <span>
                <CalendarOutlined /> ตารางการทำงาน
              </span>
            ),
          },
        ]}
      />

      <Card style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={3}>📅 ตารางการนัดหมาย</Title>

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
          dataSource={filteredData}
          rowKey="appointment_id"
          loading={loading}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      <Modal
        title="รายละเอียดการนัดหมาย"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedAppointment && (
          <Tabs
            items={[
              {
                key: "1",
                label: "ข้อมูลการนัดหมาย",
                children: (
                  <Descriptions bordered>
                    <Descriptions.Item label="ชื่อ">
                      {selectedAppointment.patient.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="หมอ">
                      {selectedAppointment.staff.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="วันที่">
                      {dayjs(
                        selectedAppointment.appointment_date
                      ).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="เวลา">
                      {selectedAppointment.appointment_time.substring(0, 5)}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "2",
                label: "ประวัติการรักษา",
                children: renderMedical(),
              },
              {
                key: "3",
                label: "ประวัติการตรวจ",
                children: renderInspection(),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}