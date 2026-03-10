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
        address: "อาคารวิทยสถาน ชั้น 12 กทม."
    },
    {
        mobile_dental_id: 2,
        company_id: 1,
        date: "2026-03-20",
        count: 120,
        status: "scheduled",
        address: "นิคมอุตสาหกรรมระยอง"
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
];
export const mobileDentalStore = mockMobileDentals;