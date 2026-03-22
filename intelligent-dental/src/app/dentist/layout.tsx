"use client";

import DentistFooter from "@/components/layout/dentist/Footer";
import DentistHeader from "@/components/layout/dentist/Header";
import DentistSidebar from "@/components/layout/dentist/Sidebar";
import { ThemeWebColor } from "@/app/utils/constants";
import { getAccountRole, getAuthToken } from "@/app/utils/auth.client";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const { Content } = Layout;

export default function DentistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const role = getAccountRole();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role !== "dentist") {
      router.replace("/home");
    }
  }, [router]);

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
