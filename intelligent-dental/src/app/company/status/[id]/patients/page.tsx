"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Form,
  Input,
  DatePicker,
  Button,
  Typography,
  Breadcrumb,
  Card,
  message,
  Modal,
  Popconfirm,
  Space,
  Tooltip,
  Alert,
  Empty,
  Descriptions,
  Grid,
  Row,
  Col,
} from "antd";
import { 
  TeamOutlined, 
  SaveOutlined, 
  UserAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CheckOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { BookOpenText, Pencil, Trash2, SearchCheck, House } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import {
  usePatientsMobile,
  type PatientMobile,
  type PatientDraftInput,
} from "@/hook/usePatientsMobile";
import type { paths } from "@/types/api";
import { createTablePagination } from "@/app/utils/tablePagination";

const { Title, Text } = Typography;

type DraftPatientRow = PatientDraftInput & {
  draft_id: string;
};

type UpdatePatientBody =
  paths["/api/mobile_dentals/patients/{id}"]["put"]["requestBody"]["content"]["application/json"];

type PatientFormValues = {
  first_name: string;
  last_name: string;
  birthday?: Dayjs;
  phone: string;
  idcard: string;
};

type EditState =
  | { mode: "draft"; draftId: string }
  | { mode: "submitted"; id: number; patientId: number }
  | null;

type ViewPatient = {
  name: string;
  birthday?: string;
  phone?: string;
  idcard?: string;
};

function createDraftId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

function formatThaiDate(value?: string) {
  if (!value) return "-";
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return "-";
  return dateObj.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ActionBtn = React.forwardRef<HTMLDivElement, { children: React.ReactNode; bg?: string; disabled?: boolean; onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void; tooltip: string }>(
  ({ children, bg, disabled, onClick, tooltip, ...props }, ref) => (
  <Tooltip title={tooltip}>
    <div 
        ref={ref}
        {...props}
        onClick={(e) => {
          if (disabled) return;
          if (onClick) onClick(e);
          const injectedOnClick = (props as { onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }).onClick;
          if (injectedOnClick) injectedOnClick(e);
        }}
        style={{
        width: 34, height: 34, borderRadius: 10,
        background: disabled ? "#f5f5f5" : (bg || "#f0f5ff"),
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s, transform 0.15s",
    }}>
        {children}
    </div>
  </Tooltip>
));
ActionBtn.displayName = "ActionBtn";

export default function PatientsPage() {
  const params = useParams();
  const mobileDentalId = String(params.id ?? "");
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const {
    patients,
    mission,
    loading,
    submitting,
    processingIds,
    addPatientsBulk,
    updatePatient,
    deletePatient,
  } = usePatientsMobile(mobileDentalId);

  const [form] = Form.useForm<PatientFormValues>();
  const [searchText, setSearchText] = useState("");
  const [draftRows, setDraftRows] = useState<DraftPatientRow[]>([]);
  const [viewPatient, setViewPatient] = useState<ViewPatient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editState, setEditState] = useState<EditState>(null);
  const [submittingDraft, setSubmittingDraft] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (patients.length > 0) {
      setHasSubmitted(true);
    } else if (patients.length === 0 && hasSubmitted) {
      // Auto-reset to draft mode when all patients are deleted
      setHasSubmitted(false);
    }
  }, [patients.length, hasSubmitted]);

  const isSubmittedMode = hasSubmitted;
  const targetCount = mission?.count ?? 0;

  const filteredDraftRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return draftRows;

    return draftRows.filter((row) => {
      const name = `${row.first_name} ${row.last_name}`.toLowerCase();
      return (
        name.includes(keyword) ||
        row.phone.toLowerCase().includes(keyword) ||
        row.idcard.toLowerCase().includes(keyword)
      );
    });
  }, [draftRows, searchText]);

  const filteredPatients = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return patients;

    return patients.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        (item.phone || "").toLowerCase().includes(keyword) ||
        (item.idcard || "").toLowerCase().includes(keyword)
      );
    });
  }, [patients, searchText]);

  const currentCount = isSubmittedMode ? patients.length : draftRows.length;
  const isModalSubmitting =
    submitting || (editState?.mode === "submitted" ? processingIds.includes(editState.id) : false);

  const closeModal = useCallback(() => {
    form.resetFields();
    setEditState(null);
    setModalOpen(false);
  }, [form]);

  const openAddModal = useCallback(() => {
    setEditState(null);
    setModalOpen(true);
  }, []);

  const openDraftEditModal = useCallback(
    (row: DraftPatientRow) => {
      setEditState({ mode: "draft", draftId: row.draft_id });
      setModalOpen(true);
    },
    []
  );

  const openSubmittedEditModal = useCallback(
    (row: PatientMobile) => {
      setEditState({ mode: "submitted", id: row.id, patientId: row.patient_id });
      setModalOpen(true);
    },
    []
  );

  useEffect(() => {
    if (!modalOpen) return;

    if (!editState) {
      form.resetFields();
      return;
    }

    if (editState.mode === "draft") {
      const row = draftRows.find((item) => item.draft_id === editState.draftId);
      if (!row) return;

      form.setFieldsValue({
        first_name: row.first_name,
        last_name: row.last_name,
        birthday: dayjs(row.birthday),
        phone: row.phone,
        idcard: row.idcard,
      });
      return;
    }

    const row = patients.find((item) => item.id === editState.id);
    if (!row) return;

    const [firstName, ...rest] = row.name.split(" ");
    form.setFieldsValue({
      first_name: firstName || "",
      last_name: rest.join(" "),
      birthday: "birthday" in row && typeof (row as { birthday?: string }).birthday === "string" 
        ? dayjs((row as { birthday?: string }).birthday) 
        : undefined,
      phone: row.phone || "",
      idcard: row.idcard || "",
    });
  }, [draftRows, editState, form, modalOpen, patients]);

  const handleDeleteDraft = useCallback((draftId: string) => {
    setDraftRows((prev) => prev.filter((row) => row.draft_id !== draftId));
    message.success("ลบรายการจากลิสต์แล้ว");
  }, []);

  const handleDeleteSubmitted = useCallback(
    async (id: number) => {
      await deletePatient(id);
    },
    [deletePatient]
  );

  const handleBulkSubmit = useCallback(async () => {
    if (draftRows.length === 0) {
      message.warning("ยังไม่มีรายชื่อในลิสต์");
      return;
    }
    if (targetCount > 0 && draftRows.length > targetCount) {
      message.error(`จำนวนรายชื่อเกินเป้าหมาย (${targetCount} คน)`);
      return;
    }

    setSubmittingDraft(true);
    try {
      // Deduplicate against existing patients (by idcard) and within drafts
      const existingIdcards = new Set(patients.map((p) => (p.idcard || "").trim()).filter(Boolean));
      const localSeen = new Set<string>();
      const deduped: DraftPatientRow[] = [];

      for (const d of draftRows) {
        const idcard = (d.idcard || "").trim();
        if (idcard) {
          if (existingIdcards.has(idcard) || localSeen.has(idcard)) continue;
          localSeen.add(idcard);
          deduped.push(d);
          continue;
        }

        // fallback dedupe by normalized name+birthday when idcard is missing
        const nameKey = `${(d.first_name || "").trim().toLowerCase()}|${(d.last_name || "").trim().toLowerCase()}|${d.birthday || ""}`;
        if (localSeen.has(nameKey)) continue;
        localSeen.add(nameKey);
        deduped.push(d);
      }

      if (deduped.length === 0) {
        message.warning("ไม่มีรายการใหม่ที่จะส่ง (รายการซ้ำถูกข้าม)");
        return;
      }

      const existingCount = patients.length;

      if (targetCount > 0 && existingCount + deduped.length > targetCount) {
        message.error(`ไม่สามารถส่งได้ เนื่องจากเกินจำนวนเป้าหมาย (${targetCount} คน)`);
        return;
      }

      const payload: PatientDraftInput[] = deduped.map((row) => ({
        first_name: row.first_name,
        last_name: row.last_name,
        birthday: row.birthday,
        phone: row.phone,
        idcard: row.idcard,
      }));

      const success = await addPatientsBulk(payload);
      if (success) {
        setHasSubmitted(true);
        // remove only the sent draft rows
        const sentIds = new Set(deduped.map((d) => d.draft_id));
        setDraftRows((prev) => prev.filter((r) => !sentIds.has(r.draft_id)));
        const skipped = draftRows.length - deduped.length;
        if (skipped > 0) message.info(`${skipped} รายการถูกข้ามเพราะซ้ำกับข้อมูลที่มีอยู่`);
      }
    } finally {
      setSubmittingDraft(false);
    }
  }, [addPatientsBulk, draftRows, targetCount, patients]);

  const onFinish = useCallback(
    async (values: PatientFormValues) => {
      const firstName = values.first_name.trim();
      const lastName = values.last_name.trim();
      const phone = values.phone.trim();
      const idcard = values.idcard.trim();

      if (!firstName || !lastName || !phone || !idcard) {
        message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      if (!values.birthday) {
        message.error("กรุณาระบุวันเกิด");
        return;
      }

      if (isSubmittedMode) {
        if (editState?.mode === "submitted") {
          const updatePayload: UpdatePatientBody = {
            patients_id: String(editState.patientId),
            first_name: firstName,
            last_name: lastName,
            phone,
            idcard,
            ...(values.birthday ? { birthday: values.birthday.format("YYYY-MM-DD") } : {}),
          };

          const success = await updatePatient(editState.id, updatePayload);
          if (success) closeModal();
          return;
        }

        if (targetCount > 0 && patients.length >= targetCount) {
          message.error(`ไม่สามารถเพิ่มรายชื่อได้ เนื่องจากจำนวนครบกำหนด (${targetCount} คน)`);
          return;
        }

        const createPayload: PatientDraftInput = {
          first_name: firstName,
          last_name: lastName,
          birthday: values.birthday!.format("YYYY-MM-DD"),
          phone,
          idcard,
        };

        const success = await addPatientsBulk([createPayload]);
        if (success) closeModal();
        return;
      }

      const nextRow: DraftPatientRow = {
        draft_id: editState?.mode === "draft" ? editState.draftId : createDraftId(),
        first_name: firstName,
        last_name: lastName,
        birthday: values.birthday!.format("YYYY-MM-DD"),
        phone,
        idcard,
      };

      if (editState?.mode === "draft") {
        setDraftRows((prev) => prev.map((row) => (row.draft_id === editState.draftId ? nextRow : row)));
        message.success("แก้ไขรายการในลิสต์แล้ว");
      } else {
        const nextCount = draftRows.length + 1;
        if (targetCount > 0 && nextCount > targetCount) {
          message.error(`ไม่สามารถเพิ่มรายชื่อได้ เนื่องจากจำนวนครบกำหนด (${targetCount} คน)`);
          return;
        }

        setDraftRows((prev) => [...prev, nextRow]);
        message.success("เพิ่มรายการเข้าลิสต์แล้ว");
      }

      closeModal();
    },
    [
      addPatientsBulk,
      closeModal,
      draftRows.length,
      editState,
      isSubmittedMode,
      patients.length,
      targetCount,
      updatePatient
    ]
  );

  const draftColumns: ColumnsType<DraftPatientRow> = useMemo(
    () => [
      {
        title: "ลำดับ",
        key: "index",
        width: 80,
        render: (_, __, index) => index + 1,
      },
      {
        title: "ชื่อ-นามสกุล",
        key: "name",
        render: (_, record) => `${record.first_name} ${record.last_name}`,
      },
      {
        title: "วันเกิด",
        dataIndex: "birthday",
        key: "birthday",
        width: 120,
        render: (value?: string) => {
          if (!value) return "-";
          const d = dayjs(value);
          if (!d.isValid()) return "-";
          return d.toDate().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      {
        title: "เบอร์โทร",
        dataIndex: "phone",
        key: "phone",
        width: 140,
      },
      {
        title: "เลขบัตร",
        dataIndex: "idcard",
        key: "idcard",
        width: 160,
      },
      {
        title: "การจัดการ",
        key: "action",
        width: 140,
        render: (_, record) => (
          <Space size={6}>
            <ActionBtn tooltip="ดูข้อมูล" bg="#e6f4ff" onClick={() => setViewPatient({ name: `${record.first_name} ${record.last_name}`, birthday: record.birthday, phone: record.phone, idcard: record.idcard })}>
              <BookOpenText size={16} style={{ color: "#1677ff" }} />
            </ActionBtn>
            <ActionBtn tooltip="แก้ไข" bg="#f5f5f5" onClick={() => openDraftEditModal(record)}>
              <Pencil size={16} style={{ color: "#faad14" }} />
            </ActionBtn>
            <Popconfirm title="ยืนยันการลบ" description="ต้องการลบรายการนี้จากลิสต์หรือไม่?" okText="ยืนยัน" cancelText="ยกเลิก" onConfirm={() => handleDeleteDraft(record.draft_id)}>
              <ActionBtn tooltip="ลบ" bg="#f5f5f5">
                <Trash2 size={16} style={{ color: "#ff4d4f" }} />
              </ActionBtn>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDeleteDraft, openDraftEditModal]
  );

  const submittedColumns: ColumnsType<PatientMobile> = useMemo(
    () => [
      {
        title: "ลำดับ",
        key: "index",
        width: 80,
        render: (_, __, index) => index + 1,
      },
      {
        title: "ชื่อ-นามสกุล",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "วันเกิด",
        dataIndex: "birthday",
        key: "birthday",
        width: 120,
        render: (value?: string) => {
          if (!value) return "-";
          const d = dayjs(value);
          if (!d.isValid()) return "-";
          return d.toDate().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
      {
        title: "เบอร์โทร",
        dataIndex: "phone",
        key: "phone",
        width: 140,
        render: (value?: string) => value || "-",
      },
      {
        title: "เลขบัตร",
        dataIndex: "idcard",
        key: "idcard",
        width: 160,
        render: (value?: string) => value || "-",
      },
      {
        title: "การจัดการ",
        key: "action",
        width: 140,
        render: (_, record) => {
          const disabled = processingIds.includes(record.id);
          return (
            <Space size={6}>
              <ActionBtn tooltip="ดูข้อมูล" bg="#e6f4ff" disabled={disabled} onClick={() => setViewPatient({ name: record.name, birthday: (record as unknown as { birthday?: string }).birthday, phone: record.phone, idcard: record.idcard })}>
                <BookOpenText size={16} style={{ color: disabled ? "#ccc" : "#1677ff" }} />
              </ActionBtn>

              <ActionBtn tooltip="แก้ไข" bg="#f5f5f5" disabled={disabled} onClick={() => { if (!disabled) openSubmittedEditModal(record); }}>
                <Pencil size={16} style={{ color: disabled ? "#ccc" : "#faad14" }} />
              </ActionBtn>

              <Popconfirm title="ยืนยันการลบ" description="ต้องการลบผู้รับบริการรายนี้ใช่หรือไม่?" okText="ยืนยัน" cancelText="ยกเลิก" disabled={disabled} onConfirm={() => handleDeleteSubmitted(record.id)}>
                <ActionBtn tooltip="ลบ" bg="#f5f5f5" disabled={disabled}>
                  <Trash2 size={16} style={{ color: disabled ? "#ccc" : "#ff4d4f" }} />
                </ActionBtn>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [handleDeleteSubmitted, openSubmittedEditModal, processingIds]
  );

  const renderDraftAction = useCallback(
    (record: DraftPatientRow) => (
      <Space size={6}>
        <ActionBtn tooltip="ดูข้อมูล" bg="#e6f4ff" onClick={() => setViewPatient({ name: `${record.first_name} ${record.last_name}`, birthday: record.birthday, phone: record.phone, idcard: record.idcard })}>
          <BookOpenText size={16} style={{ color: "#1677ff" }} />
        </ActionBtn>
        <ActionBtn tooltip="แก้ไข" bg="#f5f5f5" onClick={() => openDraftEditModal(record)}>
          <Pencil size={16} style={{ color: "#faad14" }} />
        </ActionBtn>
        <Popconfirm title="ยืนยันการลบ" description="ต้องการลบรายการนี้จากลิสต์หรือไม่?" okText="ยืนยัน" cancelText="ยกเลิก" onConfirm={() => handleDeleteDraft(record.draft_id)}>
          <ActionBtn tooltip="ลบ" bg="#f5f5f5">
            <Trash2 size={16} style={{ color: "#ff4d4f" }} />
          </ActionBtn>
        </Popconfirm>
      </Space>
    ),
    [handleDeleteDraft, openDraftEditModal]
  );

  const renderSubmittedAction = useCallback(
    (record: PatientMobile) => {
      const disabled = processingIds.includes(record.id);

      return (
        <Space size={6}>
          <ActionBtn tooltip="ดูข้อมูล" bg="#e6f4ff" disabled={disabled} onClick={() => setViewPatient({ name: record.name, birthday: (record as unknown as { birthday?: string }).birthday, phone: record.phone, idcard: record.idcard })}>
            <BookOpenText size={16} style={{ color: disabled ? "#ccc" : "#1677ff" }} />
          </ActionBtn>
          <ActionBtn tooltip="แก้ไข" bg="#f5f5f5" disabled={disabled} onClick={() => { if (!disabled) openSubmittedEditModal(record); }}>
            <Pencil size={16} style={{ color: disabled ? "#ccc" : "#faad14" }} />
          </ActionBtn>
          <Popconfirm title="ยืนยันการลบ" description="ต้องการลบผู้รับบริการรายนี้ใช่หรือไม่?" okText="ยืนยัน" cancelText="ยกเลิก" disabled={disabled} onConfirm={() => handleDeleteSubmitted(record.id)}>
            <ActionBtn tooltip="ลบ" bg="#f5f5f5" disabled={disabled}>
              <Trash2 size={16} style={{ color: disabled ? "#ccc" : "#ff4d4f" }} />
            </ActionBtn>
          </Popconfirm>
        </Space>
      );
    },
    [handleDeleteSubmitted, openSubmittedEditModal, processingIds]
  );

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            title: (
              <Link
                href="/company"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "inherit" }}
              >
                <House size={16} />
                <span>หน้าหลัก</span>
              </Link>
            ),
          },
          {
            title: (
              <Link
                href="/company/status"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "inherit" }}
              >
                <SearchCheck size={16} />
                <span>ตรวจสอบสถานะ</span>
              </Link>
            ),
          },
          {
            title: (
              <>
                <TeamOutlined /> รายชื่อผู้รับบริการ
              </>
            ),
          },
        ]}
      />

      <Card
        variant="borderless"
        style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
        styles={{ body: { padding: isMobile ? 16 : '24px 32px' }, header: { padding: isMobile ? 16 : '24px 32px', borderBottom: '1px solid #f0f0f0' } }}
        title={
          <Space orientation="vertical" size={2}>
            <Title level={3} style={{ margin: 0 }}>
              ผู้รับบริการตรวจนอกสถานที่
            </Title>
            {mission && (
              <Text type="secondary">
                คำขอ #{mission.mobile_dental_id} | บริษัท {mission.company.office_name} | วันที่ {formatThaiDate(mission.date)} |{" "}
                {mission.address}
              </Text>
            )}
            <Text>
              จำนวนผู้รับบริการ: <b>{currentCount}</b>
              {targetCount > 0 ? (
                <>
                  {" "}
                  / <b>{targetCount}</b>
                </>
              ) : null}{" "}
              คน
            </Text>
          </Space>
        }
        extra={
          <Space wrap style={{ width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "stretch" : "flex-end" }}>
            <Input
              placeholder="ค้นหาชื่อ / เบอร์ / เลขบัตร"
              allowClear
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ width: isMobile ? "100%" : 260, borderRadius: 10 }}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <Button type="primary" icon={<UserAddOutlined />} onClick={openAddModal} style={{ borderRadius: 10, width: isMobile ? "100%" : undefined }}>
              {isSubmittedMode ? "เพิ่มรายบุคคล" : "เพิ่มรายชื่อ"}
            </Button>
          </Space>
        }
      >
        {/* Mode Status Alert - Simplified */}
        {!isSubmittedMode ? (
          <Alert
            type="warning"
            title={<Text strong>กำลังเตรียมรายชื่อ - ยังไม่ส่ง</Text>}
            description={
              <Space orientation="vertical" size={4}>
                <Text>จำนวนผู้รับบริการ: <strong>{currentCount}</strong>{targetCount > 0 && <> / <strong>{targetCount}</strong></>} คน</Text>
                {targetCount > 0 && currentCount < targetCount && (
                  <Text type="secondary">• เพิ่มได้อีก {targetCount - currentCount} คน</Text>
                )}
                {targetCount > 0 && currentCount >= targetCount && (
                  <Text type="success">• ครบจำนวนแล้ว</Text>
                )}
                <Text type="secondary">• คลิก &quot;ยืนยันส่งรายชื่อ&quot; ด้านล่างเมื่อพร้อม</Text>
              </Space>
            }
            showIcon
            icon={<ClockCircleOutlined />}
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        ) : (
          <Alert
            type="success"
            title={<Text strong>ส่งรายชื่อแล้ว - จัดการรายบุคคล</Text>}
            description={
              <Space orientation="vertical" size={4}>
                <Text>จำนวนผู้รับบริการ: <strong>{currentCount}</strong>{targetCount > 0 && <> / <strong>{targetCount}</strong></>} คน</Text>
                {targetCount > 0 && currentCount < targetCount && (
                  <Text type="secondary">• เพิ่มได้อีก {targetCount - currentCount} คน</Text>
                )}
                {targetCount > 0 && currentCount === targetCount && (
                  <Text type="success">• ครบจำนวนแล้ว</Text>
                )}
                {targetCount > 0 && currentCount > targetCount && (
                  <Text type="warning">• เกินจำนวนที่กำหนด {currentCount - targetCount} คน</Text>
                )}
              </Space>
            }
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        {isSubmittedMode ? (
          <>
            {filteredPatients.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                styles={{ image: { height: 100 } }}
                description={
                  <Space orientation="vertical" size={12}>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      ยังไม่มีผู้รับบริการ
                    </Text>
                    <Text type="secondary">
                      คลิก &quot;เพิ่มรายบุคคล&quot; ด้านบนเพื่อเพิ่มผู้รับบริการ
                    </Text>
                  </Space>
                }
                style={{ padding: '60px 0' }}
              />
            ) : isMobile ? (
              <Space direction="vertical" size={12} style={{ display: "flex" }}>
                {filteredPatients.map((record, index) => (
                  <Card key={record.id} size="small" style={{ borderRadius: 12 }}>
                    <Space direction="vertical" size={12} style={{ display: "flex" }}>
                      <Space style={{ justifyContent: "space-between", width: "100%" }} align="start">
                        <Text strong>{index + 1}. {record.name}</Text>
                        {renderSubmittedAction(record)}
                      </Space>
                      <Row gutter={[12, 12]}>
                        <Col span={12}>
                          <Text type="secondary">วันเกิด</Text>
                          <div>{formatThaiDate((record as unknown as { birthday?: string }).birthday)}</div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">เบอร์โทร</Text>
                          <div>{record.phone || "-"}</div>
                        </Col>
                        <Col span={24}>
                          <Text type="secondary">เลขบัตร</Text>
                          <div>{record.idcard || "-"}</div>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                ))}
              </Space>
            ) : (
              <Table
                dataSource={filteredPatients}
                columns={submittedColumns}
                rowKey="id"
                loading={loading}
                pagination={createTablePagination(20)}
                sticky={{ offsetHeader: 1 }}
                style={{ borderRadius: 12, overflow: 'hidden' }}
                components={{
                  header: {
                    cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} style={{ ...props.style, background: '#fafafa', fontWeight: 600, color: '#262626' }} />
                  }
                }}
                rowClassName={() => "hover:bg-gray-50 transition-colors"}
              />
            )}
          </>
        ) : (
          <>
            {filteredDraftRows.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                styles={{ image: { height: 100 } }}
                description={
                  <Space orientation="vertical" size={12}>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      ยังไม่มีรายชื่อในลิสต์
                    </Text>
                    <Text type="secondary">
                      คลิก &quot;เพิ่มรายชื่อ&quot; ด้านบนเพื่อเพิ่มผู้รับบริการ
                    </Text>
                  </Space>
                }
                style={{ padding: '60px 0' }}
              />
            ) : (
              <>
                {isMobile ? (
                  <Space direction="vertical" size={12} style={{ display: "flex" }}>
                    {filteredDraftRows.map((record, index) => (
                      <Card key={record.draft_id} size="small" style={{ borderRadius: 12 }}>
                        <Space direction="vertical" size={12} style={{ display: "flex" }}>
                          <Space style={{ justifyContent: "space-between", width: "100%" }} align="start">
                            <Text strong>{index + 1}. {record.first_name} {record.last_name}</Text>
                            {renderDraftAction(record)}
                          </Space>
                          <Row gutter={[12, 12]}>
                            <Col span={12}>
                              <Text type="secondary">วันเกิด</Text>
                              <div>{formatThaiDate(record.birthday)}</div>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary">เบอร์โทร</Text>
                              <div>{record.phone || "-"}</div>
                            </Col>
                            <Col span={24}>
                              <Text type="secondary">เลขบัตร</Text>
                              <div>{record.idcard || "-"}</div>
                            </Col>
                          </Row>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Table
                    dataSource={filteredDraftRows}
                    columns={draftColumns}
                    rowKey="draft_id"
                    loading={loading}
                    pagination={createTablePagination(20)}
                    sticky={{ offsetHeader: 1 }}
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                    components={{
                      header: {
                        cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} style={{ ...props.style, background: '#fafafa', fontWeight: 600, color: '#262626' }} />
                      }
                    }}
                    rowClassName={() => "hover:bg-gray-50 transition-colors"}
                  />
                )}
                
                <Space wrap style={{ marginTop: 16, width: '100%', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                  <Popconfirm
                    title="ล้างรายชื่อทั้งหมด?"
                    description="คุณต้องการลบรายชื่อทั้งหมดในลิสต์ใช่หรือไม่?"
                    okText="ยืนยัน"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => {
                      setDraftRows([]);
                      message.success("ล้างรายชื่อทั้งหมดแล้ว");
                    }}
                  >
                    <Button danger icon={<DeleteOutlined />} style={{ borderRadius: 10, width: isMobile ? "100%" : undefined }}>
                      ล้างทั้งหมด
                    </Button>
                  </Popconfirm>
                  
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<CheckOutlined />}
                    loading={submittingDraft}
                    onClick={() => void handleBulkSubmit()}
                    style={{ borderRadius: 10, width: isMobile ? "100%" : undefined }}
                  >
                    ยืนยันส่งรายชื่อ ({draftRows.length} คน)
                  </Button>
                </Space>
              </>
            )}
          </>
        )}
      </Card>

      <Modal
        title={
          editState
            ? "แก้ไขข้อมูลผู้รับบริการ"
            : isSubmittedMode
              ? "เพิ่มผู้รับบริการรายบุคคล"
              : "เพิ่มผู้รับบริการเข้าลิสต์"
        }
        open={modalOpen}
        footer={null}
        onCancel={closeModal}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(values) => void onFinish(values)}>
          <Form.Item
            label="ชื่อ"
            name="first_name"
            rules={[
              { required: true, message: "กรุณาระบุชื่อ" },
              {
                validator: (_, value: string | undefined) =>
                  value?.trim() ? Promise.resolve() : Promise.reject(new Error("กรุณาระบุชื่อ")),
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="นามสกุล"
            name="last_name"
            rules={[
              { required: true, message: "กรุณาระบุนามสกุล" },
              {
                validator: (_, value: string | undefined) =>
                  value?.trim() ? Promise.resolve() : Promise.reject(new Error("กรุณาระบุนามสกุล")),
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="วันเกิด"
            name="birthday"
            rules={[{ required: true, message: "กรุณาระบุวันเกิด" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" size="large" />
          </Form.Item>

          <Form.Item
            label="เบอร์โทร"
            name="phone"
            rules={[
              { required: true, message: "กรุณาระบุเบอร์โทร" },
              {
                validator: (_, value: string | undefined) =>
                  value?.trim() ? Promise.resolve() : Promise.reject(new Error("กรุณาระบุเบอร์โทร")),
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="เลขบัตรประชาชน"
            name="idcard"
            rules={[
              { required: true, message: "กรุณาระบุเลขบัตรประชาชน" },
              { pattern: /^[0-9]{13}$/, message: "เลขบัตรต้องเป็นตัวเลข 13 หลัก" },
            ]}
          >
            <Input maxLength={13} size="large" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button htmlType="submit" type="primary" loading={isModalSubmitting} icon={<SaveOutlined />}>
              บันทึก
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={!!viewPatient} title="ข้อมูลผู้รับบริการ" footer={null} onCancel={() => setViewPatient(null)}>
        {viewPatient && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ชื่อ">{viewPatient.name}</Descriptions.Item>
            <Descriptions.Item label="วันเกิด">{formatThaiDate(viewPatient.birthday)}</Descriptions.Item>
            <Descriptions.Item label="เบอร์โทร">{viewPatient.phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="เลขบัตร">{viewPatient.idcard || "-"}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
