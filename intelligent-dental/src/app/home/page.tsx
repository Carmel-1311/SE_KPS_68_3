"use client";

import {
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Divider,
  Grid,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  MapPin,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;

type MenuDetail = {
  title: string;
  description: string;
  points: string[];
  note: string;
};

const banners = [
  {
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1600&q=80",
    headline: "ยินดีต้อนรับสู่ระบบคลินิกทันตกรรม",
    sub: "บริหารจัดการนัดหมาย หน่วยบริการเคลื่อนที่ และคลินิกอย่างมีประสิทธิภาพ",
  },
  {
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1800&q=80",
    headline: "บริการทันตกรรมครบวงจร",
    sub: "ทีมทันตแพทย์ผู้เชี่ยวชาญพร้อมดูแลสุขภาพช่องปากของคุณ",
  },
  {
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1800&q=80",
    headline: "หน่วยบริการเคลื่อนที่",
    sub: "บริการถึงที่ สะดวก รวดเร็ว ใส่ใจทุกชุมชน",
  },
];

const stats = [
  { icon: <Stethoscope size={22} />, value: "20+", label: "ทันตแพทย์" },
  { icon: <Users size={22} />, value: "500+", label: "ผู้ป่วยที่ดูแล" },
  { icon: <CalendarCheck size={22} />, value: "1,200+", label: "นัดหมายต่อเดือน" },
  { icon: <MapPin size={22} />, value: "10+", label: "จุดให้บริการ" },
];

const quickMenus = [
  {
    key: "remove-unit",
    label: "กฎการจองหน่วยบริการเคลื่อนที่",
    iconSrc: "/icon/icon01.png",
    helperText: "ข้อกำหนดและขั้นตอนการจองหน่วยบริการเคลื่อนที่",
    tag: "บริการเคลื่อนที่",
    tagColor: "#0FA3A3",
  },
  {
    key: "booking",
    label: "กฎการจองบริการ",
    iconSrc: "/icon/icon02.png",
    helperText: "ข้อกำหนดและขั้นตอนการจองบริการทันตกรรม",
    tag: "การจองบริการ",
    tagColor: "#086060",
  },
  {
    key: "clinic",
    label: "กฎการจองคลินิก",
    iconSrc: "/icon/icon03.png",
    helperText: "ข้อกำหนดและขั้นตอนการจองคลินิกทันตกรรม",
    tag: "คลินิก",
    tagColor: "#032020",
  },
];

const services = [
  {
    icon: <CalendarClock size={28} color="#0FA3A3" />,
    title: "นัดหมายออนไลน์",
    desc: "จองคิวทันตกรรมได้ทุกที่ทุกเวลา ไม่ต้องรอคิวยาว",
  },
  {
    icon: <ClipboardList size={28} color="#0FA3A3" />,
    title: "บันทึกประวัติการรักษา",
    desc: "จัดเก็บข้อมูลการรักษาอย่างเป็นระบบ ครบถ้วน และปลอดภัย",
  },
  {
    icon: <MapPin size={28} color="#0FA3A3" />,
    title: "หน่วยบริการเคลื่อนที่",
    desc: "บริการทันตกรรมถึงชุมชน สะดวกสบายสำหรับทุกคน",
  },
  {
    icon: <Shield size={28} color="#0FA3A3" />,
    title: "ความปลอดภัยของข้อมูล",
    desc: "ข้อมูลผู้ป่วยได้รับการปกป้องตามมาตรฐานความปลอดภัยสูงสุด",
  },
];

const menuModalContent: Record<string, MenuDetail> = {
  "remove-unit": {
    title: "กฎการจองหน่วยบริการเคลื่อนที่",
    description: "หน่วยบริการเคลื่อนที่ให้บริการทันตกรรมแก่ชุมชนในพื้นที่ต่างๆ การจองต้องปฏิบัติตามข้อกำหนดดังต่อไปนี้",
    points: [
      "ต้องจองล่วงหน้าอย่างน้อย 3 วันทำการ",
      "ระบุจำนวนผู้รับบริการโดยประมาณให้ชัดเจน",
      "ต้องได้รับการอนุมัติจากผู้มีอำนาจก่อนยืนยันการจอง",
      "สามารถยกเลิกได้ล่วงหน้าอย่างน้อย 24 ชั่วโมง",
    ],
    note: "* กรณีฉุกเฉินโปรดติดต่อเจ้าหน้าที่โดยตรง",
  },
  booking: {
    title: "กฎการจองบริการ",
    description: "การจองบริการทันตกรรมต้องปฏิบัติตามข้อกำหนดเพื่อให้การให้บริการเป็นไปอย่างราบรื่น",
    points: [
      "จองล่วงหน้าอย่างน้อย 1 วันทำการ",
      "แสดงบัตรประชาชนหรือบัตรผู้ป่วยทุกครั้ง",
      "แจ้งยกเลิกล่วงหน้าอย่างน้อย 2 ชั่วโมง",
      "ผู้ป่วยใหม่กรุณามาก่อนเวลานัด 15 นาที",
    ],
    note: "* หากไม่มาตามนัดโดยไม่แจ้งล่วงหน้า อาจมีผลต่อสิทธิ์การจองครั้งต่อไป",
  },
  clinic: {
    title: "กฎการจองคลินิก",
    description: "การจองคลินิกทันตกรรมมีข้อกำหนดเฉพาะเพื่อให้บริการได้อย่างมีคุณภาพ",
    points: [
      "เลือกคลินิกที่ต้องการใช้บริการได้จากระบบ",
      "ระบุประเภทการรักษาที่ต้องการ",
      "ชำระค่าบริการตามอัตราที่กำหนด",
      "สามารถเปลี่ยนแปลงคลินิกได้ล่วงหน้า 1 วัน",
    ],
    note: "* ราคาและบริการอาจแตกต่างกันตามแต่ละคลินิก",
  },
};

export default function HomePage() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  const activeMenuContent = activeMenuKey ? menuModalContent[activeMenuKey] : null;

  return (
    <div style={{ width: "100%", maxWidth: 1460, margin: "0 auto" }}>

      {/* ─── Hero Carousel ─── */}
      <div style={{ position: "relative", borderRadius: isMobile ? 10 : 14, overflow: "hidden" }}>
        <Carousel
          autoplay
          autoplaySpeed={5000}
          arrows
          draggable
          dots={{ className: "home-carousel-dots" }}
          effect="fade"
        >
          {banners.map((banner) => (
            <div key={banner.image}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: isMobile ? 240 : 480,
                  backgroundImage: `url(${banner.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Dark overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(3,32,32,0.35) 0%, rgba(3,32,32,0.65) 100%)",
                  }}
                />
                {/* Text overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: isMobile ? 28 : 56,
                    left: isMobile ? 20 : 48,
                    right: isMobile ? 20 : 48,
                  }}
                >
                  <Title
                    level={isMobile ? 4 : 2}
                    style={{
                      color: "#fff",
                      margin: 0,
                      textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      fontWeight: 700,
                    }}
                  >
                    {banner.headline}
                  </Title>
                  {!isMobile && (
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 16,
                        marginTop: 8,
                        display: "block",
                        textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {banner.sub}
                    </Text>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* ─── Stats Bar ─── */}
      <div
        style={{
          background: "linear-gradient(135deg, #032020 0%, #086060 100%)",
          borderRadius: isMobile ? 10 : 14,
          marginTop: 16,
          padding: isMobile ? "18px 16px" : "24px 40px",
        }}
      >
        <Row gutter={[16, 16]} justify="space-around" align="middle">
          {stats.map((s, i) => (
            <Col key={i} xs={12} md={6} style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  color: "#20d8dc",
                }}
              >
                {s.icon}
                <Text style={{ color: "#fff", fontSize: isMobile ? 20 : 26, fontWeight: 700, lineHeight: 1 }}>
                  {s.value}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{s.label}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ─── Quick Rules ─── */}
      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 4,
              height: 24,
              background: "linear-gradient(to bottom, #0FA3A3, #032020)",
              borderRadius: 4,
            }}
          />
          <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: "#032020" }}>
            กฎระเบียบการจองบริการ
          </Title>
        </div>

        <Row gutter={[16, 16]}>
          {quickMenus.map((menu) => (
            <Col xs={24} md={8} key={menu.key}>
              <Card
                hoverable
                onClick={() => setActiveMenuKey(menu.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveMenuKey(menu.key);
                  }
                }}
                role="button"
                tabIndex={0}
                style={{
                  borderRadius: 16,
                  border: "1.5px solid #b2e8e8",
                  height: "100%",
                  cursor: "pointer",
                  background: "#fff",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  overflow: "hidden",
                }}
                styles={{ body: { padding: 0 } }}
              >
                {/* Colored top bar */}
                <div
                  style={{
                    height: 6,
                    background: `linear-gradient(90deg, ${menu.tagColor}, #0FA3A3)`,
                  }}
                />
                <div style={{ padding: "20px 20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 14,
                        background: "#E6FDFD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={menu.iconSrc}
                        alt={menu.label}
                        width={44}
                        height={44}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Tag
                        style={{
                          background: menu.tagColor,
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 11,
                          marginBottom: 6,
                        }}
                      >
                        {menu.tag}
                      </Tag>
                      <Text
                        strong
                        style={{
                          color: "#032020",
                          fontSize: isMobile ? 14 : 15,
                          lineHeight: 1.4,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        {menu.label}
                      </Text>
                      <Text style={{ color: "#5a7a7a", fontSize: 13, lineHeight: 1.5 }}>
                        {menu.helperText}
                      </Text>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1px solid #e6f7f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Text style={{ color: "#0FA3A3", fontSize: 13, fontWeight: 600 }}>
                      ดูรายละเอียด →
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ─── Services Section ─── */}
      <div
        style={{
          marginTop: 28,
          background: "linear-gradient(135deg, #E6FDFD 0%, #c8f5f5 100%)",
          borderRadius: 16,
          padding: isMobile ? "24px 16px" : "36px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: "#032020" }}>
            บริการของเรา
          </Title>
          <Text style={{ color: "#5a7a7a", fontSize: 14 }}>
            ระบบบริหารจัดการคลินิกทันตกรรมแบบครบวงจร
          </Text>
        </div>
        <Row gutter={[16, 16]}>
          {services.map((svc, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1.5px solid #b2e8e8",
                  background: "#fff",
                  height: "100%",
                  textAlign: "center",
                }}
                styles={{ body: { padding: "24px 16px" } }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "#E6FDFD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  {svc.icon}
                </div>
                <Text
                  strong
                  style={{ color: "#032020", fontSize: 14, display: "block", marginBottom: 6 }}
                >
                  {svc.title}
                </Text>
                <Text style={{ color: "#6a8a8a", fontSize: 13, lineHeight: 1.6 }}>{svc.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ─── Modal ─── */}
      <Modal
        open={Boolean(activeMenuContent)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 4,
                height: 20,
                background: "linear-gradient(to bottom, #0FA3A3, #032020)",
                borderRadius: 4,
              }}
            />
            <span style={{ color: "#032020", fontWeight: 700 }}>{activeMenuContent?.title}</span>
          </div>
        }
        onCancel={() => setActiveMenuKey(null)}
        footer={
          <Button
            type="primary"
            style={{ background: "#032020", borderColor: "#032020" }}
            onClick={() => setActiveMenuKey(null)}
          >
            รับทราบ
          </Button>
        }
        styles={{ header: { paddingBottom: 12 } }}
      >
        <Paragraph style={{ color: "#3f5f72", lineHeight: 1.8, marginBottom: 12 }}>
          {activeMenuContent?.description}
        </Paragraph>
        <Divider style={{ margin: "12px 0", borderColor: "#b2e8e8" }} />
        <Text strong style={{ color: "#032020", display: "block", marginBottom: 10 }}>
          รายละเอียด
        </Text>
        <Space orientation="vertical" size={8} style={{ width: "100%" }}>
          {activeMenuContent?.points.map((point, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#E6FDFD",
                  border: "1.5px solid #0FA3A3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#0FA3A3",
                  marginTop: 1,
                }}
              >
                {i + 1}
              </div>
              <Text style={{ color: "#3f5f72", lineHeight: 1.7, flex: 1 }}>{point}</Text>
            </div>
          ))}
        </Space>
        {activeMenuContent?.note && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "#E6FDFD",
              borderRadius: 8,
              borderLeft: "3px solid #0FA3A3",
            }}
          >
            <Text style={{ color: "#086060", fontSize: 13 }}>{activeMenuContent.note}</Text>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .home-carousel-dots {
          bottom: 14px !important;
        }
        .home-carousel-dots li button {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.6) !important;
          opacity: 1 !important;
        }
        .home-carousel-dots li.slick-active button {
          background: #fff !important;
          width: 22px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
}
