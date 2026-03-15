"use client";

import { Card, Carousel, Col, Grid, Modal, Row, Space, Typography } from "antd";
import Image from "next/image";
import { useState } from "react";

const { Text } = Typography;

type MenuDetail = {
  title: string;
  description: string;
  points: string[];
  note: string;
};

const banners = [
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1800&q=80",
];

const quickMenus = [
  {
    key: "remove-unit",
    label: "กฎการจองหน่วยบริการเคลื่อนที่",
    iconSrc: "/icon/icon01.png",
    helperText: "รายละเอียดเกี่ยวกับกฎการจองหน่วยบริการเคลื่อนที่",
  },
  {
    key: "booking",
    label: "กฎการจองบริการ",
    iconSrc: "/icon/icon02.png",
    helperText: "รายละเอียดเกี่ยวกับกฎการจองบริการ",
  },
  {
    key: "clinic",
    label: "กฎการจองคลินิก",
    iconSrc: "/icon/icon03.png",
    helperText: "รายละเอียดเกี่ยวกับกฎการจองคลินิก",
  },
];

const menuModalContent: Record<string, MenuDetail> = {
  "remove-unit": {
    title: "กฎการจองหน่วยบริการเคลื่อนที่",
    description:
      "รายละเอียดเกี่ยวกับกฎการจองหน่วยบริการเคลื่อนที่",
    points: [
      "ข้อกำหนดและเงื่อนไขการจองหน่วยบริการเคลื่อนที่",
      "ขั้นตอนการจองหน่วยบริการเคลื่อนที่",
      "รายละเอียดเพิ่มเติมเกี่ยวกับการจองหน่วยบริการเคลื่อนที่",
    ],
    note: "หมายเหตุเกี่ยวกับการจองหน่วยบริการเคลื่อนที่",
  },
  booking: {
    title: "กฎการจองบริการ",
    description:
      "รายละเอียดเกี่ยวกับกฎการจองบริการ",
    points: [
      "ข้อกำหนดและเงื่อนไขการจองบริการ",
      "ขั้นตอนการจองบริการ",
      "รายละเอียดเพิ่มเติมเกี่ยวกับการจองบริการ",
    ],
    note: "หมายเหตุเกี่ยวกับการจองบริการ",
  },
  clinic: {
    title: "ตำแหน่งการจองคลินิก",
    description:
      "รายละเอียดเกี่ยวกับกฎการจองคลินิก",
    points: [
      "ข้อกำหนดและเงื่อนไขการจองคลินิก",
      "ขั้นตอนการจองคลินิก",
      "รายละเอียดเพิ่มเติมเกี่ยวกับการจองคลินิก",
    ],
    note: "หมายเหตุเกี่ยวกับการจองคลินิก",
  },
};

export default function HomePage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  const activeMenuContent = activeMenuKey ? menuModalContent[activeMenuKey] : null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1460,
        margin: "0 auto",
        padding: isMobile ? "8px 0 0" : "16px 0 0",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          borderRadius: isMobile ? 8 : 0,
        }}
      >
        <Carousel
          autoplay
          arrows
          draggable
          dots={{ className: "home-carousel-dots" }}
          style={{ background: "#d7e9eb" }}
        >
          {banners.map((image) => (
            <div key={image}>
              <div
                aria-label="Banner Image"
                role="img"
                style={{
                  width: "100%",
                  height: isMobile ? 230 : 445,
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 1460,
          margin: "0 auto",
          padding: "12px 0 0",
        }}
      >
        <Card
          bordered={false}
          style={{
            background: "#f3f5f7",
            borderRadius: 18,
            boxShadow: "0 8px 24px rgba(10, 58, 74, 0.08)",
          }}
        >
          <Text strong style={{ color: "#113f60", display: "block", marginBottom: 14 }}>
            กฎการจองหน่วยบริการเคลื่อนที่
          </Text>
          <Text style={{ color: "#4d6d82", display: "block", marginBottom: 14 }}>
            รายละเอียดเกี่ยวกับกฎการจองหน่วยบริการเคลื่อนที่
          </Text>

          <Row gutter={[12, 12]}>
            {quickMenus.map((menu) => (
              <Col xs={24} md={12} xl={8} key={menu.key}>
                <Card
                  hoverable
                  onClick={() => setActiveMenuKey(menu.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveMenuKey(menu.key);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    borderRadius: 14,
                    border: "1px solid #c8dceb",
                    height: "100%",
                    cursor: "pointer",
                    background: "#f6f8fa",
                  }}
                  styles={{ body: { padding: "14px 12px" } }}
                >
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <Image
                      src={menu.iconSrc}
                      alt={menu.label}
                      width={56}
                      height={56}
                      style={{ objectFit: "contain" }}
                    />
                    <Text strong style={{ color: "#123f6a", lineHeight: 1.35 }}>
                      {menu.label}
                    </Text>
                    <Text style={{ color: "#63859a", fontSize: 12 }}>{menu.helperText}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      <Modal
        open={Boolean(activeMenuContent)}
        title={activeMenuContent?.title}
        onCancel={() => setActiveMenuKey(null)}
        footer={null}
      >
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Text style={{ color: "#3f5f72", lineHeight: 1.7 }}>{activeMenuContent?.description}</Text>
          <div>
            <Text strong style={{ color: "#113f60" }}>
              รายละเอียดเพิ่มเติม:
            </Text>
            <ul style={{ margin: "8px 0 0 18px", padding: 0, color: "#3f5f72", lineHeight: 1.7 }}>
              {activeMenuContent?.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </div>
          <Text style={{ color: "#5b7a8f", fontSize: 13 }}>{activeMenuContent?.note}</Text>
        </Space>
      </Modal>

      <style jsx global>{`
        .home-carousel-dots {
          text-align: right !important;
          padding-right: 10px !important;
        }
        .home-carousel-dots li button {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          opacity: 0.75;
        }
      `}</style>
    </div>
  );
}
