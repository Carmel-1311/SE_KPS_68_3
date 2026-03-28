import type { TablePaginationConfig } from "antd/es/table/interface";

type TablePaginationOverrides = Partial<TablePaginationConfig>;

export function createTablePagination(
  pageSize = 10,
  overrides: TablePaginationOverrides = {}
): TablePaginationConfig {
  return {
    pageSize,
    showSizeChanger: false,
    hideOnSinglePage: true,
    responsive: true,
    position: ["bottomCenter"],
    showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
    ...overrides,
  };
}
