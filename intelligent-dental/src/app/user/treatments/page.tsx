"use client";

import { useMemo, useState } from "react";
import { Card, Input, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";
import { mockTreatments, Treatment } from "@/mock/mockTreatment";

export default function UserTreatmentsPage() {
  const [search, setSearch] = useState("");

  const filteredTreatments = useMemo(() => {
    if (!search.trim()) return mockTreatments;
    const normalized = search.trim().toLowerCase();
    return mockTreatments.filter((t) =>
      [t.date, t.dentist, t.service, t.notes]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [search]);

  const columns: ColumnsType<Treatment> = [
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "ทันตแพทย์",
      dataIndex: "dentist",
      key: "dentist",
      width: 200,
    },
    {
      title: "รายการรักษา",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "หมายเหตุ",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "ค่าใช้จ่าย",
      dataIndex: "cost",
      key: "cost",
      align: "right",
      render: (value) => (value ? `${value.toLocaleString()} บาท` : "-"),
      width: 140,
    },
  ];

  return (
    <Card
      title="ประวัติการรักษา"
      style={{ maxWidth: 900, margin: "0 auto" }}
      bodyStyle={{ padding: "1rem" }}
    >
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Search size={18} />
        <Input
          placeholder="ค้นหา (วันที่, ทันตแพทย์, รายการรักษา)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ flex: 1 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredTreatments}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: "ไม่มีข้อมูลการรักษา" }}
      />
    </Card>
  );
}
