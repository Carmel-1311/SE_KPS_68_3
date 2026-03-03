export type Mission = {
  id: number;
  name: string;
  location: string;
  phone: string;
  requestDate: string;
  missionDate: string;
  status: "1" | "2" | "3";
  remark?: string;
};

export const mockMissions: Mission[] = [
  {
    id: 1,
    name: "โรงเรียน A",
    location: "กรุงเทพ",
    phone: "0812345678",
    requestDate: "2026-01-01",
    missionDate: "2026-01-10",
    status: "1",
  },
  {
    id: 2,
    name: "ชุมชน A",
    location: "เชียงใหม่",
    phone: "0891112222",
    requestDate: "2026-02-01",
    missionDate: "2026-02-15",
    status: "2",
  },
  {
    id: 3,
    name: "โรงพยาบาล A",
    location: "ขอนแก่น",
    phone: "0909998888",
    requestDate: "2026-03-01",
    missionDate: "2026-03-10",
    status: "3",
    remark: "ข้อมูลไม่ครบ",
  },
];
