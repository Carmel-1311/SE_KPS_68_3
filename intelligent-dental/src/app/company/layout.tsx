"use client";

import CompanyFooter from "@/components/layout/company/Footer";
import CompanyHeader from "@/components/layout/company/Header";
import { ThemeWebColor } from "@/app/utils/constants";
import { Layout } from "antd";

const { Content } = Layout;

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <CompanyHeader />

      <Content style={{ padding: 20, background: ThemeWebColor.Background }}>
        {children}
      </Content>

      <CompanyFooter />
    </Layout>
  );
}
