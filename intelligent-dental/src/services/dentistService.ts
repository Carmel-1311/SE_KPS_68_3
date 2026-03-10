import * as res from "@/repositories/dentistRepository"
import { date_week } from "@prisma/client"


export async function getFreeDentist(dateStr: string, timeStr: string) {
  console.log("--- TEST API CALLED ---")
  
  let hours: number, minutes: number;

  // ตรวจสอบว่าส่งมาเป็น ISO String หรือแค่เวลา 11:00
  if (timeStr.includes('T')) {
    const t = new Date(timeStr);
    hours = t.getUTCHours();
    minutes = t.getUTCMinutes();
  } else {
    // ถ้าส่งมาเป็น "11:00" ให้หั่น string เอาเลย
    const [h, m] = timeStr.split(':').map(Number);
    hours = h;
    minutes = m;
  }

  // ป้องกัน NaN อีกรอบ
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error("Invalid time format: " + timeStr);
  }

  const cleanTimeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  const appointmentDate = new Date(dateStr);
  appointmentDate.setUTCHours(0, 0, 0, 0);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[new Date(dateStr).getUTCDay()] as date_week;

  return await res.findFreeDentist(cleanTimeStr, appointmentDate, day);
}