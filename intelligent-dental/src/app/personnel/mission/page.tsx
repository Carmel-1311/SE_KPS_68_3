"use client";

import Link from "next/link";
import ApprovedTable from "@/components/mission/ApprovedTable";
import PendingTable from "@/components/mission/PendingTable";
import RejectedTable from "@/components/mission/RejectedTable";
import { mockMissions } from "@/mock/mockMission";
import { Button, Card, Space, Tabs } from "antd";
import { useState } from "react";

export default function MissionPage() {
  const [activeTab, setActiveTab] = useState("1");

  const pending = mockMissions.filter((m) => m.status === "1");
  const approved = mockMissions.filter((m) => m.status === "2");
  const rejected = mockMissions.filter((m) => m.status === "3");

  return (
    <Card title="10 ตารางการออกหน่วย">
      <Space style={{ marginBottom: 12 }}>
        <Link href="/personnel/mission/detail">
          <Button>18 ดูรายละเอียด/แก้ไขการออกหน่วย</Button>
        </Link>
      </Space>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: "กำลังรออนุมัติ",
            children: <PendingTable data={pending} />,
          },
          {
            key: "2",
            label: "อนุมัติแล้ว",
            children: <ApprovedTable data={approved} />,
          },
          {
            key: "3",
            label: "ไม่อนุมัติ",
            children: <RejectedTable data={rejected} />,
          },
        ]}
      />
    </Card>
  );
}
