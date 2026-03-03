"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Layout } from "antd";

const { Footer } = Layout;

export default function PersonnelFooter() {
  return (
    <Footer
      style={{
        textAlign: "center",
        background: ThemeWebColor.footer,
        color: "#fff",
        padding: "12px 20px",
      }}
    >
      © {new Date().getFullYear()} Intelligent Dental
    </Footer>
  );
}
