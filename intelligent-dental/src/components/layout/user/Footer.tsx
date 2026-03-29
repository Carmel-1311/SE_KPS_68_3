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
        textAlign: "center",
        background: ThemeWebColor.footer,
        color: "#fff",
        padding: "12px 20px",
      }}
    >
      © {year ?? ""} Intelligent Dental
    </Footer>
  );
}
