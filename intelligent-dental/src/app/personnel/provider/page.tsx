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
import { usePatients } from "@/hook/usePatients";
import { useStaffs } from "@/hook/useStaffs";
import { useCompany } from "@/hook/useCompany";
import { paths } from "@/types/api";
dayjs.locale("th");

type Role = "patient" | "dentist" | "staff" | "company";


export default function UserIndexPage() {
  const { Title } = Typography;

  const router = useRouter();
  const [form] = Form.useForm();

  const [role, setRole] = useState<Role>("patient");
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_page: 1
  });

  const [currentSearch, setCurrentSearch] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const {
    patients: patients,
    loading: apiLoading,
    meta: patientsMeta,
    refresh: refreshPatients
  } = usePatients();

  const {
    staff: staff,
    loading: apiLoadingStaff,
    meta: staffMeta,
    refresh: refreshStaff
  } = useStaffs();
  const {
    company: company,
    loading: apiLoadingCompany,
    meta: companyMeta,
    refresh: refreshCompany
  } = useCompany();

const loading =
  role === "patient"
    ? apiLoading
    : role === "company"
    ? apiLoadingCompany
    : apiLoadingStaff;

    
  const loadUsers = async (selectedRole: Role) => {
    if (selectedRole === "patient") {
      setUsers(patients);
      setMeta(patientsMeta || { page: 1, limit: 10, total: patients.length, total_page: Math.ceil(patients.length / 10) });
    } else if (selectedRole === "company") {
      setUsers(company ?? []);
      setMeta(companyMeta || { page: 1, limit: 10, total: company ? company.length : 0, total_page: company ? Math.ceil(company.length / 10) : 0 });
    }
    else {
      setUsers(staff);
      setMeta(staffMeta || { page: 1, limit: 10, total: staff.length, total_page: Math.ceil(staff.length / 10) });
    }
  };

  useEffect(() => {
    loadUsers(role);
  }, [role, patients, staff, company]);

  const [searchText, setSearchText] = useState("");

  // ================= FILTER =================

  const filteredUsers = users.filter((u) => {
    if (role === "dentist" && u.role !== "dentist") return false;
    if (role === "staff" && u.role !== "staff") return false;

    if (searchText) {
      const keyword = searchText.toLowerCase();

      const name =
        role === "company"
          ? u.office_name
          : u.name;

      return name?.toLowerCase().includes(keyword);
    }

    return true;
  });

  // ================= TABLE =================
  const getColumns = (): TableProps<any>["columns"] => {
    if (role === "company") {
      return [
        {
          title: "id",
          dataIndex: "id",
        },
        {
          title: "ชื่อหน่วยงาน",
          dataIndex: "office_name",
        },
        {
          title: "อีเมล",
          dataIndex: "email",
        },
        actionColumn,
      ];
    }

    return [
      {
        title: "id",
        dataIndex: "id",
      },
      {
        title: "ชื่อ-นามสกุล",
        dataIndex: "name",
      },
      {
        title: "อีเมล",
        dataIndex: "email",
      },
      actionColumn,
    ];
  };
  const actionColumn = {
    title: "จัดการ",
    align: "center" as const,
    render: (_: any, record: any) => (
      <Space size="middle">
        <Tooltip title="Detail">
          <Icons.BookOpenText
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push(`/personnel/provider/detail/${role}/${record.id}`);
            }}
          />
        </Tooltip>

        <Tooltip title="Edit">
          <Pencil
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push(`/personnel/provider/edit/${role}/${record.id}`);
            }}
          />
        </Tooltip>
      </Space>
    ),
  };

  const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
    setMeta({ ...meta, page: pageNumber });
  };



  const onSearch = () => {
    setSearchText(form.getFieldValue("search"));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const paginatedUsers = filteredUsers.slice(
    (meta.page - 1) * meta.limit,
    meta.page * meta.limit
  );

  const canCreate = role === "patient";

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
                setMeta((prev) => ({ ...prev, page: 1 }));
                setSearchText("");
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
                  <Form.Item name="search">
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
              {canCreate && (
                <Col>
                  <Button
                    type="primary"
                    icon={<Icons.Plus size={16} />}
                    onClick={() => router.push(`/personnel/provider/new`)}
                  >
                    เพิ่มข้อมูลผู้ใช้
                  </Button>
                </Col>
              )}
            </Row>
            {/* TABLE */}

            <Table
              columns={getColumns()}
              rowKey="id"
              dataSource={paginatedUsers}
              loading={loading}
              pagination={false}
              bordered
              style={{ marginTop: 16 }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Pagination
                current={meta.page}
                total={filteredUsers.length}
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