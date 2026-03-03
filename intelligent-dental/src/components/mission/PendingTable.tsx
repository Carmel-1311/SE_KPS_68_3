"use client";

import { Mission } from "@/mock/mockMission";
import { Table, Button, Space, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import * as Icons from "lucide-react";

type Props = {
  data: Mission[];
};

export default function PendingTable({ data }: Props) {
  const columns: ColumnsType<Mission> = [
    { title: "ชื่อหน่วยงาน", dataIndex: "name" },
    { title: "สถานที่", dataIndex: "location" },
    { title: "เบอร์ติดต่อ", dataIndex: "phone" },
    { title: "วันที่ยื่นขอ", dataIndex: "requestDate" },
    { title: "วันที่ออกหน่วย", dataIndex: "missionDate" },

    {
      title: "จัดการ",
      render: () => (
        <Space>
          <Button type="primary">อนุมัติ</Button>
          <Button danger>ไม่อนุมัติ</Button>
        </Space>
      ),
    },
    {
      title: "",
      render: (_, record) => (
        <Tooltip title="Detail">
          <Icons.BookOpenText size={16} style={{ cursor: "pointer" }} />
        </Tooltip>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
}