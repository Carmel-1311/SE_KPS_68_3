"use client";

import UserFooter from "@/components/layout/user/Footer";
import UserHeader from "@/components/layout/user/Header";
import { ThemeWebColor } from "@/app/utils/constants";
import { getAccountRole, getAuthToken } from "@/app/utils/auth.client";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const { Content } = Layout;

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const role = getAccountRole();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role !== "patient") {
      router.replace("/home");
    }
  }, [router]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <UserHeader />

      <Content style={{ padding: 20, background: ThemeWebColor.Background }}>
        {children}
      </Content>

      <UserFooter />
    </Layout>
  );
}
