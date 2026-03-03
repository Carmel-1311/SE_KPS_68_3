"use client";

import { SafetyCertificateOutlined } from "@ant-design/icons";
import { ThemeWebColor } from "@/app/utils/constants";
import { Button, Flex, Layout, Typography } from "antd";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

const { Header } = Layout;
const { Text } = Typography;

export default function HomeHeader() {
  const router = useRouter();

  return (
    <Header
      style={{
        height: 78,
        paddingInline: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: ThemeWebColor.header,
      }}
    >
      <Flex align="center" gap={10}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: ThemeWebColor.Background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SafetyCertificateOutlined style={{ color: "#68807d", fontSize: 14 }} />
        </div>

        <Text
          style={{
            color: "#20d8dc",
            fontSize: 27,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ระบบบริหารจัดการคลินิกทันตกรรม
        </Text>
      </Flex>

      <Button
        type="default"
        icon={<LogIn size={14} />}
        style={{
          height: 32,
          borderRadius: 6,
          fontWeight: 600,
          border: "none",
        }}
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    </Header>
  );
}
