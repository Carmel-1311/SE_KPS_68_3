"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Layout } from "antd";
import { usePathname } from "next/navigation";

const { Header } = Layout;

const PAGE_TITLES: Record<string, string> = {
  "work-schedule": "ตารางการทำงาน",
  patients: "ตารางผู้ป่วย",
};

export default function DentistHeader() {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[1] || "";
  const pageTitle = PAGE_TITLES[seg] || "ระบบคลินิกทันตกรรม";

  return (
    <Header
      style={{
        height: 64,
        paddingInline: 24,
        backgroundColor: ThemeWebColor.header,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
        {pageTitle}
      </span>
    </Header>
  );
}
