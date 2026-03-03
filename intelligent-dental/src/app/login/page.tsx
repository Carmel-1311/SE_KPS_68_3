
import Link from "next/link";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 78px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 420,
          textAlign: "center",
          background: "#fff",
          borderRadius: 10,
          padding: 24,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <p style={{ color: "#666" }}>ยังไม่ได้เชื่อมระบบเข้าสู่ระบบ</p>
        <div style={{ marginTop: 20 }}>
          <Link href="/home">กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}
