"use client";

import { Layout, Menu, Row, Col, Typography } from "antd";
import { ThemeWebColor } from "@/app/utils/constants";
import { useRouter, usePathname } from "next/navigation";
import * as Icons from "lucide-react";

const { Sider } = Layout;
const { Title } = Typography;

export default function CompanySidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { key: "status", icon: <Icons.SearchCheck size={18} />, label: "ตรวจสอบสถานะการรับบริการ", path: "/company/status" },
    { key: "request", icon: <Icons.CalendarPlus size={18} />, label: "เพิ่มการนัดหมายออกหน่วย", path: "/company/request" },
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
            <Icons.Building2 size={50} color="#fff" />
          </Col>
          <Col span={17}>
            <Title style={{ margin: 0, color: "#fff" }} level={4}>ระบบคลินิกทันตกรรม</Title>
            <Title style={{ margin: 0, color: "#fff" }} level={5}>Intelligent Dental</Title>
          </Col>
        </Row>
      </div>

      <Menu
        theme="dark"
        selectedKeys={[getSelectedKey(pathname)]}
        mode="inline"
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
