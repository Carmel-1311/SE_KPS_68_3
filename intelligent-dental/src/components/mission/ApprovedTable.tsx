"use client";

import { Mission } from "@/mock/mockMission";
import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import * as Icons from "lucide-react";
import { createTablePagination } from "@/app/utils/tablePagination";

type Props = {
  data: Mission[];
};

export default function ApprovedTable({ data }: Props) {
  const columns: ColumnsType<Mission> = [
    { title: "ชื่อหน่วยงาน", dataIndex: "name" },
    { title: "สถานที่", dataIndex: "location" },
    { title: "เบอร์ติดต่อ", dataIndex: "phone" },
    { title: "วันที่ยื่นขอ", dataIndex: "requestDate" },
    { title: "วันที่ออกหน่วย", dataIndex: "missionDate" },

    {
      title: "",
      render: () => (
        <Tooltip title="Detail">
          <Icons.BookOpenText size={16} style={{ cursor: "pointer" }} />
        </Tooltip>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" pagination={createTablePagination(10)} />;
}
