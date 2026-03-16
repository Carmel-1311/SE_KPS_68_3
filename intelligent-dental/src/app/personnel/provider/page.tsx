"use client";

import {
  convertDateTimeToBuddhist,
  convertDateTimeToNumber,
} from "@/app/utils/utils";
import LoadingOverlay from "@/components/tools/LoadingOverlay";

import {
  Button,
  Col,
  Form,
  Input,
  Pagination,
  PaginationProps,
  Row,
  Space,
  Table,
  TableProps,
  Tooltip,
  Typography,
  Tabs,
  Card, Breadcrumb
} from "antd";
import { UserAddOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import * as Icons from "lucide-react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

dayjs.locale("th");

type Role = "patient" | "dentist" | "staff" | "company";

interface ApiResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: Role;
  phone: string;
  email: string;
}

export default function UserIndexPage() {
  const { Title } = Typography;
  const loading = false;
  const router = useRouter();
  const [form] = Form.useForm();

  const [role, setRole] = useState<Role>("patient");
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<ApiResponse<User>["meta"]>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [currentSearch, setCurrentSearch] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  // ================= MOCK DATA =================

  const mockPatients: ApiResponse<User> = {
    data: [
      {
        id: 1,
        firstName: "สมชาย",
        lastName: "ใจดี",
        role: "patient",
        phone: "0811111111",
        email: "patient@test.com",
      },
    ],
    meta: { page: 1, limit: 10, total: 1 },
  };

  const mockStaff: ApiResponse<User> = {
    data: [
      {
        id: 2,
        firstName: "นพ.",
        lastName: "สมเกียรติ",
        role: "dentist",
        phone: "0822222222",
        email: "dentist@test.com",
      },
      {
        id: 3,
        firstName: "ศิริพร",
        lastName: "ดีมาก",
        role: "staff",
        phone: "0833333333",
        email: "staff@test.com",
      },
    ],
    meta: { page: 1, limit: 10, total: 2 },
  };

  const mockCompany: ApiResponse<User> = {
    data: [
      {
        id: 4,
        firstName: "Dental",
        lastName: "Company",
        role: "company",
        phone: "0999999999",
        email: "company@test.com",
      },
    ],
    meta: { page: 1, limit: 10, total: 1 },
  };

  async function getUsers(role: Role): Promise<ApiResponse<User>> {
    if (role === "patient") return mockPatients;
    if (role === "dentist" || role === "staff") return mockStaff;
    if (role === "company") return mockCompany;

    return { data: [], meta: { page: 1, limit: 10, total: 0 } };
  }

  const loadUsers = async (selectedRole: Role) => {
    const res = await getUsers(selectedRole);
    setUsers(res.data);
    setMeta(res.meta);
  };

  useEffect(() => {
    loadUsers(role);
  }, [role]);

  // ================= FILTER =================

  const filteredUsers = users
    .filter((u) => {
      // filter ตาม tab
      if (role === "dentist") return u.role === "dentist"
      if (role === "staff") return u.role === "staff"
      return true
    })
    .filter((u) => {
      // filter search
      return (
        (!currentSearch.firstName ||
          u.firstName.includes(currentSearch.firstName)) &&
        (!currentSearch.lastName ||
          u.lastName.includes(currentSearch.lastName))
      )
    })

  // ================= TABLE =================

  const columns: TableProps<User>["columns"] = [
    {
      title: "ชื่อ-นามสกุล",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "เบอร์โทรศัพท์",
      dataIndex: "phone",
    },
    {
      title: "อีเมล",
      dataIndex: "email",
    },
    {
      title: "จัดการ",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Detail">
            <Icons.BookOpenText
              size={16}
              style={{ cursor: "pointer" }}
              onClick={() => {
                router.push(`/personnel/provider/detail/${role}/${record.id}`)
              }}
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Pencil
              size={16}
              style={{ cursor: "pointer" }}
              onClick={() => {
                router.push(`/personnel/provider/edit/${role}/${record.id}`)
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
    setMeta({ ...meta, page: pageNumber });
  };

  const onSearch = () => {
    setCurrentSearch({
      firstName: form.getFieldValue("firstName"),
      lastName: form.getFieldValue("lastName"),
    });
  };

  return (
    <>

      <LoadingOverlay show={loading} />

      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: '24px', fontSize: '15px' }}
          items={[
            { title: <a onClick={() => router.push('/')}><HomeOutlined /> หน้าหลัก</a> },
            { title: <span><UserAddOutlined /> ข้อมูลผู้ใช้</span> },
          ]}
        />
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <Space orientation="vertical" style={{ width: "100%" }} size={16}>
            {/* HEADER */}
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  จัดการข้อมูลผู้ใช้
                </Title>
                <Typography.Text type="secondary">
                  บริหารข้อมูลผู้ใช้ในระบบ
                </Typography.Text>
              </Col>

            </Row>

            {/* ROLE TABS */}
            <Tabs
              defaultActiveKey="patient"
              onChange={(key) => {
                setRole(key as Role);
                setMeta({ ...meta, page: 1 });
              }}
              items={[
                { key: "patient", label: "ผู้ป่วย" },
                { key: "dentist", label: "ทันตแพทย์" },
                { key: "staff", label: "พนักงานทั่วไป" },
                { key: "company", label: "หน่วยงานภายนอก" },
              ]}
            />

            {/* SEARCH + ADD */}
            <Row justify="space-between" align="middle">
              <Col>
                <Form layout="inline" form={form}>
                  <Form.Item name="searht">
                    <Input
                      placeholder="ค้นหา"
                      allowClear
                      prefix={<Icons.Search size={16} />}
                      style={{ width: 200 }}
                    />
                  </Form.Item>

                  <Button type="primary" onClick={onSearch}>
                    ค้นหา
                  </Button>
                </Form>
              </Col>

              <Col>
                <Button
                  type="primary"
                  icon={<Icons.Plus size={16} />}
                  onClick={() => router.push(`/personnel/provider/new`)}
                >
                  เพิ่มข้อมูลผู้ใช้
                </Button>
              </Col>
            </Row>
            {/* TABLE */}

            <Table
              columns={columns}
              rowKey="id"
              dataSource={filteredUsers}
              pagination={false}
              bordered
              style={{ marginTop: 16 }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Pagination
                current={meta.page}
                total={meta.total}
                pageSize={meta.limit}
                onChange={onPageChange}
              />
            </div>
          </Space>
        </Card>
      </div>
    </>
  );
}