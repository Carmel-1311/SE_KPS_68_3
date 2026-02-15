import "./globals.css";
import { ConfigProvider, App as AntdApp } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import theme from "@/app/themeConfig";
import { UserProvider } from "./contexts/userContext";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["thai"],
  weight: ["400"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={kanit.className}>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <AntdApp>
              <UserProvider>{children}</UserProvider>
            </AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
