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
        name: "ด.ช. สมศักดิ์ เรียนดี (ป.5/1)",
        birthday: "1985-05-15",
        phone: "0812345678",
        idcard: "1100101234567"
    },
    {
        patient_id: 2,
        name: "ด.ญ. สุดา รักการอ่าน (ม.2/3)",
        birthday: "1990-08-20",
        phone: "0823456789",
        idcard: "1100101234568"
    },
    {
        patient_id: 3,
        name: "ครูวิชัย ใจดี (ฝ่ายปกครอง)",
        birthday: "1978-12-10",
        phone: "0834567890",
        idcard: "1100101234569"
    },
    {
        patient_id: 4,
        name: "ด.ช. มานี มีมา (ม.1/2)",
        birthday: "1995-03-25",
        phone: "0845678901",
        idcard: "1100101234570"
    },
    {
        patient_id: 5,
        name: "ด.ญ. สมใจ ชื่นบาน (ป.6/2)",
        birthday: "1982-11-05",
        phone: "0856789012",
        idcard: "1100101234571"
    },
    {
        patient_id: 6,
        name: "ด.ช. นภา แจ่มใส (ม.3/1)",
        birthday: "1988-06-12",
        phone: "0867890123",
        idcard: "1100101234572"
    },
    {
        patient_id: 7,
        name: "ด.ญ. ธนา สดใส (ม.4/5)",
        birthday: "1980-01-30",
        phone: "0878901234",
        idcard: "1100101234573"
    },
    {
        patient_id: 8,
        name: "ครูพิมพ์ สอนสวย (วิชาภาษาไทย)",
        birthday: "1992-09-18",
        phone: "0889012345",
        idcard: "1100101234574"
    },
];

// Map เก็บรายชื่อ patients ตาม mobile_dental_id
export const mockPatientsByMobileDentalId: Record<number, PatientInMobileRecord[]> = {
    2: [
        { patient_id: 1, name: "ด.ช. สมศักดิ์ เรียนดี (ป.5/1)", birthday: "1985-05-15", phone: "0812345678", idcard: "1100101234567" },
        { patient_id: 2, name: "ด.ญ. สุดา รักการอ่าน (ม.2/3)", birthday: "1990-08-20", phone: "0823456789", idcard: "1100101234568" },
        { patient_id: 3, name: "ครูวิชัย ใจดี (ฝ่ายปกครอง)", birthday: "1978-12-10", phone: "0834567890", idcard: "1100101234569" },
        { patient_id: 9, name: "ด.ช. กนกพล ขยันหมั่นเพียร (ป.4/2)", birthday: "2014-03-01", phone: "0891112222", idcard: "1100101234575" },
        { patient_id: 10, name: "ด.ญ. ชลดา แสงทอง (ป.4/2)", birthday: "2014-07-22", phone: "0893334444", idcard: "1100101234576" },
    ],
    3: [
        { patient_id: 4, name: "ด.ช. มานี มีมา (ม.1/2)", birthday: "1995-03-25", phone: "0845678901", idcard: "1100101234570" },
        { patient_id: 5, name: "ด.ญ. สมใจ ชื่นบาน (ป.6/2)", birthday: "1982-11-05", phone: "0856789012", idcard: "1100101234571" },
        { patient_id: 6, name: "ด.ช. นภา แจ่มใส (ม.3/1)", birthday: "1988-06-12", phone: "0867890123", idcard: "1100101234572" },
    ],
    4: [
        { patient_id: 7, name: "ด.ญ. ธนา สดใส (ม.4/5)", birthday: "1980-01-30", phone: "0878901234", idcard: "1100101234573" },
        { patient_id: 8, name: "ครูพิมพ์ สอนสวย (วิชาภาษาไทย)", birthday: "1992-09-18", phone: "0889012345", idcard: "1100101234574" },
    ],
    8: Array.from({ length: 100 }, (_, i) => ({
        patient_id: 100 + i,
        name: `พนักงานทดสอบคนที่ ${i + 1}`,
        birthday: "1990-01-01",
        phone: `0800000${(i + 1).toString().padStart(3, '0')}`,
        idcard: `1100101234${(i + 1).toString().padStart(3, '0')}`
    })),
};
