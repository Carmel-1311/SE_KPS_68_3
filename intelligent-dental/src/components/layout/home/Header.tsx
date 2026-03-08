"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Button, Flex, Grid, Layout, Typography } from "antd";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { Header } = Layout;
const { Text } = Typography;

export default function HomeHeader() {
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Header
      style={{
        height: isMobile ? "auto" : 78,
        minHeight: isMobile ? 72 : 78,
        paddingInline: isMobile ? 10 : 14,
        paddingBlock: isMobile ? 8 : 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        background: ThemeWebColor.header,
      }}
    >
      <Flex
        align="center"
        gap={isMobile ? 8 : 10}
        style={{ minWidth: 0, flex: 1 }}
      >
        <Image
          src="/icon/icon.png"
          alt="Clinic Icon"
          width={isMobile ? 34 : 40}
          height={isMobile ? 34 : 40}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />

        <Text
          style={{
            color: "#20d8dc",
            fontSize: isMobile ? 18 : 27,
            fontWeight: 700,
            lineHeight: isMobile ? 1.15 : 1,
            whiteSpace: isMobile ? "normal" : "nowrap",
            overflowWrap: "anywhere",
          }}
        >
          ระบบบริหารจัดการคลินิกทันตกรรม
        </Text>
      </Flex>

      <Button
        type="default"
        icon={<LogIn size={isMobile ? 13 : 14} />}
        style={{
          height: isMobile ? 30 : 32,
          paddingInline: isMobile ? 10 : 14,
          borderRadius: 6,
          fontWeight: 600,
          border: "none",
          flexShrink: 0,
        }}
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    </Header>
  );
}
