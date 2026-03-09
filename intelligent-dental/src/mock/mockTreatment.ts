export type Treatment = {
  id: number;
  date: string;
  dentist: string;
  service: string;
  notes?: string;
  cost?: number;
};

export const mockTreatments: Treatment[] = [
  {
    id: 1,
    date: "2025-11-02",
    dentist: "ทันตแพทย์กิตติ",
    service: "ขูดหินปูน + เคลือบฟลูออไรด์",
    notes: "ทุกอย่างเรียบร้อยดี ไม่มีอาการแพ้",
    cost: 350,
  },
  {
    id: 2,
    date: "2026-01-15",
    dentist: "ทันตแพทย์สายฝน",
    service: "อุดฟัน (ฟันกรามซ้าย)",
    notes: "ใช้วัสดุสีเหมือนฟัน รู้สึกเจ็บเล็กน้อยหลังทำ 1 วัน",
    cost: 900,
  },
  {
    id: 3,
    date: "2026-03-02",
    dentist: "ทันตแพทย์กิตติ",
    service: "ถอนฟันน้ำนม",
    notes: "ถอนเรียบร้อย ไม่มีเลือดออกผิดปกติ",
    cost: 450,
  },
  {
    id: 4,
    date: "2026-03-20",
    dentist: "ทันตแพทย์สายฝน",
    service: "ขัดฟัน + ตรวจสุขภาพเหงือก",
    notes: "แนะนำการดูแลสุขภาพเหงือกเพิ่มเติม",
    cost: 300,
  },
];
