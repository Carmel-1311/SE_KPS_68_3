// Mock data ตรงตาม swagger definition: #/definitions/mobile_dental
// Fields: mobile_dental_id (int), company_id (int), date (date), count (int), status (string)

export interface MobileDental {
    mobile_dental_id: number;
    company_id: number;
    date: string;       // format: date (YYYY-MM-DD)
    count: number;
    status: "request" | "scheduled" | "request_cancel" | "cancel" | "completed";
    address: string;
}

export const mockMobileDentals: MobileDental[] = [
    {
        mobile_dental_id: 1,
        company_id: 1,
        date: "2026-04-15",
        count: 50,
        status: "request",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 1 ห้องพยาบาล)"
    },
    {
        mobile_dental_id: 2,
        company_id: 1,
        date: "2026-03-20",
        count: 5,
        status: "scheduled",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 3 ห้องประชุมเล็ก)"
    },
    {
        mobile_dental_id: 3,
        company_id: 2,
        date: "2026-03-25",
        count: 80,
        status: "cancel",
        address: "คลังสินค้า A2 แหลมฉบัง"
    },
    {
        mobile_dental_id: 4,
        company_id: 3,
        date: "2026-02-28",
        count: 35,
        status: "scheduled",
        address: "เซ็นทรัลเฟสติวัล เชียงใหม่ ชั้น 3"
    },
    {
        mobile_dental_id: 5,
        company_id: 2,
        date: "2026-04-05",
        count: 60,
        status: "cancel",
        address: "ถนนสาธรใต้ ตึก B"
    },
    {
        mobile_dental_id: 6,
        company_id: 1,
        date: "2026-04-10",
        count: 45,
        status: "request",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 2 ห้องกิจกรรมชั้น 1)"
    },
    {
        mobile_dental_id: 7,
        company_id: 1,
        date: "2026-04-12",
        count: 30,
        status: "request_cancel",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 1 ห้องพักครู)"
    },
    {
        mobile_dental_id: 8,
        company_id: 1,
        date: "2026-05-01",
        count: 100,
        status: "scheduled",
        address: "โรงเรียนวิทยาศึกษา (โรงพลศึกษา อาคารเอนกประสงค์)"
    },
    {
        mobile_dental_id: 9,
        company_id: 1,
        date: "2026-05-15",
        count: 85,
        status: "completed",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 4 ห้องคอมพิวเตอร์)"
    },
    {
        mobile_dental_id: 10,
        company_id: 1,
        date: "2026-06-10",
        count: 60,
        status: "request",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 1 โถงชั้นล่าง)"
    },
    {
        mobile_dental_id: 11,
        company_id: 1,
        date: "2026-06-20",
        count: 40,
        status: "cancel",
        address: "โรงเรียนวิทยาศึกษา (อาคารวิทยาศาสตร์ ห้องแล็บ)"
    },
    {
        mobile_dental_id: 12,
        company_id: 1,
        date: "2026-07-05",
        count: 55,
        status: "scheduled",
        address: "โรงเรียนวิทยาศึกษา (หอประชุมใหญ่ ปิยวิชญ์)"
    },
    {
        mobile_dental_id: 13,
        company_id: 1,
        date: "2026-07-15",
        count: 70,
        status: "request",
        address: "โรงเรียนวิทยาศึกษา (อาคารอนุบาล ห้องบุษบัน)"
    },
    {
        mobile_dental_id: 14,
        company_id: 1,
        date: "2026-08-01",
        count: 90,
        status: "scheduled",
        address: "โรงเรียนวิทยาศึกษา (อาคารศิลปะ ห้องดนตรี)"
    },
    {
        mobile_dental_id: 15,
        company_id: 1,
        date: "2026-08-20",
        count: 25,
        status: "completed",
        address: "โรงเรียนวิทยาศึกษา (สนามกีฬาในร่ม)"
    },
    {
        mobile_dental_id: 16,
        company_id: 1,
        date: "2026-09-05",
        count: 48,
        status: "request_cancel",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 2 ห้องโสตทัศนศึกษา)"
    },
    {
        mobile_dental_id: 17,
        company_id: 1,
        date: "2026-09-15",
        count: 65,
        status: "request",
        address: "โรงเรียนวิทยาศึกษา (อาคารห้องสมุด ชั้น 2)"
    },
    {
        mobile_dental_id: 18,
        company_id: 1,
        date: "2026-10-01",
        count: 110,
        status: "scheduled",
        address: "โรงเรียนวิทยาศึกษา (ลานกิจกรรมหน้าอาคาร 1)"
    },
    {
        mobile_dental_id: 19,
        company_id: 1,
        date: "2026-10-15",
        count: 40,
        status: "completed",
        address: "โรงเรียนวิทยาศึกษา (โรงอาหาร ชั้น 2)"
    },
    {
        mobile_dental_id: 20,
        company_id: 1,
        date: "2026-11-10",
        count: 75,
        status: "request",
        address: "โรงเรียนวิทยาศึกษา (อาคาร 3 ห้องแนะแนว)"
    },
];
export const mobileDentalStore = mockMobileDentals;