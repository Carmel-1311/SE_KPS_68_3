"use client";

import CompanyFooter from "@/components/layout/company/Footer";
import CompanyHeader from "@/components/layout/company/Header";
import { ThemeWebColor } from "@/app/utils/constants";
import { getAccountRole, getAuthToken } from "@/app/utils/auth.client";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const { Content } = Layout;

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const role = getAccountRole();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role !== "company") {
      router.replace("/home");
    }
  }, [router]);

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
