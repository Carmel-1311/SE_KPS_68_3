"use client";

import DentistFooter from "@/components/layout/dentist/Footer";
import DentistHeader from "@/components/layout/dentist/Header";
import DentistSidebar from "@/components/layout/dentist/Sidebar";
import { ThemeWebColor } from "@/app/utils/constants";
import { Layout } from "antd";

const { Content } = Layout;

export default function DentistLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <DentistSidebar />

      <Layout>
        <DentistHeader />

        <Content style={{ padding: 20, background: ThemeWebColor.Background }}>
          {children}
        </Content>

        <DentistFooter />
      </Layout>
    </Layout>
  );
}
