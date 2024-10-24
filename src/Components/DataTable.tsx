import React from "react";
import { Table } from "antd";

const DataTable = ({ tableColumns, tableData }) => {
  return (
    <Table
      columns={tableColumns}
      dataSource={tableData}
      bordered
      size="small"
      tableLayout="fixed"
      pagination={false}
      rowClassName={(record) => {
        const rowValue = record[`dynamic_row_0`];
        return (
          `first-column-background-${rowValue
            ?.toString()
            .replace(/[^a-zA-Z0-9]/g, "")}` || "first-column-background-default"
        );
      }}
      scroll={{ x: "max-content", y: "calc(100vh - 100px)" }} // Horizontal and vertical scroll
    />
  );
};

export default DataTable;
