"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Divider,
  Input,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import {
  mockTreatmentList,
  type Data as TreatmentData,
  type Detail as TreatmentDetail,
} from "@/mock/mockTreatmentById";

const { Text } = Typography;

const thaiMonthsShort = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];
const formatThaiDate = (dateValue: string | Date) => {
  const date = dayjs(dateValue);
  if (!date.isValid()) return String(dateValue);
  return `${date.format("DD")} ${thaiMonthsShort[date.month()]} ${date.format(
    "YYYY",
  )}`;
};

const getStatusColor = (status: string) =>
  status === "เสร็จสิ้น"
    ? "green"
    : status === "กำลังรักษา"
      ? "blue"
      : status === "ยกเลิก"
        ? "red"
        : "gold";

export default function UserTreatmentsPage() {
  const [search, setSearch] = useState("");

  const treatments = useMemo(() => {
    return [...mockTreatmentList].sort((a, b) => {
      const aValue = dayjs(a.date).valueOf();
      const bValue = dayjs(b.date).valueOf();
      return bValue - aValue;
    });
  }, []);

  const filteredTreatments = useMemo(() => {
    if (!search.trim()) return treatments;
    const normalized = search.trim().toLowerCase();
    return treatments.filter((item) => {
      const thaiDate = formatThaiDate(item.date).toLowerCase();
      const isoDate = dayjs(item.date).format("YYYY-MM-DD");
      return thaiDate.includes(normalized) || isoDate.includes(normalized);
    });
  }, [search, treatments]);

  const [activeId, setActiveId] = useState<number>(treatments[0]?.id ?? 0);

  useEffect(() => {
    if (filteredTreatments.length === 0) return;
    const hasActive = filteredTreatments.some((item) => item.id === activeId);
    if (!hasActive) setActiveId(filteredTreatments[0].id);
  }, [activeId, filteredTreatments]);

  const activeTreatment =
    filteredTreatments.find((item) => item.id === activeId) ??
    filteredTreatments[0] ??
    treatments[0];

  const filteredDetails = activeTreatment?.detail ?? [];
  const hasActiveTreatment = Boolean(activeTreatment);

  const columns: ColumnsType<TreatmentDetail> = [
    {
      title: "ประเภทการรักษา",
      dataIndex: ["examination_type", "name"],
      key: "examination_type",
      width: 220,
    },
    {
      title: "ผลการวินิจฉัย",
      dataIndex: "diagnosis",
      key: "diagnosis",
    },
  ];

  if (!hasActiveTreatment && treatments.length === 0) {
    return (
      <Card
        title="ประวัติการรักษา"
        style={{ maxWidth: 900, margin: "0 auto" }}
        styles={{ body: { padding: "1rem" } }}
      >
        <Text>ไม่มีข้อมูลการรักษา</Text>
      </Card>
    );
  }

  return (
    <Card
      title="ประวัติการรักษา"
      style={{ maxWidth: 900, margin: "0 auto" }}
      styles={{ body: { padding: "1rem" } }}
    >
      <div className="date-picker">
        <Text className="section-title">เลือกวันที่เข้ารับบริการ</Text>
        <Text className="date-counter">
          ทั้งหมด {filteredTreatments.length} รายการ
        </Text>
        <div className="search-row">
          <Search size={18} />
          <Input
            placeholder="ค้นหาวันที่นัดหมาย (เช่น 2024-03-14 หรือ 14 มี.ค. 2024)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ flex: 1 }}
          />
        </div>
        <div className="date-list">
          {filteredTreatments.map((item) => (
            <Button
              key={item.id}
              size="small"
              type={item.id === activeId ? "primary" : "default"}
              onClick={() => setActiveId(item.id)}
            >
              {formatThaiDate(item.date)}
            </Button>
          ))}
        </div>
      </div>

      {hasActiveTreatment ? (
        <>
          <div className="summary">
            <div>
              <Text className="summary-label">วันที่นัดหมาย</Text>
              <Text className="summary-value">
                {formatThaiDate(activeTreatment.date)}
              </Text>
            </div>
            <div>
              <Text className="summary-label">สถานะ</Text>
              <Tag color={getStatusColor(activeTreatment.status)} className="summary-tag">
                {activeTreatment.status}
              </Tag>
            </div>
            <div>
              <Text className="summary-label">จำนวนรายการตรวจ</Text>
              <Text className="summary-value">
                {activeTreatment.detail.length} รายการ
              </Text>
            </div>
            <div>
              <Text className="summary-label">รายละเอียด</Text>
              <Text className="summary-value">{activeTreatment.history}</Text>
            </div>
          </div>

          <Divider className="divider" />

          <div className="record">
            <Text className="section-title">บันทึกการตรวจ</Text>
            <Text className="record-line">
              วันที่ตรวจ: {formatThaiDate(activeTreatment.inspection_record.date)}
            </Text>
            <Text className="record-line">
              ประวัติ: {activeTreatment.inspection_record.history}
            </Text>
            <Text className="record-line">
              สถานะ: {activeTreatment.inspection_record.status}
            </Text>
          </div>
        </>
      ) : (
        <Text className="record-line">ไม่พบวันที่นัดหมาย</Text>
      )}

      <Table
        columns={columns}
        dataSource={filteredDetails}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "ไม่มีข้อมูลการตรวจ" }}
      />

      <style jsx global>{`
        .date-picker {
          margin-bottom: 16px;
        }

        .date-list {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .date-counter {
          display: inline-block;
          margin-left: 8px;
          font-size: 12px;
          color: #6b7b83;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          background: #f6f7f9;
          border: 1px solid #e7ecef;
          border-radius: 16px;
          padding: 16px;
        }

        .summary-label {
          display: block;
          font-size: 12px;
          color: #6b7b83;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }

        .summary-value {
          display: block;
          font-size: 15px;
          color: #1f2a33;
          font-weight: 600;
        }

        .summary-tag {
          margin-top: 4px;
        }

        .divider {
          margin: 18px 0;
        }

        .record {
          background: #ffffff;
          border: 1px solid #e7ecef;
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 18px;
        }

        .section-title {
          display: block;
          font-weight: 600;
          color: #1f2a33;
          margin-bottom: 6px;
        }

        .record-line {
          display: block;
          color: #4b5a61;
        }

        .search-row {
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .summary {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Card>
  );
}
