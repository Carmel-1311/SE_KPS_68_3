"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  DatePicker,
  Select,
  Row,
  Col,
} from "antd";

import { useRouter } from "next/navigation";
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
const { RangePicker } = DatePicker;

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

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [inspectionRecord, setInspectionRecord] = useState<any>(null);

  const { appointments, loading } = useAppointments();
  const { getMedicalById } = useMedicalRecord();
  const { getInspectionById } = useInspectionRecord();

  // =========================
  // FILTER
  // =========================
  const filteredData = useMemo(() => {
    let data = appointments || [];

    // ❌ ตัด cancel
    data = data.filter(
      (a) => a.status !== "cancelled" && a.status !== "request_cancel"
    );

    if (searchText) {
      data = data.filter(
        (a) =>
          a.patient.name.toLowerCase().includes(searchText.toLowerCase()) ||
          a.appointment_id.toString().includes(searchText)
      );
    }

    if (dateRange) {
      const [start, end] = dateRange;
      data = data.filter((a) => {
        const d = dayjs(a.appointment_date);
        return d.isAfter(start.startOf("day")) && d.isBefore(end.endOf("day"));
      });
    }

    if (statusFilter) {
      data = data.filter((a) => a.status === statusFilter);
    }

    if (activeTab === "today") {
      data = data.filter((a) =>
        dayjs(a.appointment_date).isSame(dayjs(), "day")
      );
    }

    if (activeTab === "scheduled") {
      data = data.filter((a) => a.status === "scheduled");
    }

    if (activeTab === "completed") {
      data = data.filter((a) => a.status === "completed");
    }

    return data;
  }, [appointments, searchText, statusFilter, dateRange, activeTab]);

  // =========================
  // LOAD DATA 
  // =========================
  useEffect(() => {
    if (!selectedAppointment) return;

    setMedicalRecord(null);
    setInspectionRecord(null);

    const load = async () => {
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

    load();
  }, [selectedAppointment]);

  // =========================
  // TABLE
  // =========================
  const columns = [
    { title: "ID", dataIndex: "appointment_id", width: 70 },
    {
      title: "ชื่อ",
      dataIndex: ["patient", "name"],
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: "วันที่",
      dataIndex: "appointment_date",
      render: (d: string) => dayjs(d).format("DD/MM/YYYY"),
    },
    {
      title: "เวลา",
      dataIndex: "appointment_time",
      render: (t: string) => t.substring(0, 5),
    },
    { title: "ประเภท", dataIndex: "type" },
    {
      title: "สถานะ",
      dataIndex: "status",
      render: (status: string) => {
        const map: any = {
          scheduled: { color: "blue", text: "Scheduled" },
          completed: { color: "green", text: "Completed" },
        };
        const s = map[status];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "",
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

  // =========================
  // MEDICAL
  // =========================
  const renderMedical = () => {
    const hasData = !!selectedAppointment?.medical_record_id;

    return (
      <>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
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

        {!hasData && <Text type="secondary"> ยังไม่พบข้อมูล</Text>}

        {hasData && !medicalRecord && (
          <Text type="secondary"> กำลังโหลด...</Text>
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

  // =========================
  // INSPECTION
  // =========================
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

        {!hasData && <Text type="secondary"> ยังไม่พบข้อมูล</Text>}

        {hasData && !inspectionRecord && (
          <Text type="secondary"> กำลังโหลด...</Text>
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

  // =========================
  // UI
  // =========================
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
                <CalendarOutlined /> ตารางนัดหมาย
              </span>
            ),
          },
        ]}
      />

      <Card style={{ marginTop: 16 }}>
        <Title level={3}>📅 ตารางการนัดหมาย</Title>

        {/* FILTER */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Input
              placeholder="ค้นหา..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col>
            <Select
              placeholder="สถานะ"
              allowClear
              style={{ width: 150 }}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: "Scheduled", value: "scheduled" },
                { label: "Completed", value: "completed" },
              ]}
            />
          </Col>

          <Col>
            <DatePicker.RangePicker onChange={(v) => setDateRange(v)} />
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "today", label: "วันนี้" },
            { key: "all", label: "ทั้งหมด" },
            { key: "scheduled", label: "Scheduled" },
            { key: "completed", label: "Completed" },
          ]}
        />

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="appointment_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
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
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Appointment ID">
                      {selectedAppointment.appointment_id}
                    </Descriptions.Item>

                    <Descriptions.Item label="สถานะ">
                      {(() => {
                        const map: any = {
                          scheduled: { color: "blue", text: "Scheduled" },
                          completed: { color: "green", text: "Completed" },
                          cancelled: { color: "red", text: "Cancelled" },
                          request_cancel: { color: "orange", text: "Req. Cancel" },
                        };
                        const s = map[selectedAppointment.status];
                        return <Tag color={s.color}>{s.text}</Tag>;
                      })()}
                    </Descriptions.Item>

                    <Descriptions.Item label="ชื่อผู้ป่วย">
                      {selectedAppointment.patient.name}
                    </Descriptions.Item>


                    <Descriptions.Item label="แพทย์">
                      {selectedAppointment.staff.name}
                    </Descriptions.Item>

                    <Descriptions.Item label="วันที่">
                      {dayjs(selectedAppointment.appointment_date).format(
                        "DD MMMM YYYY"
                      )}
                    </Descriptions.Item>

                    <Descriptions.Item label="เวลา">
                      {selectedAppointment.appointment_time.substring(0, 5)}
                    </Descriptions.Item>

                    <Descriptions.Item label="ประเภท" span={2}>
                      <Tag color="purple">{selectedAppointment.type}</Tag>
                    </Descriptions.Item>

                  </Descriptions>
                ),
              },
              {
                key: "3",
                label: "ประวัติการตรวจ",
                children: renderInspection(),
              },{
                key: "2",
                label: "ประวัติการรักษา",
                children: renderMedical(),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}