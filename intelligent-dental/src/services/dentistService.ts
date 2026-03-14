import * as res from "@/repositories/dentistRepository"
import { date_week } from "@prisma/client"


export async function getAvailableTimeSlots(dateStr: string) {
  const appointmentDate = new Date(dateStr);
  appointmentDate.setUTCHours(0, 0, 0, 0); // ตั้งค่าวันที่ให้เป็น Midnight UTC เพื่อให้ตรงกับมาตรฐาน DB

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[new Date(dateStr).getUTCDay()] as date_week;

  // ดึงข้อมูลหมอทั้งหมดพร้อมตารางเวรและนัดหมายในวันนั้น
  const dentists = await res.getDentistAppointmentsByDate(appointmentDate, day);

  const timeSlots: { time: string; available_dentist_ids: number[] }[] = [];

  // กำหนดช่วงเวลาที่คลินิกเปิด (09:00 - 18:00) 
  let currentMinutes = 9 * 60; // 09:00
  const endMinutes = 18 * 60; // 18:00

  while (currentMinutes + 30 <= endMinutes) {
    const timeStr = minutesToTime(currentMinutes);
    const availableDentists: number[] = [];

    dentists.forEach((dentist: any) => {
      const schedule = dentist.work_schedule[0];
      if (!schedule) return;

      const startWork = timeToMinutes(schedule.start_time ? schedule.start_time.toISOString().slice(11, 16) : "09.00");
      const endWork = timeToMinutes(schedule.end_time ? schedule.end_time.toISOString().slice(11, 16) : "18.00");

      // เช็กว่าเวลา Slot นี้อยู่ในช่วงทำงานของหมอหรือไม่
      const isWorking = currentMinutes >= startWork && (currentMinutes + 30) <= endWork;

      // เช็กว่าเวลานี้หมอติดนัดอื่นอยู่หรือไม่ (Exact Match)
      const isBooked = dentist.appointment.some((a: any) =>
        a.appointment_time.toISOString().slice(11, 16) === timeStr
      );

      if (isWorking && !isBooked) {
        availableDentists.push(dentist.staff_id);
      }
    });

    // เพิ่ม Slot เข้าไปในรายการเฉพาะถ้ามีหมอว่างอย่างน้อย 1 คน
    if (availableDentists.length > 0) {
      timeSlots.push({
        time: timeStr,
        available_dentist_ids: availableDentists // ส่งกลับเป็น List ของ ID หมอตามที่คุณต้องการ
      });
    }

    currentMinutes += 30; // ปรับช่วงเวลาเพิ่มทีละ 30 นาที
  }

  return timeSlots;
}

export async function getFreeDentist(dateStr: string, timeStr: string) {
  console.log("--- TEST API CALLED ---")

  let hours: number, minutes: number;

  // 1. จัดการแยกชั่วโมงและนาที (Support ทั้ง ISO และ HH:mm)
  if (timeStr.includes('T')) {
    const t = new Date(timeStr);
    hours = t.getUTCHours();
    minutes = t.getUTCMinutes();
  } else {
    const [h, m] = timeStr.split(':').map(Number);
    hours = h;
    minutes = m;
  }

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error("Invalid time format: " + timeStr);
  }

  // 2. ปรับเวลาให้เป็นช่วงมาตรฐาน (Round to .00 or .30) ตาม Industry Standard
  // เช่น ถ้าส่ง 10:15 มา จะปัดเป็น 10:00 หรือถ้า 10:45 จะเป็น 10:30
  const normalizedMinutes = minutes < 30 ? 0 : 30;
  const cleanTimeStr = `${String(hours).padStart(2, '0')}:${String(normalizedMinutes).padStart(2, '0')}:00`;

  // 3. เตรียมวันที่ (Midnight UTC)
  const appointmentDate = new Date(dateStr);
  appointmentDate.setUTCHours(0, 0, 0, 0);

  // 4. หา Enum วัน
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[new Date(dateStr).getUTCDay()] as date_week;

  console.log(`--- Searching 1 free dentist for: ${day} at ${cleanTimeStr} ---`);

  // 5. เรียก Repository เพื่อหาหมอที่ว่าง (คืนค่ากลับมาเป็น Object หมอ 1 คน)
  // หาก findFreeDentist คืนค่าเป็น List ให้เลือก index [0] ออกมา
  const dentist = await res.findFreeDentist(cleanTimeStr, appointmentDate, day);

  return dentist;
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}