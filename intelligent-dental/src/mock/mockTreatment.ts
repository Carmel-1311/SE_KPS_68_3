export type ExaminationType = {
  id: number;
  name: string;
};

export type TreatmentDetail = {
  id: number;
  examination_type: ExaminationType;
  diagnosis: string;
};

export type InspectionRecord = {
  id: number;
  date: string;
  history: string;
  status: string;
};

export type TreatmentData = {
  id: number;
  patients_id: number;
  date: string;
  history: string;
  status: string;
  detail: TreatmentDetail[];
  inspection_record: InspectionRecord;
};

export type TreatmentResponse = {
  data: TreatmentData[];
};

export const mockTreatments: TreatmentResponse = {
  data: [
    {
      id: 101,
      patients_id: 501,
      date: "2026-03-02",
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
        date: "2026-03-02",
        history: "ไม่มีประวัติแพ้ยา",
        status: "เสร็จสิ้น",
      },
    },
    {
      id: 102,
      patients_id: 501,
      date: "2026-02-18",
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
        date: "2026-02-18",
        history: "นัดติดตามผลภายใน 1 เดือน",
        status: "เสร็จสิ้น",
      },
    },
    {
      id: 103,
      patients_id: 501,
      date: "2026-01-27",
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
        date: "2026-01-27",
        history: "แนะนำการประคบเย็นและดูแลแผลหลังถอน",
        status: "เสร็จสิ้น",
      },
    },
  ],
};
