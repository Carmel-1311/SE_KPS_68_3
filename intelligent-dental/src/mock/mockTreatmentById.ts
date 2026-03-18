export interface Response {
    data: Data;
    [property: string]: any;
}

export interface Data {
    date: Date;
    detail: Detail[];
    history: string;
    /**
     * ID
     */
    id: number;
    inspection_record: InspectionRecord;
    patients_id: number;
    /**
     * status
     */
    status: string;
    [property: string]: any;
}

export interface Detail {
    diagnosis: string;
    examination_type: ExaminationType;
    id: number;
    [property: string]: any;
}

export interface ExaminationType {
    id: number;
    name: string;
    [property: string]: any;
}

export interface InspectionRecord {
    date: Date;
    history: string;
    id: number;
    status: string;
    [property: string]: any;
}

export const mockTreatmentList: Data[] = [
    {
        id: 101,
        patients_id: 501,
        date: new Date("2026-03-02"),
        history: "เข้ารับการอุดฟันซี่ 26 ตามนัด",
        status: "เสร็จสิ้น",
        detail: [
            {
                id: 1,
                examination_type: { id: 11, name: "ตรวจฟันผุ" },
                diagnosis: "พบฟันผุซี่ 26 ระดับกลาง",
            },
            {
                id: 2,
                examination_type: { id: 21, name: "อุดฟัน" },
                diagnosis: "อุดฟันด้วยวัสดุสีเหมือนฟัน",
            },
        ],
        inspection_record: {
            id: 3001,
            date: new Date("2026-03-02"),
            history: "ไม่มีประวัติแพ้ยา",
            status: "เสร็จสิ้น",
        },
    },
    {
        id: 102,
        patients_id: 501,
        date: new Date("2026-02-18"),
        history: "เข้ารับการให้คำปรึกษาจัดฟันตามนัด",
        status: "เสร็จสิ้น",
        detail: [
            {
                id: 1,
                examination_type: { id: 23, name: "ประเมินการจัดฟัน" },
                diagnosis: "มีความแออัดของฟันเล็กน้อย",
            },
            {
                id: 2,
                examination_type: { id: 19, name: "ให้คำแนะนำ" },
                diagnosis: "แนะนำตัวเลือกจัดฟันแบบใสและแบบโลหะ",
            },
        ],
        inspection_record: {
            id: 3002,
            date: new Date("2026-02-18"),
            history: "นัดติดตามผลภายใน 1 เดือน",
            status: "เสร็จสิ้น",
        },
    },
    {
        id: 103,
        patients_id: 501,
        date: new Date("2026-01-27"),
        history: "ถอนฟันคุดตามนัด",
        status: "เสร็จสิ้น",
        detail: [
            {
                id: 1,
                examination_type: { id: 15, name: "เอกซเรย์ฟัน" },
                diagnosis: "พบฟันคุดล่างซ้ายเอียงชนซี่ข้างเคียง",
            },
            {
                id: 2,
                examination_type: { id: 24, name: "ถอนฟันคุด" },
                diagnosis: "ถอนฟันคุดเรียบร้อย ให้ยาลดอักเสบ",
            },
        ],
        inspection_record: {
            id: 3003,
            date: new Date("2026-01-27"),
            history: "แนะนำการประคบเย็นและดูแลแผลหลังถอน",
            status: "เสร็จสิ้น",
        },
    },
    {
        id: 104,
        patients_id: 501,
        date: new Date("2026-03-12"),
        history: "มาตรวจสุขภาพช่องปากประจำปี",
        status: "เสร็จสิ้น",
        detail: [
            {
                id: 1,
                examination_type: { id: 12, name: "ตรวจสุขภาพช่องปาก" },
                diagnosis: "สภาพเหงือกปกติ ไม่มีฟันผุใหม่",
            },
            {
                id: 2,
                examination_type: { id: 14, name: "ขูดหินปูน" },
                diagnosis: "ขูดหินปูนและขัดฟันเรียบร้อย",
            },
        ],
        inspection_record: {
            id: 3004,
            date: new Date("2026-03-12"),
            history: "แนะนำการแปรงฟันและใช้ไหมขัดฟันต่อเนื่อง",
            status: "เสร็จสิ้น",
        },
    },
];

export const mockTreatmentResponse: Response = {
    data: mockTreatmentList[0],
};
