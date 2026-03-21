export interface Response {
    data: Datum[];
    [property: string]: any;
}

export interface Datum {
    appointment_date: string;
    appointment_id: number;
    appointment_time: string;
    inspection_record_id: number | null;
    medical_record_id: number | null;
    patient: Patient;
    staff: Staff;
    status: Status;
    type: string;
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

// export const mockAppointmentList: Datum[] = [
//     {
//         appointment_id: 1,
//         appointment_date: "2026-03-18",
//         appointment_time: "10:00",
//         inspection_record_id: null,
//         medical_record_id: null,
//         patient: { id: 501, name: "คุณศศิ" },
//         staff: { id: 201, name: "ทพ.กิตติ" },
//         status: Status.Scheduled,
//         type: "ตรวจสุขภาพช่องปาก",
//     },
//     {
//         appointment_id: 2,
//         appointment_date: "2026-03-20",
//         appointment_time: "14:30",
//         inspection_record_id: 8001,
//         medical_record_id: 9001,
//         patient: { id: 501, name: "คุณศศิ" },
//         staff: { id: 204, name: "ทพญ.ลลิตา" },
//         status: Status.Completed,
//         type: "ขูดหินปูน",
//     },
//     {
//         appointment_id: 3,
//         appointment_date: "2026-03-25",
//         appointment_time: "09:30",
//         inspection_record_id: null,
//         medical_record_id: null,
//         patient: { id: 501, name: "คุณศศิ" },
//         staff: { id: 202, name: "ทพ.ธนา" },
//         status: Status.RequestCancel,
//         type: "อุดฟัน",
//     },
//     {
//         appointment_id: 4,
//         appointment_date: "2026-02-12",
//         appointment_time: "16:00",
//         inspection_record_id: null,
//         medical_record_id: null,
//         patient: { id: 501, name: "คุณศศิ" },
//         staff: { id: 205, name: "ทพญ.พิมพ์" },
//         status: Status.Cancelled,
//         type: "จัดฟัน",
//     },
//     {
//         appointment_id: 5,
//         appointment_date: "2026-01-28",
//         appointment_time: "11:15",
//         inspection_record_id: 8002,
//         medical_record_id: 9002,
//         patient: { id: 501, name: "คุณศศิ" },
//         staff: { id: 203, name: "ทพ.วินัย" },
//         status: Status.Completed,
//         type: "ถอนฟันคุด",
//     },
// ];

// export const mockAppointmentResponse: Response = {
//     data: mockAppointmentList,
// };
