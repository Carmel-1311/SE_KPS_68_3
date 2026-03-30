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
    Badge,
    Grid,
    Row,
    Col,
    Pagination,
} from "antd";
const { Title } = Typography;
import { SearchOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
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

const ActionBtn = React.forwardRef<HTMLDivElement, { children: React.ReactNode; bg?: string; disabled?: boolean; onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void }> (
    ({ children, bg, disabled, onClick, ...props }, ref) => (
    <div 
        ref={ref}
        {...props}
        onClick={disabled ? undefined : onClick}
        style={{
        width: 34, height: 34, borderRadius: 10,
        background: disabled ? "#f5f5f5" : (bg || "#f0f5ff"),
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s, transform 0.15s",
    }}>
        {children}
    </div>
));
ActionBtn.displayName = "ActionBtn";

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
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
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

    const statusMap: Record<MobileDentalStatus, { color: string; text: string; icon?: React.ReactNode }> = useMemo(
        () => ({
            request: { color: "gold", text: "รอดำเนินการ", icon: <SyncOutlined spin /> },
            scheduled: { color: "green", text: "นัดหมายแล้ว", icon: <ClockCircleOutlined /> },
            request_cancel: { color: "volcano", text: "แจ้งขอยกเลิก", icon: <ExclamationCircleOutlined /> },
            cancel: { color: "default", text: "ยกเลิกแล้ว", icon: <CloseCircleOutlined /> },
            completed: { color: "default", text: "เสร็จสิ้น", icon: <CheckCircleOutlined /> },
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
                sorter: (a, b) => a.mobile_dental_id - b.mobile_dental_id,
                defaultSortOrder: 'descend',
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
                sorter: (a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateA - dateB;
                },
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
                sorter: (a, b) => (a.count ?? 0) - (b.count ?? 0),
            },
            {
                title: "สถานะ",
                dataIndex: "status",
                key: "status",
                width: 150,
                sorter: (a, b) => {
                    const statusOrder: Record<MobileDentalStatus, number> = {
                        request: 1,
                        request_cancel: 2,
                        scheduled: 3,
                        completed: 4,
                        cancel: 5,
                    };
                    return statusOrder[a.status] - statusOrder[b.status];
                },
                render: (status: MobileDentalStatus) => {
                    const s = statusMap[status] || { color: "default", text: status };
                    return <Tag color={s.color} style={{ borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {s.icon}
                        {s.text.toUpperCase()}
                    </Tag>;
                },
            },
            {
                title: "จัดการ",
                key: "action",
                width: 140,
                align: "center",
                render: (_, record) => {
                    if (record.status === "cancel") return null;

                    if (record.status === "request_cancel") {
                        return (
                            <Space size={8}>
                                <Popconfirm title="ยืนยันการยกเลิกคำขอยกเลิก" description="ต้องการยกเลิกคำขอยกเลิกนี้ใช่หรือไม่?" okText="ยืนยัน" cancelText="ไม่" onConfirm={() => handleUndoCancelRequest(record)}>
                                    <Tooltip title="ยกเลิกคำขอยกเลิก">
                                        <ActionBtn bg="#e6f4ff" disabled={updatingIds.includes(record.mobile_dental_id)}>
                                            {updatingIds.includes(record.mobile_dental_id) ? (
                                                <RotateCcw size={16} style={{ opacity: 0.5, color: "#1677ff" }} className="animate-spin" />
                                            ) : (
                                                <RotateCcw size={16} style={{ color: "#1677ff" }} />
                                            )}
                                        </ActionBtn>
                                    </Tooltip>
                                </Popconfirm>
                            </Space>
                        );
                    }

                    if (record.status === "request") {
                        return (
                            <Space size={8}>
                                <Tooltip title="รอการนัดหมาย">
                                    <ActionBtn bg="#f5f5f5" disabled>
                                        <BookOpenText size={16} style={{ color: "#d9d9d9" }} />
                                    </ActionBtn>
                                </Tooltip>
                                <Popconfirm title="ยืนยันการยกเลิก" okText="ยืนยัน" cancelText="ยกเลิก" onConfirm={() => handleCancelRequest(record)}>
                                    <Tooltip title="ยกเลิกคำขอ">
                                        <ActionBtn bg="#f5f5f5" disabled={updatingIds.includes(record.mobile_dental_id)}>
                                            <X size={16} style={{ color: updatingIds.includes(record.mobile_dental_id) ? "#d9d9d9" : "#ff4d4f" }} />
                                        </ActionBtn>
                                    </Tooltip>
                                </Popconfirm>
                            </Space>
                        );
                    }

                    if (record.status === "scheduled") {
                        return (
                            <Space size={8}>
                                <Tooltip title="ส่งรายชื่อผู้รับบริการ">
                                    <ActionBtn bg="#e6f4ff" onClick={() => router.push(`/company/status/${record.mobile_dental_id}/patients`)}>
                                        <Users size={16} style={{ color: "#1677ff" }} />
                                    </ActionBtn>
                                </Tooltip>
                            </Space>
                        );
                    }

                    return (
                        <Space size={8}>
                            <Tooltip title="ดูรายชื่อ">
                                <ActionBtn bg="#e6f4ff" onClick={() => router.push(`/company/status/${record.mobile_dental_id}/patients`)}>
                                    <BookOpenText size={16} style={{ color: "#1677ff" }} />
                                </ActionBtn>
                            </Tooltip>
                        </Space>
                    );
                },
            },
        ],
        [statusMap, router, updatingIds, handleUndoCancelRequest, handleCancelRequest]
    );

    const getPagedData = useCallback(
        (items: MobileDental[]) => items.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE),
        [clientPage]
    );

    const renderActionContent = useCallback((record: MobileDental) => {
        if (record.status === "cancel") return null;

        if (record.status === "request_cancel") {
            return (
                <Popconfirm title="à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸¢à¸à¹€à¸¥à¸´à¸à¸„à¸³à¸‚à¸­à¸¢à¸à¹€à¸¥à¸´à¸" description="à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸¢à¸à¹€à¸¥à¸´à¸à¸„à¸³à¸‚à¸­à¸¢à¸à¹€à¸¥à¸´à¸à¸™à¸µà¹‰à¹ƒà¸Šà¹ˆà¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ?" okText="à¸¢à¸·à¸™à¸¢à¸±à¸™" cancelText="à¹„à¸¡à¹ˆ" onConfirm={() => handleUndoCancelRequest(record)}>
                    <ActionBtn bg="#e6f4ff" disabled={updatingIds.includes(record.mobile_dental_id)}>
                        {updatingIds.includes(record.mobile_dental_id) ? (
                            <RotateCcw size={16} style={{ opacity: 0.5, color: "#1677ff" }} className="animate-spin" />
                        ) : (
                            <RotateCcw size={16} style={{ color: "#1677ff" }} />
                        )}
                    </ActionBtn>
                </Popconfirm>
            );
        }

        if (record.status === "request") {
            return (
                <Space size={8}>
                    <Tooltip title="à¸£à¸­à¸à¸²à¸£à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢">
                        <ActionBtn bg="#f5f5f5" disabled>
                            <BookOpenText size={16} style={{ color: "#d9d9d9" }} />
                        </ActionBtn>
                    </Tooltip>
                    <Popconfirm title="à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸¢à¸à¹€à¸¥à¸´à¸" okText="à¸¢à¸·à¸™à¸¢à¸±à¸™" cancelText="à¸¢à¸à¹€à¸¥à¸´à¸" onConfirm={() => handleCancelRequest(record)}>
                        <Tooltip title="à¸¢à¸à¹€à¸¥à¸´à¸à¸„à¸³à¸‚à¸­">
                            <ActionBtn bg="#f5f5f5" disabled={updatingIds.includes(record.mobile_dental_id)}>
                                <X size={16} style={{ color: updatingIds.includes(record.mobile_dental_id) ? "#d9d9d9" : "#ff4d4f" }} />
                            </ActionBtn>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            );
        }

        if (record.status === "scheduled") {
            return (
                <Tooltip title="à¸ªà¹ˆà¸‡à¸£à¸²à¸¢à¸Šà¸·à¹ˆà¸­à¸œà¸¹à¹‰à¸£à¸±à¸šà¸šà¸£à¸´à¸à¸²à¸£">
                    <ActionBtn bg="#e6f4ff" onClick={() => router.push(`/company/status/${record.mobile_dental_id}/patients`)}>
                        <Users size={16} style={{ color: "#1677ff" }} />
                    </ActionBtn>
                </Tooltip>
            );
        }

        return (
            <Tooltip title="à¸”à¸¹à¸£à¸²à¸¢à¸Šà¸·à¹ˆà¸­">
                <ActionBtn bg="#e6f4ff" onClick={() => router.push(`/company/status/${record.mobile_dental_id}/patients`)}>
                    <BookOpenText size={16} style={{ color: "#1677ff" }} />
                </ActionBtn>
            </Tooltip>
        );
    }, [handleCancelRequest, handleUndoCancelRequest, router, updatingIds]);

    const renderMobileCards = useCallback((items: MobileDental[]) => {
        const pageItems = getPagedData(items);

        return (
            <Space direction="vertical" size={12} style={{ display: "flex" }}>
                {pageItems.map((record) => {
                    const s = statusMap[record.status] || { color: "default", text: record.status };
                    const isHighlighted = record.mobile_dental_id === highlightId;

                    return (
                        <Card
                            key={record.mobile_dental_id}
                            size="small"
                            className={isHighlighted ? "row-highlight" : undefined}
                            style={{ borderRadius: 12, borderColor: isHighlighted ? "#ffd666" : undefined }}
                        >
                            <Space direction="vertical" size={12} style={{ display: "flex" }}>
                                <Space style={{ justifyContent: "space-between", width: "100%" }} align="start">
                                    <Typography.Text strong style={{ fontSize: 16 }}>
                                        #{record.mobile_dental_id}
                                    </Typography.Text>
                                    <Tag color={s.color} style={{ borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 4, marginInlineEnd: 0 }}>
                                        {s.icon}
                                        {s.text.toUpperCase()}
                                    </Tag>
                                </Space>
                                <div>
                                    <Typography.Text type="secondary">สถานที่บริการ</Typography.Text>
                                    <div>{record.address || "-"}</div>
                                </div>
                                <Row gutter={[12, 12]}>
                                    <Col span={12}>
                                        <Typography.Text type="secondary">วันที่รับบริการ</Typography.Text>
                                        <div>
                                            {record.date
                                                ? new Date(record.date).toLocaleDateString("th-TH", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                                : "-"}
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <Typography.Text type="secondary">ผู้รับบริการ</Typography.Text>
                                        <div>{record.count ?? "-"}</div>
                                    </Col>
                                </Row>
                                {renderActionContent(record) && (
                                    <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                                        {renderActionContent(record)}
                                    </Space>
                                )}
                            </Space>
                        </Card>
                    );
                })}
                {items.length > PAGE_SIZE && (
                    <Pagination
                        align="center"
                        current={clientPage}
                        pageSize={PAGE_SIZE}
                        total={items.length}
                        onChange={(page) => setClientPage(page)}
                        size="small"
                    />
                )}
            </Space>
        );
    }, [clientPage, getPagedData, highlightId, renderActionContent, statusMap]);

    return (
        <div style={{ padding: isMobile ? 16 : 24 }}>
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
                style={{ marginBottom: 24 }}
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
                variant="borderless"
                style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
                styles={{ body: { padding: isMobile ? 16 : '24px 32px' }, header: { padding: isMobile ? 16 : '24px 32px' } }}
                extra={
                    <div style={{ width: isMobile ? "100%" : "auto", marginTop: isMobile ? 12 : 0 }}>
                    <Input
                        placeholder="ค้นหาด้วยรหัสคำขอ หรือ สถานที่"
                        allowClear
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: isMobile ? "100%" : 280 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    </div>
                }
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
                            label: <Space size={4}>รอดำเนินการ <Badge count={pendingRequests.length} style={{ backgroundColor: '#ffc53d' }} overflowCount={999} /></Space>,
                            children: isMobile ? (
                                renderMobileCards(pendingRequests)
                            ) : (
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
                                    style={{ borderRadius: 12, overflow: 'hidden' }}
                                    components={{
                                        header: {
                                            cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} style={{ ...props.style, background: '#fafafa', fontWeight: 600, color: '#262626' }} />
                                        }
                                    }}
                                    rowClassName={(record) =>
                                        `${record.mobile_dental_id === highlightId ? "row-highlight " : ""}hover:bg-gray-50 transition-colors`
                                    }
                                />
                            ),
                        },
                        {
                            key: "2",
                            label: <Space size={4}>นัดหมายแล้ว <Badge count={scheduledRequests.length} style={{ backgroundColor: '#73d13d' }} overflowCount={999} /></Space>,
                            children: isMobile ? (
                                renderMobileCards(scheduledRequests)
                            ) : (
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
                                    style={{ borderRadius: 12, overflow: 'hidden' }}
                                    components={{
                                        header: {
                                            cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} style={{ ...props.style, background: '#fafafa', fontWeight: 600, color: '#262626' }} />
                                        }
                                    }}
                                    rowClassName={(record) =>
                                        `${record.mobile_dental_id === highlightId ? "row-highlight " : ""}hover:bg-gray-50 transition-colors`
                                    }
                                />
                            ),
                        },
                        {
                            key: "3",
                            label: <Space size={4}>ประวัติอื่นๆ <Badge count={otherRequests.length} style={{ backgroundColor: '#8c8c8c' }} overflowCount={999} /></Space>,
                            children: isMobile ? (
                                renderMobileCards(otherRequests)
                            ) : (
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
                                    style={{ borderRadius: 12, overflow: 'hidden' }}
                                    components={{
                                        header: {
                                            cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} style={{ ...props.style, background: '#fafafa', fontWeight: 600, color: '#262626' }} />
                                        }
                                    }}
                                    rowClassName={(record) =>
                                        `${record.mobile_dental_id === highlightId ? "row-highlight " : ""}hover:bg-gray-50 transition-colors`
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
