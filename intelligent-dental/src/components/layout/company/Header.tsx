"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Button, Layout, Flex, Typography } from "antd";
import { Building2, CalendarPlus, House, LogOut, SearchCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccountName, getAccountUsername } from "@/app/utils/auth.client";

const { Header } = Layout;
const { Text } = Typography;

export default function CompanyHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("ผู้ใช้");

  const menuItems = [
    { key: "home", icon: <House size={16} />, label: "Home", path: "/company" },
    { key: "status", icon: <SearchCheck size={16} />, label: "Service Status", path: "/company/status" },
    { key: "request", icon: <CalendarPlus size={16} />, label: "Add Outreach Appointment", path: "/company/request" },
  ];

  const selectedKey = pathname.split("/").filter(Boolean)[1] ?? "";

  useEffect(() => {
    const name = getAccountName() || getAccountUsername();
    if (name) setDisplayName(name);
  }, []);

  return (
    <Header
      style={{
        color: "#fff",
        height: 76,
        paddingInline: 20,
        backgroundColor: ThemeWebColor.header,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      <Flex align="center" gap={10}>
        <Building2 size={24} color="#fff" />
        <Text style={{ color: "#fff", whiteSpace: "nowrap" }}>Intelligent Dental</Text>
      </Flex>

      <Flex align="center" gap={6} style={{ flex: 1, minWidth: 0 }}>
        {menuItems.map((item) => {
          const isActive = selectedKey === item.key;
          return (
            <Button
              key={item.key}
              type={isActive ? "primary" : "text"}
              icon={item.icon}
              onClick={() => router.push(item.path)}
              style={{
                color: isActive ? "#fff" : "#d9ffff",
                borderColor: isActive ? "#3a9bff" : "transparent",
                background: isActive ? "#1677ff" : "transparent",
                fontWeight: 500,
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Flex>

      <Flex justify="flex-end" align="center" gap={10}>
        <span style={{ whiteSpace: "nowrap" }}>{displayName}</span>
        <div
          onClick={() => router.push("/")}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          <LogOut size={18} color="#fff" />
        </div>
      </Flex>
    </Header>
  );
}
