"use client";

import { getAccountName, getAccountUsername } from "@/app/utils/auth.client";
import { ThemeWebColor } from "@/app/utils/constants";
import { Button, Drawer, Flex, Grid, Layout, Space, Typography } from "antd";
import { Building2, CalendarPlus, House, LogOut, Menu, SearchCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const FALLBACK_ACCOUNT_NAME = "User";
const LOGOUT_TITLE = "Logout";

const menuItems = [
  { key: "home", icon: <House size={16} />, label: "Home", path: "/company" },
  { key: "status", icon: <SearchCheck size={16} />, label: "Service Status", path: "/company/status" },
  { key: "request", icon: <CalendarPlus size={16} />, label: "Add Outreach Appointment", path: "/company/request" },
];

export default function CompanyHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();
  const isDesktop = screens.lg ?? false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") {
        return () => undefined;
      }

      const handleStorageChange = () => callback();
      window.addEventListener("storage", handleStorageChange);

      return () => window.removeEventListener("storage", handleStorageChange);
    },
    () => getAccountName() || getAccountUsername() || FALLBACK_ACCOUNT_NAME,
    () => FALLBACK_ACCOUNT_NAME
  );

  const selectedKey = pathname.split("/").filter(Boolean)[1] ?? "home";

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      ["auth_token", "account_role", "account_id", "patient_id", "account_name", "account_username"].forEach((key) =>
        localStorage.removeItem(key)
      );
    }

    setMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <>
      <Header
        style={{
          color: "#fff",
          height: "auto",
          minHeight: 64,
          padding: isDesktop ? "0 24px" : "12px 16px",
          backgroundColor: ThemeWebColor.header,
          borderBottom: "1px solid rgba(39,238,238,0.12)",
        }}
      >
        <Flex align="center" justify="space-between" gap={16} wrap={isDesktop ? false : true}>
          <Flex align="center" gap={10} style={{ flexShrink: 0 }}>
            <Building2 size={22} color="#27EEEE" />
            <Text style={{ color: "#fff", whiteSpace: "nowrap", fontWeight: 600 }}>Intelligent Dental</Text>
          </Flex>

          {isDesktop ? (
            <>
              <Flex align="center" gap={4} style={{ flex: 1, minWidth: 0, justifyContent: "flex-start" }}>
                {menuItems.map((item) => {
                  const isActive = selectedKey === item.key || (item.key === "home" && !selectedKey);

                  return (
                    <Button
                      key={item.key}
                      type="text"
                      icon={item.icon}
                      onClick={() => handleNavigate(item.path)}
                      style={{
                        color: isActive ? "#27EEEE" : "rgba(255,255,255,0.75)",
                        fontWeight: isActive ? 600 : 400,
                        borderRadius: 8,
                        borderBottom: isActive ? "2px solid #27EEEE" : "2px solid transparent",
                        paddingInline: 12,
                        height: 64,
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Flex>

              <Flex align="center" gap={8} style={{ flexShrink: 0, maxWidth: "32%" }}>
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
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    color: "#fff",
                    whiteSpace: "nowrap",
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </span>
                <Button
                  type="text"
                  icon={<LogOut size={16} />}
                  onClick={handleLogout}
                  style={{ color: "rgba(255,255,255,0.7)", padding: "4px 8px" }}
                  title={LOGOUT_TITLE}
                />
              </Flex>
            </>
          ) : (
            <Button
              type="text"
              icon={<Menu size={20} />}
              onClick={() => setMobileMenuOpen(true)}
              style={{ color: "#fff", paddingInline: 8, flexShrink: 0 }}
              aria-label="Open navigation menu"
            />
          )}
        </Flex>
      </Header>

      <Drawer
        title={
          <Space size={10}>
            <Building2 size={20} color="#27EEEE" />
            <span>Intelligent Dental</span>
          </Space>
        }
        placement="right"
        size="default"
        onClose={() => setMobileMenuOpen(false)}
        open={!isDesktop && mobileMenuOpen}
      >
        <Flex vertical gap={12}>
          <Flex
            align="center"
            gap={12}
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(3,32,32,0.04)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: ThemeWebColor.header,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#fff",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <Text strong style={{ margin: 0 }}>
              {displayName}
            </Text>
          </Flex>

          {menuItems.map((item) => {
            const isActive = selectedKey === item.key || (item.key === "home" && !selectedKey);

            return (
              <Button
                key={item.key}
                type={isActive ? "primary" : "default"}
                icon={item.icon}
                onClick={() => handleNavigate(item.path)}
                style={{ justifyContent: "flex-start", height: 44 }}
              >
                {item.label}
              </Button>
            );
          })}

          <Button
            danger
            icon={<LogOut size={16} />}
            onClick={handleLogout}
            style={{ justifyContent: "flex-start", height: 44 }}
          >
            {LOGOUT_TITLE}
          </Button>
        </Flex>
      </Drawer>
    </>
  );
}
