/* eslint-disable max-lines-per-function */
import React, { useEffect } from "react";
import { Table } from "antd";
import {
  generateRowBackgroundColorStyles,
  colorMap,
  borderColorMap,
} from "../utils/helper";
import { lineHeight } from "@mui/system";
const DataTable = ({ tableColumns, tableData }) => {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = generateRowBackgroundColorStyles(
      colorMap,
      borderColorMap
    );
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Helper function to calculate row spans for the first column
  const calculateRowSpan = (data, key) => {
    const rowSpanMap = {};
    let spanCount = 1;

    data.forEach((record, index) => {
      if (index === 0) {
        rowSpanMap[index] = spanCount;
      } else {
        const prevValue = data[index - 1][key];
        const currentValue = record[key];

        if (currentValue === prevValue) {
          spanCount += 1;
          rowSpanMap[index - spanCount + 1] = spanCount;
          rowSpanMap[index] = 0;
        } else {
          spanCount = 1;
          rowSpanMap[index] = spanCount;
        }
      }
    });

    return rowSpanMap;
  };

  const firstColumnKey = "dynamic_row_0";
  const rowSpanMap = calculateRowSpan(tableData, firstColumnKey);
  console.log(rowSpanMap);

  const columnsWithRowSpan = tableColumns.map((col, index) => {
    // Check if it's the first column to apply custom rendering
    if (index === 0) {
      return {
        ...col,
        render: (text, record, rowIndex) => {
          // Determine row span, background color, and border color
          const rowSpan = rowSpanMap[rowIndex];
          const cellColor = colorMap[record[firstColumnKey]]; // Get cell color based on record value
          const defaultColor = "transparent"; // Get border color based on record value

          return {
            children: text,
            props: {
              rowSpan,
              style: {
                backgroundColor: rowSpan > 0 ? cellColor : defaultColor, // Use border color for non-rowspanned rows
                borderBottom: 0,
                color: "#fff",
                textAlign: "center",
                padding: 0,
                margin: 0,
                lineHeight: "0.9px",
              },
            },
          };
        },
      };
    }
    return col;
  });

  return (
    <Table
      className="custom-table" // Add a custom class here
      columns={columnsWithRowSpan}
      dataSource={tableData}
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
      scroll={{ x: "max-content", y: "calc(100vh - 1px)" }} // Horizontal and vertical scroll
    />
  );
};

export default DataTable;
