export interface Response {
    data: Data;
    [property: string]: any;
}

export interface Data {
    appointment_date: string;
    appointment_id: number;
    appointment_time: string;
    inspection_record?: null | InspectionRecord;
    medical_record?: null | MedicalRecord;
    patient: Patient;
    staff: Staff;
    status: Status;
    type: string;
    [property: string]: any;
}

export interface InspectionRecord {
    date: Date;
    history: string;
    /**
     * ID
     */
    id: number;
    status: string;
    [property: string]: any;
}

export interface MedicalRecord {
    date: string;
    detail: Detail[];
    history: string;
    /**
     * ID
     */
    id: number;
    status: string;
    [property: string]: any;
}

export interface Detail {
    diagnosis: string;
    id: number;
    type_id: number;
    [property: string]: any;
}

export interface Patient {
    /**
     * ID
     */
    id: number;
    /**
     * name
     */
    name: string;
    [property: string]: any;
}

export interface Staff {
    id: number;
    /**
     * name
     */
    name: string;
    [property: string]: any;
}

export enum Status {
    Cancelled = "cancelled",
    Completed = "completed",
    RequestCancel = "request_cancel",
    Scheduled = "scheduled",
}

export const mockAppointmentResponse: Response = {
    data: {
        appointment_id: 1,
        appointment_date: "2026-03-18",
        appointment_time: "10:00",
        status: Status.Scheduled,
        type: "ตรวจสุขภาพช่องปาก",
        patient: { id: 501, name: "คุณศศิ" },
        staff: { id: 201, name: "ทพ.กิตติ" },
        medical_record: null,
        inspection_record: null,
    },
};

export const mockAppointmentList: Data[] = [
    {
        appointment_id: 1,
        appointment_date: "2026-03-18",
        appointment_time: "10:00",
        status: Status.Scheduled,
        type: "ตรวจสุขภาพช่องปาก",
        patient: { id: 501, name: "คุณศศิ" },
        staff: { id: 201, name: "ทพ.กิตติ" },
        medical_record: null,
        inspection_record: null,
    },
    {
        appointment_id: 2,
        appointment_date: "2026-03-20",
        appointment_time: "14:30",
        status: Status.Completed,
        type: "ขูดหินปูน",
        patient: { id: 501, name: "คุณศศิ" },
        staff: { id: 204, name: "ทพญ.ลลิตา" },
        medical_record: {
            id: 9001,
            date: "2026-03-20",
            history: "มีหินปูนสะสมบริเวณฟันหน้า",
            status: "เสร็จสิ้น",
            detail: [{ id: 1, type_id: 14, diagnosis: "ขูดหินปูนและขัดฟัน" }],
        },
        inspection_record: {
            id: 8001,
            date: new Date("2026-03-20"),
            history: "แนะนำการใช้ไหมขัดฟัน",
            status: "เสร็จสิ้น",
        },
    },
    {
        appointment_id: 3,
        appointment_date: "2026-03-25",
        appointment_time: "09:30",
        status: Status.RequestCancel,
        type: "อุดฟัน",
        patient: { id: 501, name: "คุณศศิ" },
        staff: { id: 202, name: "ทพ.ธนา" },
        medical_record: null,
        inspection_record: null,
    },
    {
        appointment_id: 4,
        appointment_date: "2026-02-12",
        appointment_time: "16:00",
        status: Status.Cancelled,
        type: "จัดฟัน",
        patient: { id: 501, name: "คุณศศิ" },
        staff: { id: 205, name: "ทพญ.พิมพ์" },
        medical_record: null,
        inspection_record: null,
    },
    {
        appointment_id: 5,
        appointment_date: "2026-01-28",
        appointment_time: "11:15",
        status: Status.Completed,
        type: "ถอนฟันคุด",
        patient: { id: 501, name: "คุณศศิ" },
        staff: { id: 203, name: "ทพ.วินัย" },
        medical_record: {
            id: 9002,
            date: "2026-01-28",
            history: "ถอนฟันคุดล่างซ้าย",
            status: "เสร็จสิ้น",
            detail: [{ id: 1, type_id: 24, diagnosis: "ถอนฟันคุดและให้ยา" }],
        },
        inspection_record: {
            id: 8002,
            date: new Date("2026-01-28"),
            history: "นัดติดตามผลใน 7 วัน",
            status: "เสร็จสิ้น",
        },
    },
];
