"use client";

import HomeFooter from "@/components/layout/home/Footer";
import HomeHeader from "@/components/layout/home/Header";
import { ThemeWebColor } from "@/app/utils/constants";
import { Grid, Layout } from "antd";

const { Content } = Layout;

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HomeHeader />
      <Content
        style={{
          padding: isMobile ? 8 : 20,
          background: ThemeWebColor.Background,
        }}
      >
        {children}
      </Content>

      <HomeFooter />
    </Layout>
  );
}
