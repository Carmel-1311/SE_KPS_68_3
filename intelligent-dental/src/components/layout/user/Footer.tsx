"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Layout } from "antd";

const { Footer } = Layout;

export default function UserFooter() {
  const year = String(new Date().getFullYear());

  return (
    <Footer
      style={{
        background: ThemeWebColor.footer,
        color: "rgba(255,255,255,0.85)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        rowGap: 8,
        columnGap: 16,
        fontSize: 12,
      }}
    >
      <span style={{ flex: "1 1 220px" }}>ระบบบริหารจัดการคลินิกทันตกรรม</span>
      <span style={{ flex: "0 1 auto", marginLeft: "auto" }}>© {year} Intelligent Dental</span>
    </Footer>
  );
}
