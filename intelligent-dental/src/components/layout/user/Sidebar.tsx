"use client";

import { Layout, Menu, Row, Col, Typography } from "antd";
import { ThemeWebColor } from "@/app/utils/constants";
import { useRouter, usePathname } from "next/navigation";
import * as Icons from "lucide-react";

const { Sider } = Layout;
const { Title } = Typography;

export default function UserSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { key: "profile", icon: <Icons.User size={18} />, label: "ข้อมูลส่วนตัว", path: "/user/profile" },
    { key: "appointments", icon: <Icons.CalendarCheck size={18} />, label: "ตรวจสอบการนัดหมาย", path: "/user/appointments" },
    { key: "treatments", icon: <Icons.FileText size={18} />, label: "ประวัติการรักษา", path: "/user/treatments" },
    { key: "appointment-schedule", icon: <Icons.CalendarDays size={18} />, label: "ตารางนัดหมาย", path: "/user/appointment-schedule" },
  ];

  const getSelectedKey = (path: string) => {
    const seg = path.split("/").filter(Boolean)[1];
    return seg || "dashboard";
  };

  return (
    <Sider width={300} style={{ padding: 10, background: ThemeWebColor.Sidebar }}>
      <div style={{ marginBottom: 10 }}>
        <Row>
          <Col span={7} style={{ textAlign: "center", marginTop: 15 }}>
            <Icons.UserCircle2 size={50} color={ThemeWebColor.header} />
          </Col>
          <Col span={17}>
            <Title style={{ margin: 0, color: ThemeWebColor.header }} level={4}>ระบบคลินิกทันตกรรม</Title>
            <Title style={{ margin: 0, color: ThemeWebColor.header }} level={5}>Intelligent Dental</Title>
          </Col>
        </Row>
      </div>

      <Menu
        theme="light"
        className="user-sidebar-menu"
        selectedKeys={[getSelectedKey(pathname)]}
        mode="inline"
        style={{
          background: "transparent",
          borderInlineEnd: "none",
        }}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => router.push(item.path),
        }))}
      />
    </Sider>
  );
}
