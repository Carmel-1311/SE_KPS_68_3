import "antd/dist/antd.css";
import "./globals.css";
import { ThemeWebColor } from "@/app/utils/constants";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body style={{ backgroundColor: ThemeWebColor.Background }}>{children}</body>
    </html>
  );
}
