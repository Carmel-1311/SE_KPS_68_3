"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Layout } from "antd";

const { Footer } = Layout;

export default function UserFooter() {
  return (
    <Footer
      style={{
        background: ThemeWebColor.footer,
        color: "rgba(255,255,255,0.85)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
      }}
    >
      <span>ระบบบริหารจัดการคลินิกทันตกรรม</span>
      <span>© {new Date().getFullYear()} Intelligent Dental</span>
    </Footer>
  );
}
