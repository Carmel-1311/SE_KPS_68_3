"use client";

import { Carousel, Flex, Grid, Modal, Typography } from "antd";
import Image from "next/image";
import { useState } from "react";

const { Text } = Typography;

const banners = [
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1800&q=80",
];

const quickMenus = [
  {
    key: "remove-unit",
    label:
      "\u0e01\u0e0e\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e16\u0e2d\u0e19\u0e2b\u0e19\u0e48\u0e27\u0e22",
    iconSrc: "/icon/icon01.png",
  },
  {
    key: "booking",
    label:
      "\u0e01\u0e0e\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e17\u0e33\u0e1f\u0e31\u0e19",
    iconSrc: "/icon/icon02.png",
  },
  {
    key: "clinic",
    label:
      "\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e04\u0e25\u0e34\u0e19\u0e34\u0e01",
    iconSrc: "/icon/icon03.png",
  },
];

const menuModalContent: Record<string, { title: string; description: string }> =
  {
    "remove-unit": {
      title:
        "\u0e01\u0e0e\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e16\u0e2d\u0e19\u0e2b\u0e19\u0e48\u0e27\u0e22",
      description:
        "\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e04\u0e34\u0e27\u0e41\u0e25\u0e30\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e16\u0e2d\u0e19\u0e2b\u0e19\u0e48\u0e27\u0e22",
    },
    booking: {
      title:
        "\u0e01\u0e0e\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e17\u0e33\u0e1f\u0e31\u0e19",
      description:
        "\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e40\u0e07\u0e37\u0e48\u0e2d\u0e19\u0e44\u0e02\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e04\u0e34\u0e27\u0e17\u0e33\u0e1f\u0e31\u0e19",
    },
    clinic: {
      title:
        "\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e04\u0e25\u0e34\u0e19\u0e34\u0e01",
      description:
        "\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e40\u0e07\u0e37\u0e48\u0e2d\u0e19\u0e44\u0e02\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e04\u0e34\u0e27",
    },
  };

export default function HomePage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  const activeMenuContent = activeMenuKey
    ? menuModalContent[activeMenuKey]
    : null;

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
          margin: isMobile ? "20px 0 0" : "34px auto 0",
          maxWidth: "100%",
          background: "#FFFFFF ",
          borderRadius: 30,
          padding: isMobile ? "12px 10px" : "24px 20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Flex wrap={isMobile} align="stretch" justify="center">
          {quickMenus.map((menu) => (
            <Flex
              key={menu.key}
              align="center"
              justify="center"
              gap={16}
              role="button"
              tabIndex={0}
              onClick={() => setActiveMenuKey(menu.key)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveMenuKey(menu.key);
                }
              }}
              style={{
                flex: isMobile ? "1 1 100%" : "1 1 33.33%",
                minHeight: isMobile ? 96 : 138,
                padding: isMobile ? "14px 10px" : "8px 26px",
                borderRight:
                  !isMobile && menu.key !== "clinic"
                    ? "1px solid #d5d5d5"
                    : "none",
                borderBottom:
                  isMobile && menu.key !== "clinic"
                    ? "1px solid #d5d5d5"
                    : "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  minWidth: isMobile ? 56 : 84,
                  height: isMobile ? 56 : 84,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={menu.iconSrc}
                  alt={menu.label}
                  width={isMobile ? 62 : 150}
                  height={isMobile ? 62 : 150}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <Text
                style={{
                  display: "block",
                  fontSize: isMobile ? 15 : 28,
                  fontWeight: 700,
                  color: "#123f6a",
                  lineHeight: isMobile ? 1.25 : 1.1,
                  whiteSpace: isMobile ? "normal" : "nowrap",
                  textAlign: isMobile ? "left" : "center",
                  overflowWrap: "anywhere",
                }}
              >
                {menu.label}
              </Text>
            </Flex>
          ))}
        </Flex>
      </div>
      <Modal
        open={Boolean(activeMenuKey)}
        title={activeMenuContent?.title}
        onCancel={() => setActiveMenuKey(null)}
        onOk={() => setActiveMenuKey(null)}
        okText="ตกลง"
        cancelText="ปิด"
      >
        <Text style={{ fontSize: 16, color: "#2c4661" }}>
          {activeMenuContent?.description}
        </Text>
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
