"use client";

import { useMemo, useState } from "react";
import { Button, Card, Divider, Input, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import {
  mockTreatments,
  type TreatmentData,
  type TreatmentDetail,
} from "@/mock/mockTreatment";

const { Text } = Typography;

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
    return [...mockTreatments.data].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
    );
  }, []);

  const [activeId, setActiveId] = useState<number>(treatments[0]?.id ?? 0);

  const activeTreatment =
    treatments.find((item) => item.id === activeId) ?? treatments[0];

  const filteredDetails = useMemo(() => {
    if (!activeTreatment) return [];
    if (!search.trim()) return activeTreatment.detail;
    const normalized = search.trim().toLowerCase();
    return activeTreatment.detail.filter((item) =>
      [item.examination_type.name, item.diagnosis]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [search, activeTreatment]);

  const columns: ColumnsType<TreatmentDetail> = [
    {
      title: "ประเภทการตรวจ",
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

  if (!activeTreatment) {
    return (
      <Card
        title="ประวัติการรักษา"
        style={{ maxWidth: 900, margin: "0 auto" }}
        bodyStyle={{ padding: "1rem" }}
      >
        <Text>ไม่มีข้อมูลการรักษา</Text>
      </Card>
    );
  }

  return (
    <Card
      title="ประวัติการรักษา"
      style={{ maxWidth: 900, margin: "0 auto" }}
      bodyStyle={{ padding: "1rem" }}
    >
      <div className="date-picker">
        <Text className="section-title">เลือกวันที่เข้ารับบริการ</Text>
        <div className="date-list">
          {treatments.map((item) => (
            <Button
              key={item.id}
              size="small"
              type={item.id === activeId ? "primary" : "default"}
              onClick={() => setActiveId(item.id)}
            >
              {item.date}
            </Button>
          ))}
        </div>
      </div>

      <div className="summary">
        <div>
          <Text className="summary-label">วันที่นัดหมาย</Text>
          <Text className="summary-value">{activeTreatment.date}</Text>
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
          <Text className="summary-label">ประวัติ</Text>
          <Text className="summary-value">{activeTreatment.history}</Text>
        </div>
      </div>

      <Divider className="divider" />

      <div className="record">
        <Text className="section-title">บันทึกการตรวจ</Text>
        <Text className="record-line">
          วันที่ตรวจ: {activeTreatment.inspection_record.date}
        </Text>
        <Text className="record-line">
          ประวัติ: {activeTreatment.inspection_record.history}
        </Text>
        <Text className="record-line">
          สถานะ: {activeTreatment.inspection_record.status}
        </Text>
      </div>

      <div className="search-row">
        <Search size={18} />
        <Input
          placeholder="ค้นหา (ประเภทการตรวจ, ผลวินิจฉัย)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredDetails}
        rowKey="id"
        pagination={{ pageSize: 8 }}
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
