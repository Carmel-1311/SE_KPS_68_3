"use client";

import PersonnelFooter from "@/components/layout/personnel/Footer";
import PersonnelHeader from "@/components/layout/personnel/Header";
import PersonnelSidebar from "@/components/layout/personnel/Sidebar";
import { ThemeWebColor } from "@/app/utils/constants";

import { Layout } from "antd";

const { Content } = Layout;

export default function PersonnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <PersonnelSidebar />

      <Layout>
        <PersonnelHeader />

        <Content style={{ padding: 20, background: ThemeWebColor.Background }}>
          {children}
        </Content>

        <PersonnelFooter />
      </Layout>
    </Layout>
  );
}
