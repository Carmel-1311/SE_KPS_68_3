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
} from "antd";
import dayjs from "dayjs";
import * as Icons from "lucide-react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

dayjs.locale("th");

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  updatedAt: string;
};

export default function UserIndexPage() {
  const { Title } = Typography;
  const loading = false;
  const [form] = Form.useForm();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [currentSearch, setCurrentSearch] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  // ================= MOCK DATA =================
  const mockUsers: User[] = [
    {
      id: 1,
      firstName: "สมชาย",
      lastName: "แสงดี",
      email: "somchai@test.com",
      phone: "081-234-5678",
      updatedAt: "2025-01-01",
    },
    {
      id: 2,
      firstName: "สมหญิง",
      lastName: "รักเรียน",
      email: "somying@test.com",
      phone: "089-111-2222",
      updatedAt: "2025-02-01",
    },
    {
      id: 3,
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      phone: "090-999-8888",
      updatedAt: "2025-03-01",
    },
  ];

  // ================= FILTER =================
  const filteredUsers = mockUsers.filter((u) => {
    return (
      (!currentSearch.firstName ||
        u.firstName.includes(currentSearch.firstName)) &&
      (!currentSearch.lastName || u.lastName.includes(currentSearch.lastName))
    );
  });

  const pageSize = 10;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // ================= TABLE =================
  const columns: TableProps<User>["columns"] = [
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "firstName",
      key: "firstName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "เบอร์โทรศัพท์",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "แก้ไขล่าสุด",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      sorter: (a, b) =>
        convertDateTimeToNumber(a.updatedAt) -
        convertDateTimeToNumber(b.updatedAt),
      render: (value) => convertDateTimeToBuddhist(value),
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: () => (
        <Space size="middle">
          {/* DETAIL */}
          <Tooltip title="Detail">
            <Icons.BookOpenText
              size={16}
              style={{ cursor: "pointer" }}
              onClick={() => {
                router.push(`/personnel/provider/detail`);
              }}
            />
          </Tooltip>

          {/* EDIT */}
          <Tooltip title="Edit">
            <Pencil
              size={16}
              style={{ cursor: "pointer" }}
              onClick={() => {
                router.push(`/personnel/provider/edit`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const onSearch = () => {
    setCurrentSearch({
      firstName: form.getFieldValue("firstName"),
      lastName: form.getFieldValue("lastName"),
    });
    setCurrentPage(1);
  };

  return (
    <>
      <LoadingOverlay show={loading} />

      <div style={{ padding: 10 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          <Row style={{ marginBottom: 10 }}>
            <Col span={24}>
              <Title level={4} style={{ margin: 0 }}>
                จัดการข้อมูลผู้ใช้
              </Title>
            </Col>
          </Row>

          <div>
            {/* SEARCH */}
            <Row style={{ marginBottom: "1%" }}>
              <Col span={17}>
                <Form layout="inline" form={form}>
                  <Form.Item name="firstName">
                    <Input placeholder="ชื่อ" allowClear />
                  </Form.Item>
                  <Form.Item name="lastName">
                    <Input placeholder="นามสกุล" allowClear />
                  </Form.Item>

                  <Button type="primary" onClick={onSearch}>
                    ค้นหา
                  </Button>
                </Form>
              </Col>

              <Col span={7} style={{ textAlign: "right" }}>
                <Button
                  type="primary"
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
              dataSource={paginatedUsers}
              pagination={false}
              bordered
            />

            {/* PAGINATION */}
            <Pagination
              current={currentPage}
              total={filteredUsers.length}
              pageSize={pageSize}
              onChange={onPageChange}
              style={{ marginTop: 16, textAlign: "right" }}
            />
          </div>
        </Space>
      </div>
    </>
  );
}

