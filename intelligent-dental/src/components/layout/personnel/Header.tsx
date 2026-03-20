"use client";

import { ThemeWebColor } from "@/app/utils/constants";
import { Layout, Flex } from "antd";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccountName, getAccountUsername } from "@/app/utils/auth.client";

const { Header } = Layout;

export default function PersonnelHeader() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("ผู้ใช้");

  useEffect(() => {
    const name = getAccountName() || getAccountUsername();
    if (name) setDisplayName(name);
  }, []);

  return (
    <Header
      style={{
        textAlign: "right",
        color: "#fff",
        height: 70,
        paddingInline: 30,
        backgroundColor: ThemeWebColor.header,
      }}
    >
      <Flex justify="flex-end" align="center" gap={10}>
        <span>{displayName}</span>

        <div
          onClick={() => router.push("/")}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          <LogOut size={18} color="#fff" />
        </div>
      </Flex>
    </Header>
  );
}
