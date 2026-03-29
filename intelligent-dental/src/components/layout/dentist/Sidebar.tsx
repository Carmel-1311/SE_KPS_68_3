"use client";

import { Layout, Menu } from "antd";
import { ThemeWebColor } from "@/app/utils/constants";
import { useRouter, usePathname } from "next/navigation";
import { CalendarDays, NotebookText, Stethoscope, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getAccountName, getAccountUsername } from "@/app/utils/auth.client";

const { Sider } = Layout;

const menuItems = [
  { key: "work-schedule", icon: <CalendarDays size={18} />, label: "ตารางการทำงาน", path: "/dentist/work-schedule" },
  { key: "patients", icon: <NotebookText size={18} />, label: "ตารางผู้ป่วย", path: "/dentist/patients" },
];

export default function DentistSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("ผู้ใช้");

  useEffect(() => {
    const name = getAccountName() || getAccountUsername();
    if (name) setDisplayName(name);
  }, []);

  const selectedKey = pathname.split("/").filter(Boolean)[1] || "";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      ["auth_token", "account_role", "account_id", "patient_id", "account_name", "account_username"]
        .forEach((k) => localStorage.removeItem(k));
    }
    router.push("/login");
  };

  return (
    <Sider width={260} style={{ background: ThemeWebColor.Sidebar }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
      {/* Brand */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Stethoscope size={22} color="#fff" />
        </div>
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
            ระบบคลินิกทันตกรรม
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
            Intelligent Dental
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "10px 0" }}>
        <Menu
          theme="light"
          className="app-sidebar-menu dentist-sidebar-menu"
          selectedKeys={[selectedKey]}
          mode="inline"
          style={{ background: "transparent", borderInlineEnd: "none" }}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => router.push(item.path),
          }))}
        />
      </div>

      {/* User Profile + Logout */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontWeight: 700,
              color: "#fff",
              fontSize: 14,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>ทันตแพทย์</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "7px 12px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "inherit",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          <LogOut size={15} />
          ออกจากระบบ
        </button>
      </div>
      </div>
    </Sider>
  );
}
