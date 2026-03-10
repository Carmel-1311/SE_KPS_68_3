export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "request_cancel";

export type Appointment = {
  id: string;
  date: string;
  time: string;
  dentist: string;
  branch: string;
  service: string;
  status: AppointmentStatus;
  room?: string;
  note?: string;
  createdAt: string;
};

export const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  scheduled: "กำลังจะมาถึง",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  request_cancel: "ขอยกเลิก",
};

export const mockAppointments: Appointment[] = [
  {
    id: "AP-20260315-001",
    date: "2026-03-15",
    time: "10:00",
    dentist: "ทพญ. ณัฐวดี อมรเดช",
    branch: "อโศก",
    service: "ขูดหินปูน",
    status: "scheduled",
    room: "A-03",
    note: "งดอาหารสีเข้ม 1 ชั่วโมงหลังทำ",
    createdAt: "2026-02-20T09:14:00+07:00",
  },
  {
    id: "AP-20260322-002",
    date: "2026-03-22",
    time: "11:15",
    dentist: "ทพ. ธนวัฒน์ เกียรติชัย",
    branch: "บางนา",
    service: "ตรวจสุขภาพช่องปากประจำปี",
    status: "scheduled",
    room: "B-05",
    note: "มาตามเวลานัดล่วงหน้า 15 นาที",
    createdAt: "2026-02-27T13:40:00+07:00",
  },
  {
    id: "AP-20260325-003",
    date: "2026-03-25",
    time: "17:30",
    dentist: "ทพ. พิพัฒน์ ชัยรุ่งเรือง",
    branch: "พระราม 9",
    service: "อุดฟัน",
    status: "scheduled",
    room: "R9-02",
    createdAt: "2026-03-01T18:22:00+07:00",
  },
  {
    id: "AP-20260302-004",
    date: "2026-03-02",
    time: "14:30",
    dentist: "ทพ. พิพัฒน์ ชัยรุ่งเรือง",
    branch: "พระราม 9",
    service: "อุดฟันซี่ 26",
    status: "completed",
    room: "R9-02",
    note: "ใช้วัสดุสีเหมือนฟัน",
    createdAt: "2026-02-10T11:05:00+07:00",
  },
  {
    id: "AP-20260218-005",
    date: "2026-02-18",
    time: "09:30",
    dentist: "ทพญ. กัญญา ภูวเดช",
    branch: "อโศก",
    service: "ให้คำปรึกษาจัดฟัน",
    status: "completed",
    room: "A-01",
    note: "นัด follow-up ภายใน 1 เดือน",
    createdAt: "2026-01-30T15:50:00+07:00",
  },
  {
    id: "AP-20260127-006",
    date: "2026-01-27",
    time: "16:00",
    dentist: "ทพ. อิทธิพล ธีระพงศ์",
    branch: "พระราม 9",
    service: "ถอนฟันคุด",
    status: "completed",
    room: "R9-06",
    note: "จ่ายยาแก้อักเสบและแก้ปวด",
    createdAt: "2026-01-16T08:48:00+07:00",
  },
  {
    id: "AP-20260225-007",
    date: "2026-02-25",
    time: "09:30",
    dentist: "ทพญ. กัญญา ภูวเดช",
    branch: "อโศก",
    service: "ปรึกษาจัดฟัน",
    status: "cancelled",
    note: "ผู้ป่วยขอเลื่อนนัด",
    createdAt: "2026-02-01T10:12:00+07:00",
  },
  {
    id: "AP-20260208-008",
    date: "2026-02-08",
    time: "13:00",
    dentist: "ทพญ. ปิยธิดา สุวรรณ",
    branch: "บางนา",
    service: "เคลือบฟลูออไรด์",
    status: "cancelled",
    note: "ยกเลิกเนื่องจากทันตแพทย์ติดเคสด่วน",
    createdAt: "2026-01-29T09:31:00+07:00",
  },
  {
    id: "AP-20260328-009",
    date: "2026-03-28",
    time: "10:30",
    dentist: "ทพ. ธนวัฒน์ เกียรติชัย",
    branch: "บางนา",
    service: "ขูดหินปูน",
    status: "request_cancel",
    note: "รอการยืนยันการยกเลิกนัด",
    createdAt: "2026-03-05T14:20:00+07:00",
  },
];
