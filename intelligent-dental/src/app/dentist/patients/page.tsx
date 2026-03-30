"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/th";

import { useDentist } from "@/hook/useDentist";
import { withAuthHeaders } from "@/app/utils/auth.client";

import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import {
  CalendarOutlined,
  CarOutlined,
  EditOutlined,
  HistoryOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  ReadOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

dayjs.locale("th");

const { Title, Text } = Typography;

type PatientListItem = {
  id: number;
  name: string;
  email?: string;
  type?: string;
  is_mobile?: boolean;
};

type MobileDentalItem = {
  mobile_dental_id: number;
  date?: string;
  address?: string;
  count?: number;
};

type PatientDetail = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  birthday?: string;
  allergy?: string | null;
  citizen_id?: string;
  status?: string;
};

type PatientLookupRecord = {
  id?: number;
  patient_id?: number;
};

type HistoryRecord = {
  id: number;
  date?: string;
  status?: string;
  history?: string;
};

const statusColor = (status?: string) => {
  if (!status) return "default";
  if (status === "completed") return "green";
  if (status === "cancelled") return "red";
  if (status === "scheduled") return "blue";
  return "orange";
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : date;
};

export default function PatientsPage() {
  const router = useRouter();
  const {
    patients,
    loading,
    getPatientDetail,
    mobileDentals,
  } = useDentist() as {
    patients: PatientListItem[];
    loading: boolean;
    getPatientDetail: (id: number) => Promise<PatientDetail | null>;
    mobileDentals: MobileDentalItem[];
  };

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [inspectionRecords, setInspectionRecords] = useState<HistoryRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<HistoryRecord[]>([]);

  const filteredPatients = patients.filter((item) => {
    const keyword = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.id?.toString().includes(searchText) ||
      item.email?.toLowerCase().includes(keyword)
    );
  });

  const filteredMobileDentals = mobileDentals.filter((item) => {
    const keyword = searchText.toLowerCase();
    return (
      item.mobile_dental_id?.toString().includes(searchText) ||
      item.address?.toLowerCase().includes(keyword) ||
      item.date?.toLowerCase().includes(keyword)
    );
  });

  const showDetail = async (record: PatientLookupRecord) => {
    setIsDetailOpen(true);
    setModalLoading(true);

    try {
      const patientId = record.patient_id ?? record.id;

      if (patientId == null) {
        throw new Error("Patient ID is missing");
      }

      const fullData = await getPatientDetail(patientId);

      setSelectedPatient(fullData || null);
      setRecordsLoading(true);

      await Promise.all([
        fetchInspectionRecords(patientId),
        fetchMedicalRecords(patientId),
      ]);
    } catch (error) {
      console.error("Error loading patient detail:", error);
      setSelectedPatient(null);
      setInspectionRecords([]);
      setMedicalRecords([]);
    } finally {
      setModalLoading(false);
      setRecordsLoading(false);
    }
  };

  const fetchInspectionRecords = async (patientId: number) => {
    try {
      const response = await fetch(
        `/api/patients/${patientId}/inspection_records?page=1&limit=50`,
        { headers: withAuthHeaders() }
      );

      if (!response.ok) {
        setInspectionRecords([]);
        return;
      }

      const json = await response.json();
      setInspectionRecords((json.data || json || []) as HistoryRecord[]);
    } catch (error) {
      console.error("fetchInspectionRecords error", error);
      setInspectionRecords([]);
    }
  };

  const fetchMedicalRecords = async (patientId: number) => {
    try {
      const response = await fetch(
        `/api/patients/${patientId}/medical_records?page=1&limit=50`,
        { headers: withAuthHeaders() }
      );

      if (!response.ok) {
        setMedicalRecords([]);
        return;
      }

      const json = await response.json();
      setMedicalRecords((json.data || json || []) as HistoryRecord[]);
    } catch (error) {
      console.error("fetchMedicalRecords error", error);
      setMedicalRecords([]);
    }
  };

  const patientColumns: ColumnsType<PatientListItem> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: PatientListItem) => (
        <Space>
          <Text strong>{text}</Text>
          {(record.type === "mobile_dental" || record.is_mobile) && (
            <Tag icon={<CarOutlined />} color="cyan">
              Mobile
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
      render: (value?: string) => value || "-",
    },
    {
      title: "",
      key: "action",
      width: 80,
      align: "center" as const,
      render: (_value: unknown, record: PatientListItem) => (
        <Tooltip title="รายละเอียด">
          <Button
            type="text"
            icon={<ReadOutlined />}
            onClick={() => showDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const mobileColumns: ColumnsType<MobileDentalItem> = [
    {
      title: "ID",
      dataIndex: "mobile_dental_id",
      key: "mobile_dental_id",
      width: 80,
    },
    {
      title: "วันที่ออกหน่วย",
      dataIndex: "date",
      key: "date",
      render: (value?: string) => formatDate(value),
    },
    {
      title: "สถานที่",
      dataIndex: "address",
      key: "address",
      render: (value?: string) => value || "-",
    },
    {
      title: "จำนวนคน",
      dataIndex: "count",
      key: "count",
      width: 120,
      render: (value?: number) => value ?? "-",
    },
    {
      title: "",
      key: "action",
      width: 160,
      align: "center" as const,
      render: (_value: unknown, record: MobileDentalItem) => (
        <Button
          icon={<TeamOutlined />}
          onClick={() =>
            router.push(
              `/dentist/patients/mobile_dental/${record.mobile_dental_id}/patients`
            )
          }
        >
          ดูรายชื่อ
        </Button>
      ),
    },
  ];

  const renderRecordTimeline = (
    records: HistoryRecord[],
    type: "inspection" | "medical"
  ) => {
    if (recordsLoading) {
      return <Text type="secondary">กำลังโหลดข้อมูล...</Text>;
    }

    if (!records.length) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ยังไม่มีข้อมูล" />;
    }

    return (
      <Timeline
        items={records.map((record) => ({
          content: (
            <Card size="small" style={{ borderRadius: 10 }}>
              <Space
                orientation="vertical"
                size={10}
                style={{ width: "100%" }}
              >
                <Space wrap>
                  <Tag color={type === "inspection" ? "blue" : "green"}>
                    {formatDate(record.date)}
                  </Tag>
                  <Tag color={statusColor(record.status)}>
                    {(record.status || "-").toString().toUpperCase()}
                  </Tag>
                </Space>

                <Text>{record.history || "-"}</Text>

                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                  wrap
                >
                  <Text type="secondary">
                    {type === "inspection" ? "Inspection" : "Medical"} ID:{" "}
                    {record.id}
                  </Text>

                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() =>
                      router.push(
                        type === "inspection"
                          ? `/dentist/patients/${selectedPatient?.id}/inspect/${record.id}`
                          : `/dentist/patients/${selectedPatient?.id}/medical/${record.id}`
                      )
                    }
                    style={{ paddingInline: 0 }}
                  >
                    แก้ไข
                  </Button>
                </Space>
              </Space>
            </Card>
          ),
        }))}
      />
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
                <CalendarOutlined /> ข้อมูลผู้ป่วย
              </span>
            ),
          },
        ]}
      />

      <Card style={{ marginTop: 16 }}>
        <Title level={3}>ข้อมูลผู้ป่วย</Title>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12} lg={10}>
            <Input
              placeholder="ค้นหาชื่อ, ID หรืออีเมล..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Select
              value={activeTab}
              onChange={setActiveTab}
              style={{ width: "100%" }}
              options={[
                { label: `ผู้ป่วยทั้งหมด (${patients.length})`, value: "all" },
                {
                  label: `ผู้ป่วยนอกสถานที่ (${mobileDentals.length})`,
                  value: "mobile",
                },
              ]}
            />
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",
              label: (
                <span>
                  <TeamOutlined /> ผู้ป่วยทั้งหมด
                </span>
              ),
              children: (
                <Table
                  columns={patientColumns}
                  dataSource={filteredPatients}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: "mobile",
              label: (
                <span>
                  <CarOutlined /> ผู้ป่วยนอกสถานที่
                </span>
              ),
              children: (
                <Table
                  columns={mobileColumns}
                  dataSource={filteredMobileDentals}
                  rowKey="mobile_dental_id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={`แฟ้มประวัติ: ${selectedPatient?.name || "กำลังโหลด..."}`}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
        width={860}
      >
        <Spin spinning={modalLoading}>
          {selectedPatient ? (
            <Tabs
              items={[
                {
                  key: "general",
                  label: (
                    <span>
                      <UserOutlined /> ข้อมูลทั่วไป
                    </span>
                  ),
                  children: (
                    <Descriptions bordered size="small" column={2}>
                      <Descriptions.Item label="ชื่อ-นามสกุล">
                        {selectedPatient.name || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="สถานะ">
                        <Tag
                          color={
                            selectedPatient.status === "active"
                              ? "green"
                              : "default"
                          }
                        >
                          {selectedPatient.status === "active"
                            ? "ปกติ"
                            : "ปิดการใช้งาน"}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="เลขบัตรประชาชน">
                        {selectedPatient.citizen_id || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="วันเกิด">
                        {selectedPatient.birthday || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="เบอร์โทรศัพท์">
                        {selectedPatient.phone || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="อีเมล">
                        {selectedPatient.email || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="ประวัติการแพ้ยา" span={2}>
                        {selectedPatient.allergy ? (
                          <Tag color="red">{selectedPatient.allergy}</Tag>
                        ) : (
                          "ไม่มีข้อมูล"
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "inspection",
                  label: (
                    <span>
                      <HistoryOutlined /> ประวัติการตรวจ
                    </span>
                  ),
                  children: (
                    <Space
                      orientation="vertical"
                      size={16}
                      style={{ width: "100%" }}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          router.push(
                            `/dentist/patients/${selectedPatient.id}/inspect/new`
                          )
                        }
                      >
                        เพิ่มบันทึกการตรวจ
                      </Button>
                      {renderRecordTimeline(inspectionRecords, "inspection")}
                    </Space>
                  ),
                },
                {
                  key: "medical",
                  label: (
                    <span>
                      <MedicineBoxOutlined /> ประวัติการรักษา
                    </span>
                  ),
                  children: (
                    <Space
                      orientation="vertical"
                      size={16}
                      style={{ width: "100%" }}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          router.push(
                            `/dentist/patients/${selectedPatient.id}/medical/new`
                          )
                        }
                      >
                        เพิ่มบันทึกการรักษา
                      </Button>
                      {renderRecordTimeline(medicalRecords, "medical")}
                    </Space>
                  ),
                },
              ]}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="ไม่พบข้อมูลผู้ป่วย" />
          )}
        </Spin>
      </Modal>
    </div>
  );
}
