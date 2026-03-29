"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Button, Layout, Flex, Typography } from "antd";
import {
  CalendarCheck,
  CalendarDays,
  FileText,
  House,
  LogOut,
  Stethoscope,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccountName, getAccountUsername } from "@/app/utils/auth.client";

const { Header } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "profile", icon: <User size={16} />, label: "Profile", path: "/user/profile" },
  { key: "appointments", icon: <CalendarCheck size={16} />, label: "Appointments", path: "/user/appointments" },
  { key: "treatments", icon: <FileText size={16} />, label: "Treatment History", path: "/user/treatments" },
  { key: "appointment-schedule", icon: <CalendarDays size={16} />, label: "Schedule", path: "/user/appointment-schedule" },
];

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [accountName, setAccountName] = useState(
    () => getAccountName() || getAccountUsername() || "ผู้ใช้"
  );

  const selectedKey = pathname.split("/").filter(Boolean)[1] ?? "";

  useEffect(() => {
    const name = getAccountName() || getAccountUsername();
    if (name) setAccountName(name);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      ["auth_token", "account_role", "account_id", "patient_id", "account_name", "account_username"]
        .forEach((k) => localStorage.removeItem(k));
    }
    router.push("/login");
  };

  return (
    <Header
      style={{
        color: "#fff",
        height: 64,
        paddingInline: 20,
        backgroundColor: ThemeWebColor.header,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      {/* Logo */}
      <Flex align="center" gap={10} style={{ flexShrink: 0 }}>
        <Stethoscope size={22} color="#27EEEE" />
        <Text style={{ color: "#fff", whiteSpace: "nowrap", fontWeight: 600 }}>
          Intelligent Dental
        </Text>
      </Flex>

      {/* Nav */}
      <Flex align="center" gap={4} style={{ flex: 1, minWidth: 0 }}>
        {menuItems.map((item) => {
          const isActive = selectedKey === item.key;
          return (
            <Button
              key={item.key}
              type="text"
              icon={item.icon}
              onClick={() => router.push(item.path)}
              style={{
                color: isActive ? "#27EEEE" : "rgba(255,255,255,0.75)",
                fontWeight: isActive ? 600 : 400,
                borderRadius: 6,
                borderBottom: isActive ? "2px solid #27EEEE" : "2px solid transparent",
                paddingBottom: 0,
                height: 64,
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Flex>

      {/* User + Logout */}
      <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#fff",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {accountName.charAt(0).toUpperCase()}
        </div>
        <span style={{ color: "#fff", whiteSpace: "nowrap", fontSize: 13 }}>{accountName}</span>
        <Button
          type="text"
          icon={<LogOut size={16} />}
          onClick={handleLogout}
          style={{ color: "rgba(255,255,255,0.7)", padding: "4px 8px" }}
          title="ออกจากระบบ"
        />
      </Flex>
    </Header>
  );
}
