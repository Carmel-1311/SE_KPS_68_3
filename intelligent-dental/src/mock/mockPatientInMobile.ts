// Mock data ตรงตาม swagger POST /api/mobile-dental/{mobile_dental_id}/patients
// POST body: { first_name, last_name, birthday, phone, idcard }
// Response: { data: [{ patient_id, name }] }

export interface PatientInMobileInput {
    first_name: string;
    last_name: string;
    birthday: string;
    phone: string;
    idcard: string;
}
export interface PatientInMobileRecord {
    patient_id: number;
    name: string;
    birthday?: string;
    phone?: string;
    idcard?: string;
}

export const mockPatientInMobile: PatientInMobileRecord[] = [
    {
        patient_id: 1,
        name: "สมศักดิ์ มานะ",
        birthday: "1985-05-15",
        phone: "0812345678",
        idcard: "1100101234567"
    },
    {
        patient_id: 2,
        name: "สุดา แก้วใส",
        birthday: "1990-08-20",
        phone: "0823456789",
        idcard: "1100101234568"
    },
    {
        patient_id: 3,
        name: "วิชัย พันธ์ดี",
        birthday: "1978-12-10",
        phone: "0834567890",
        idcard: "1100101234569"
    },
    {
        patient_id: 4,
        name: "มานี รักษ์ดี",
        birthday: "1995-03-25",
        phone: "0845678901",
        idcard: "1100101234570"
    },
    {
        patient_id: 5,
        name: "สมปอง ชื่นใจ",
        birthday: "1982-11-05",
        phone: "0856789012",
        idcard: "1100101234571"
    },
    {
        patient_id: 6,
        name: "นภา สุวรรณ",
        birthday: "1988-06-12",
        phone: "0867890123",
        idcard: "1100101234572"
    },
    {
        patient_id: 7,
        name: "ธนา เจริญสุข",
        birthday: "1980-01-30",
        phone: "0878901234",
        idcard: "1100101234573"
    },
    {
        patient_id: 8,
        name: "พิมพ์ ลายทอง",
        birthday: "1992-09-18",
        phone: "0889012345",
        idcard: "1100101234574"
    },
];

// Map เก็บรายชื่อ patients ตาม mobile_dental_id
export const mockPatientsByMobileDentalId: Record<number, PatientInMobileRecord[]> = {
    2: [
        { patient_id: 1, name: "สมศักดิ์ มานะ" },
        { patient_id: 2, name: "สุดา แก้วใส" },
        { patient_id: 3, name: "วิชัย พันธ์ดี" },
    ],
    3: [
        { patient_id: 4, name: "มานี รักษ์ดี" },
        { patient_id: 5, name: "สมปอง ชื่นใจ" },
        { patient_id: 6, name: "นภา สุวรรณ" },
    ],
    4: [
        { patient_id: 7, name: "ธนา เจริญสุข" },
        { patient_id: 8, name: "พิมพ์ ลายทอง" },
    ],
};
