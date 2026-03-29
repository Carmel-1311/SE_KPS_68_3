"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Layout } from "antd";
import { useEffect, useState } from "react";

const { Footer } = Layout;

export default function UserFooter() {
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

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
      © {year ?? ""} Intelligent Dental
    </Footer>
  );
}
