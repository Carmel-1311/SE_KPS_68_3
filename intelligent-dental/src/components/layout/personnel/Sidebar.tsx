"use client";

import { Layout, Menu, Row, Col, Typography } from "antd";
import { ThemeWebColor } from "@/app/utils/constants";
import { useRouter, usePathname } from "next/navigation";
import * as Icons from "lucide-react";

const { Sider } = Layout;
const { Title } = Typography;

export default function PersonnelSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: "provider",
      icon: <Icons.User size={18} />,
      label: "ข้อมูลผู้ใช้",
      path: "/personnel/provider",
    },
    {
      key: "appointment-schedule",
      icon: <Icons.CalendarCheck size={18} />,
      label: "ตารางแสดงการนัดหมาย",
      path: "/personnel/appointment-schedule",
    },
    {
      key: "work-schedule",
      icon: <Icons.FileText size={18} />,
      label: "ตารางการทำงาน",
      path: "/personnel/work-schedule",
    },
    {
      key: "mission",
      icon: <Icons.Truck size={18} />,
      label: "ตารางการออกหน่วย",
      path: "/personnel/mission",
    },
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
            <Icons.User size={50} color="#fff" />
          </Col>
          <Col span={17}>
            <Title style={{ margin: 0, color: "#fff" }} level={4}>
              ระบบคลินิกทันตกรรม
            </Title>
            <Title style={{ margin: 0, color: "#fff" }} level={5}>
              Intelligent Dental
            </Title>
          </Col>
        </Row>
      </div>

      <Menu
        theme="light"
        className="app-sidebar-menu personnel-sidebar-menu"
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
