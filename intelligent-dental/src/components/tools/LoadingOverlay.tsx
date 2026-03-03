"use client";

import { Spin } from "antd";

type Props = {
  show?: boolean;
};

export default function LoadingOverlay({ show = false }: Props) {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          padding: "20px 30px",
          borderRadius: 12,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <Spin size="large" />
        <span style={{ fontSize: 14 }}>กำลังโหลด...</span>
      </div>
    </div>
  );
}