"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentCompanyId } from "@/mock/mockUser";
import {
    Table,
    Tag,
    Typography,
    Breadcrumb,
    Card,
    Tabs,
    message,
    Popconfirm,
    Input,
    Space,
    Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { BookOpenText, X, RotateCcw, Users, SearchCheck, House } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const { Title } = Typography;

type MobileDentalStatus =
    | "request"
    | "scheduled"
    | "request_cancel"
    | "cancel"
    | "completed";

type MobileDental = {
    mobile_dental_id: number;
    company_id: number;
    address: string;
    date: string;
    count: number;
    status: MobileDentalStatus;
};

export default function RequestsPage() {
    return (
        <Suspense fallback={<div>กำลังโหลด...</div>}>
            <RequestsPageContent />
        </Suspense>
    );
}

function RequestsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("1");

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && ["1", "2", "3"].includes(tab)) {
            setActiveTab(tab);
        }

        const highlight = searchParams.get("highlight");
        if (highlight) {
            setHighlightId(Number(highlight));
            // ล้าง highlight หลังจาก 3 วินาที
            const timer = setTimeout(() => {
                setHighlightId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const [requests, setRequests] = useState<MobileDental[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancelingId, setCancelingId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(10);
    const companyId = getCurrentCompanyId() ?? 1;

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `/api/mobile_dentals?company_id=${companyId}`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error("Fetch failed");

            const data = await res.json();
            setRequests(data.data || []);
        } catch {
            message.error("โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    const filteredRequests = useMemo(() => {
        return requests.filter((item) => {
            if (!searchText) return true;

            return (
                item.mobile_dental_id.toString().includes(searchText) ||
                item.address?.toLowerCase().includes(searchText.toLowerCase())
            );
        });
    }, [requests, searchText]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);


    useEffect(() => {
        if (highlightId && !loading) {
            // รอให้ Table render แถวเสร็จก่อน (delay สั้นๆ)
            const scrollTimer = setTimeout(() => {
                const element = document.querySelector('.row-highlight');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
            return () => clearTimeout(scrollTimer);
        }
    }, [highlightId, loading]);

    const handleCancelRequest = useCallback(async (id: number) => {
        try {
            setCancelingId(id);

            const res = await fetch(`/api/mobile_dentals/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "request_cancel" }),
            });

            if (!res.ok) throw new Error("Cancel failed");

            message.success("ส่งคำขอยกเลิกแล้ว รอผู้ดูแลระบบยืนยัน");

            await fetchRequests();
        } catch {
            message.error("ยกเลิกคำขอไม่สำเร็จ");
        } finally {
            setCancelingId(null);
        }
    }, [fetchRequests]);

    const handleUndoCancelRequest = useCallback(async (id: number) => {
        try {
            setCancelingId(id);

            const res = await fetch(`/api/mobile_dentals/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "request" }),
            });

            if (!res.ok) throw new Error("Undo cancel failed");

            message.success("ยกเลิกคำขอยกเลิกเรียบร้อยแล้ว");

            await fetchRequests();
        } catch {
            message.error("ยกเลิกคำขอยกเลิกไม่สำเร็จ");
        } finally {
            setCancelingId(null);
        }
    }, [fetchRequests]);

    const statusMap: Record<
        MobileDentalStatus,
        { color: string; text: string }
    > = useMemo(() => ({
        request: { color: "blue", text: "ส่งคำขอแล้ว" },
        scheduled: { color: "green", text: "นัดหมายแล้ว" },
        request_cancel: { color: "orange", text: "แจ้งขอยกเลิก" },
        cancel: { color: "red", text: "ยกเลิกแล้ว" },
        completed: { color: "default", text: "เสร็จสิ้น" },
    }), []);

    const columns: ColumnsType<MobileDental> = useMemo(() => [
        {
            title: "รหัสคำขอ",
            dataIndex: "mobile_dental_id",
            key: "mobile_dental_id",
            width: 100,
        },
        {
            title: "สถานที่ขอบริการ",
            dataIndex: "address",
            key: "address",
            render: (address: string) => (
                <Typography.Text>{address || "-"}</Typography.Text>
            ),
        },
        {
            title: "วันที่รับบริการ",
            dataIndex: "date",
            key: "date",
            width: 120,
        },
        {
            title: "ผู้รับบริการ (คน)",
            dataIndex: "count",
            key: "count",
            width: 150,
            align: "center",
        },
        {
            title: "สถานะ",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status: MobileDentalStatus) => {
                const s = statusMap[status] || { color: "default", text: status };
                return <Tag color={s.color}>{s.text.toUpperCase()}</Tag>;
            },
        },
        {
            title: "จัดการ",
            key: "action",
            width: 250,
            align: "center",
            render: (_, record) => {
                if (record.status === "cancel") return null;

                if (record.status === "request_cancel") {
                    return (
                        <Space size="middle">
                            <Popconfirm
                                title="ยืนยันการยกเลิกคำขอยกเลิก"
                                description="ต้องการยกเลิกคำขอยกเลิกนี้ใช่หรือไม่?"
                                okText="ยืนยัน"
                                cancelText="ไม่"
                                onConfirm={() =>
                                    handleUndoCancelRequest(record.mobile_dental_id)
                                }
                            >
                                <Tooltip title="ยกเลิกคำขอยกเลิก">
                                    {cancelingId === record.mobile_dental_id ? (
                                        <RotateCcw size={18} style={{ opacity: 0.5 }} />
                                    ) : (
                                        <RotateCcw size={18} style={{ cursor: "pointer", color: "#1890ff" }} />
                                    )}
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    );
                }

                if (record.status === "request") {
                    return (
                        <Space size="middle">
                            <Tooltip title="รอการนัดหมาย">
                                <BookOpenText size={18} style={{ cursor: "not-allowed", color: "#ccc" }} />
                            </Tooltip>

                            <Popconfirm
                                title="ยืนยันการยกเลิก"
                                okText="ยืนยัน"
                                cancelText="ยกเลิก"
                                onConfirm={() =>
                                    handleCancelRequest(record.mobile_dental_id)
                                }
                            >
                                <Tooltip title="ยกเลิกคำขอ">
                                    {cancelingId === record.mobile_dental_id ? (
                                        <X size={18} style={{ opacity: 0.5 }} />
                                    ) : (
                                        <X size={18} style={{ cursor: "pointer", color: "#ff4d4f" }} />
                                    )}
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    );
                }

                if (record.status === "scheduled") {
                    return (
                        <Space size="middle">
                            <Tooltip title="ส่งรายชื่อผู้รับบริการ">
                                <Users
                                    size={18}
                                    style={{ cursor: "pointer", color: "#1890ff" }}
                                    onClick={() =>
                                        router.push(
                                            `/company/status/${record.mobile_dental_id}/patients`
                                        )
                                    }
                                />
                            </Tooltip>
                        </Space>
                    );
                }

                return (
                    <Space size="middle">
                        <Tooltip title="ดูรายชื่อ">
                            <BookOpenText
                                size={18}
                                style={{ cursor: "pointer", color: "#1890ff" }}
                                onClick={() =>
                                    router.push(
                                        `/company/status/${record.mobile_dental_id}/patients`
                                    )
                                }
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ], [statusMap, router, cancelingId, handleUndoCancelRequest, handleCancelRequest]);

    const pendingRequests = useMemo(() => filteredRequests.filter(
        (d) => d.status === "request" || d.status === "request_cancel"
    ), [filteredRequests]);

    const scheduledRequests = useMemo(() => filteredRequests.filter(
        (d) => d.status === "scheduled"
    ), [filteredRequests]);

    const otherRequests = useMemo(() => filteredRequests.filter(
        (d) =>
            d.status === "cancel" ||
            d.status === "completed"
    ), [filteredRequests]);

    return (
        <div style={{ padding: 24 }}>
            <style jsx global>{`
                @keyframes highlight-fade {
                    0% { transform: scale(1); background-color: #fffbe6; }
                    50% { transform: scale(1.02); background-color: #fff1b8; }
                    100% { transform: scale(1); background-color: transparent; }
                }
                .row-highlight {
                    animation: highlight-fade 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    box-shadow: 0 0 15px rgba(255, 214, 102, 0.5);
                    z-index: 10;
                    position: relative;
                    will-change: transform, background-color;
                }
            `}</style>
            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={[
                    {
                        title: (
                            <Link href="/company" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit' }}>
                                <House size={16} />
                                <span>หน้าหลัก</span>
                            </Link>
                        ),
                    },
                    {
                        title: (
                            <Space size={8}>
                                <SearchCheck size={16} />
                                <span>ตรวจสอบสถานะ</span>
                            </Space>
                        ),
                    },
                ]}
            />

            <Card
                title={
                    <Title level={3} style={{ margin: 0 }}>
                        ตรวจสอบสถานะการรับบริการออกหน่วย
                    </Title>
                }
                extra={
                    <Input
                        placeholder="ค้นหาด้วยรหัสคำขอ หรือ สถานที่"
                        allowClear
                        style={{ width: 250 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                }
                variant="borderless"
                style={{ borderRadius: 12 }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: "1",
                            label: "รอดำเนินการ",
                            children: (
                                <Table
                                    loading={loading}
                                    dataSource={pendingRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{
                                        pageSize: pageSize,
                                        showSizeChanger: true,
                                        pageSizeOptions: ["10", "15", "20", "50", "100"],
                                        onShowSizeChange: (_, size) => setPageSize(size),
                                    }}
                                    sticky={{ offsetHeader: 1 }}
                                    rowClassName={(record) =>
                                        record.mobile_dental_id === highlightId ? 'row-highlight' : ''
                                    }
                                />
                            ),
                        },
                        {
                            key: "2",
                            label: "นัดหมายแล้ว",
                            children: (
                                <Table
                                    loading={loading}
                                    dataSource={scheduledRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{
                                        pageSize: pageSize,
                                        showSizeChanger: true,
                                        pageSizeOptions: ["10", "20", "50", "100"],
                                        onShowSizeChange: (_, size) => setPageSize(size),
                                    }}
                                    sticky={{ offsetHeader: 1 }}
                                    rowClassName={(record) =>
                                        record.mobile_dental_id === highlightId ? 'row-highlight' : ''
                                    }
                                />
                            ),
                        },
                        {
                            key: "3",
                            label: "ประวัติอื่นๆ"
                            ,
                            children: (
                                <Table
                                    loading={loading}
                                    dataSource={otherRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{
                                        pageSize: pageSize,
                                        showSizeChanger: true,
                                        pageSizeOptions: ["10", "20", "50", "100"],
                                        onShowSizeChange: (_, size) => setPageSize(size),
                                    }}
                                    sticky={{ offsetHeader: 1 }}
                                    rowClassName={(record) =>
                                        record.mobile_dental_id === highlightId ? 'row-highlight' : ''
                                    }
                                />
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
}