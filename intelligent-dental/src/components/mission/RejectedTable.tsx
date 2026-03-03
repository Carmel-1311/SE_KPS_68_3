"use client";

import { Mission } from "@/mock/mockMission";
import { message, Popconfirm, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import * as Icons from "lucide-react";
import { Trash2 } from "lucide-react";

type Props = {
  data: Mission[];
};

export default function RejectedTable({ data }: Props) {
  const columns: ColumnsType<Mission> = [
    { title: "ชื่อหน่วยงาน", dataIndex: "name" },
    { title: "สถานที่", dataIndex: "location" },
    { title: "เบอร์ติดต่อ", dataIndex: "phone" },
    { title: "วันที่ยื่นขอ", dataIndex: "requestDate" },
    { title: "วันที่ออกหน่วย", dataIndex: "missionDate" },
    { title: "หมายเหตุ", dataIndex: "remark" },

    {
      title: "",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {/* DETAIL */}
          <Tooltip title="Detail">
            <Icons.BookOpenText size={16} style={{ cursor: "pointer" }} />
          </Tooltip>

          {/* DELETE */}
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณต้องการลบรายการนี้ใช่หรือไม่"
            onConfirm={() => {
              console.log("delete id:", record.id);
              message.success("ลบสำเร็จ (mock)");
            }}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Tooltip title="ลบ">
              <Trash2
                size={16}
                style={{
                  cursor: "pointer",
                  color: "#ff4d4f",
                }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" />;
}
