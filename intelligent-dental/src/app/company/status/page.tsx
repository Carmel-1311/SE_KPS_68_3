"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import {
    Table,
    Tag,
    Typography,
    Breadcrumb,
    Card,
    Tabs,
    Popconfirm,
    Input,
    Space,
    Tooltip,
    Alert,
} from "antd";
const { Title } = Typography;
import type { ColumnsType } from "antd/es/table";
import { BookOpenText, X, RotateCcw, Users, SearchCheck, House } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { MobileDental, MobileDentalStatus } from "@/hook/useMobileDentals";
import { useAllMobileDentals } from "@/hook/useAllMobileDentals";
import { useMobileDentalActions } from "@/hook/useMobileDentalActions";
import { createTablePagination } from "@/app/utils/tablePagination";

const VALID_TABS = new Set(["1", "2", "3"]);
const PAGE_SIZE = 10;
type SearchParamsLike = { get: (key: string) => string | null };

function getActiveTab(params: SearchParamsLike) {
    const tab = params.get("tab");
    return tab && VALID_TABS.has(tab) ? tab : "1";
}

function getHighlightId(params: SearchParamsLike): number | null {
    const raw = params.get("highlight");
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

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
    const activeTab = getActiveTab(searchParams);
    const highlightId = getHighlightId(searchParams);

    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [clientPage, setClientPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchText(searchText), 300);
        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        const timer = setTimeout(() => setClientPage(1), 0);
        return () => clearTimeout(timer);
    }, [activeTab, debouncedSearchText]);

    useEffect(() => {
        if (!highlightId) return;

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("highlight");
            router.replace(`?${params.toString()}`, { scroll: false });
        }, 3000);

        return () => clearTimeout(timer);
    }, [highlightId, searchParams, router]);

    const {
        data: requests,
        loading,
        isFetching,
        refresh: fetchRequests,
        error,
        updateLocalItem,
        isTruncated,
    } = useAllMobileDentals();

    const { updateStatus, updatingIds } = useMobileDentalActions();

    const handleTabChange = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", key);
        params.delete("highlight");
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((item) => {
            if (!debouncedSearchText) return true;

            const lowerSearch = debouncedSearchText.toLowerCase();
            return (
                item.mobile_dental_id.toString().includes(lowerSearch) ||
                item.address?.toLowerCase().includes(lowerSearch)
            );
        });
    }, [requests, debouncedSearchText]);

    const pendingRequests = useMemo(
        () => filteredRequests.filter((r) => r.status === "request" || r.status === "request_cancel"),
        [filteredRequests]
    );

    const scheduledRequests = useMemo(
        () => filteredRequests.filter((r) => r.status === "scheduled"),
        [filteredRequests]
    );

    const otherRequests = useMemo(
        () => filteredRequests.filter((r) => r.status === "completed" || r.status === "cancel"),
        [filteredRequests]
    );

    useEffect(() => {
        let maxPage = 1;
        if (activeTab === "1") maxPage = Math.max(1, Math.ceil(pendingRequests.length / PAGE_SIZE));
        if (activeTab === "2") maxPage = Math.max(1, Math.ceil(scheduledRequests.length / PAGE_SIZE));
        if (activeTab === "3") maxPage = Math.max(1, Math.ceil(otherRequests.length / PAGE_SIZE));

        if (clientPage > maxPage) {
            const timer = setTimeout(() => setClientPage(maxPage), 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab, pendingRequests.length, scheduledRequests.length, otherRequests.length, clientPage]);

    useEffect(() => {
        if (!highlightId || loading) return;

        const scrollTimer = setTimeout(() => {
            const element = document.querySelector(".row-highlight");
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 500);

        return () => clearTimeout(scrollTimer);
    }, [highlightId, loading]);

    const handleCancelRequest = useCallback(
        async (record: MobileDental) => {
            const id = record.mobile_dental_id;
            await updateStatus(id, { company: record.company, status: "request_cancel" }, () => {
                updateLocalItem(id, { status: "request_cancel" });
                void fetchRequests();
            });
        },
        [updateStatus, updateLocalItem, fetchRequests]
    );

    const handleUndoCancelRequest = useCallback(
        async (record: MobileDental) => {
            const id = record.mobile_dental_id;
            await updateStatus(id, { company: record.company, status: "request" }, () => {
                updateLocalItem(id, { status: "request" });
                void fetchRequests();
            });
        },
        [updateStatus, updateLocalItem, fetchRequests]
    );

    const statusMap: Record<MobileDentalStatus, { color: string; text: string }> = useMemo(
        () => ({
            request: { color: "blue", text: "ส่งคำขอแล้ว" },
            scheduled: { color: "green", text: "นัดหมายแล้ว" },
            request_cancel: { color: "orange", text: "แจ้งขอยกเลิก" },
            cancel: { color: "red", text: "ยกเลิกแล้ว" },
            completed: { color: "default", text: "เสร็จสิ้น" },
        }),
        []
    );

    const columns: ColumnsType<MobileDental> = useMemo(
        () => [
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
                render: (address: string) => <Typography.Text>{address || "-"}</Typography.Text>,
            },
            {
                title: "วันที่รับบริการ",
                dataIndex: "date",
                key: "date",
                width: 150,
                render: (value?: string) => {
                    if (!value) return "-";
                    const dateObj = new Date(value);
                    if (Number.isNaN(dateObj.getTime())) return "-";
                    return dateObj.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
                },
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
                                    onConfirm={() => handleUndoCancelRequest(record)}
                                >
                                    <Tooltip title="ยกเลิกคำขอยกเลิก">
                                        {updatingIds.includes(record.mobile_dental_id) ? (
                                            <RotateCcw size={18} style={{ opacity: 0.5 }} className="animate-spin" />
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
                                    onConfirm={() => handleCancelRequest(record)}
                                >
                                    <Tooltip title="ยกเลิกคำขอ">
                                        {updatingIds.includes(record.mobile_dental_id) ? (
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
                                            router.push(`/company/status/${record.mobile_dental_id}/patients`)
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
                                        router.push(`/company/status/${record.mobile_dental_id}/patients`)
                                    }
                                />
                            </Tooltip>
                        </Space>
                    );
                },
            },
        ],
        [statusMap, router, updatingIds, handleUndoCancelRequest, handleCancelRequest]
    );

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
                            <Link href="/company" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "inherit" }}>
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
                {error && (
                    <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
                )}
                {isTruncated && (
                    <Alert
                        message="แจ้งเตือนข้อมูลทะลุขีดจำกัด: ระบบกำลังแสดงผลเพียง 3000 รายการล่าสุด"
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={[
                        {
                            key: "1",
                            label: "รอดำเนินการ",
                            children: (
                                <Table
                                    loading={loading || isFetching}
                                    dataSource={pendingRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{
                                        ...createTablePagination(PAGE_SIZE),
                                        current: clientPage,
                                        total: pendingRequests.length,
                                        onChange: (p) => setClientPage(p),
                                    }}
                                    sticky={{ offsetHeader: 1 }}
                                    rowClassName={(record) =>
                                        record.mobile_dental_id === highlightId ? "row-highlight" : ""
                                    }
                                />
                            ),
                        },
                        {
                            key: "2",
                            label: "นัดหมายแล้ว",
                            children: (
                                <Table
                                    loading={loading || isFetching}
                                    dataSource={scheduledRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{
                                        ...createTablePagination(PAGE_SIZE),
                                        current: clientPage,
                                        total: scheduledRequests.length,
                                        onChange: (p) => setClientPage(p),
                                    }}
                                    sticky={{ offsetHeader: 1 }}
                                    rowClassName={(record) =>
                                        record.mobile_dental_id === highlightId ? "row-highlight" : ""
                                    }
                                />
                            ),
                        },
                        {
                            key: "3",
                            label: "ประวัติอื่นๆ",
                            children: (
                                <Table
                                    loading={loading || isFetching}
                                    dataSource={otherRequests}
                                    columns={columns}
                                    rowKey="mobile_dental_id"
                                    pagination={{
                                        ...createTablePagination(PAGE_SIZE),
                                        current: clientPage,
                                        total: otherRequests.length,
                                        onChange: (p) => setClientPage(p),
                                    }}
                                    sticky={{ offsetHeader: 1 }}
                                    rowClassName={(record) =>
                                        record.mobile_dental_id === highlightId ? "row-highlight" : ""
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
