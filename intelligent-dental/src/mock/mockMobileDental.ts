export interface MobileDental {
    mobile_dental_id: number;
    company_id: number;
    date: string;   
    count: number;
    status: string;
}
export const mockMobileDentals: MobileDental[] = [
    {
        mobile_dental_id: 1,
        company_id: 1,
        date: "2026-04-15",
        count: 50,
        status: "pending",
    },
    {
        mobile_dental_id: 2,
        company_id: 1,
        date: "2026-03-20",
        count: 120,
        status: "approved",
    },
    {
        mobile_dental_id: 3,
        company_id: 2,
        date: "2026-03-25",
        count: 80,
        status: "in_progress",
    },
    {
        mobile_dental_id: 4,
        company_id: 3,
        date: "2026-02-28",
        count: 35,
        status: "completed",
    },
    {
        mobile_dental_id: 5,
        company_id: 2,
        date: "2026-04-05",
        count: 60,
        status: "rejected",
    },
];
