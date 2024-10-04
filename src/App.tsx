/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-lines-per-function */

import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Dropdown, Menu, Checkbox } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { MenuCard } from "./Components/MenuCard";
import "../style/styles.css";
import { DownOutlined } from "@ant-design/icons";
import {
  calculateRowsTotal,
  calculateAndFormatRowValue,
  DataType,
  customOrder,
  extractDynamicValues,
  aggregateData,
  calculateColumnWidth,
  sortByCustomOrder,
  colorMap,
  createDynamicRow,
  generateRowBackgroundColorStyles,
} from "./utils/helper";
import DataTable from "./Components/DataTable";
import { mapValuesToPriceTiers } from "./utils/dataUtils";

const App: React.FC<{
  data: any;
  options: any;
  target: any;
  host: any;
  dataView: any;
  formattingSettings: any;
}> = ({ data, formattingSettings }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<any>({});
  const [subCols, setSubCols] = useState<any>({});
  const [values, setValues] = useState<any>({});
  const [filteredDynamicValues, setFilteredDynamicValues] = useState<any[]>([]);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(
    new Set()
  );

  const [topNOn, setTopNOn] = useState([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [selectedCheckboxes1, setSelectedCheckboxes1] = useState<string[]>([]); // State for first dropdown
  const [selectedCheckboxes2, setSelectedCheckboxes2] = useState<string[]>([]); // State for second dropdown
  const [dropdownOptions, setDropdownOptions] = useState<any>([]);
  const [subcolDefination, setSubColDefination] = useState<any[]>([]);
  const formatting: any =
    formattingSettings?.conditionalformating?.conditionalformating?.value;
  const Companies: any =
    formattingSettings?.topcompanies?.topcompanies?.value || [];
  const topN = formattingSettings?.topn?.topn?.value || 0;
  const showAbsolute =
    formattingSettings?.tableSettings?.hideAbsoluteCYPY?.value;
  useEffect(() => {
    const categories = data?.categorical?.categories || [];
    const val = data?.categorical?.values || [];

    const tempRows =
      categories.filter((category) => category.source.roles.row) || [];

    val.forEach((valueRole) => {
      if (valueRole.source.roles.row) {
        if (valueRole.source.displayName === "Price Index") {
          tempRows.unshift(valueRole);
        } else {
          tempRows.push(valueRole);
        }
      }
    });

    // Set different values for each dropdown
    const dropdownOptions1 = Array.from(new Set(tempRows[2]?.values || []));
    const dropdownOptions2 = Array.from(new Set(tempRows[3]?.values || []));

    setDropdownOptions([dropdownOptions1, dropdownOptions2]); // Store different options for each dropdown
    setRows(tempRows);
    setTopNOn(
      categories.find((colRole) => colRole.source.roles.topN) ||
        val.find((valueRole) => valueRole.source.roles.topN) ||
        {}
    );

    setColumns(
      categories.find((colRole) => colRole.source.roles.col) ||
        val.find((valueRole) => valueRole.source.roles.col) ||
        {}
    );
    setSubCols(
      categories.find((subColRole) => subColRole.source.roles.subcol) ||
        val.find((valueRole) => valueRole.source.roles.subcol) ||
        {}
    );
    setValues(val.find((valueRole) => valueRole.source.roles.values) || {});
  }, [data]);

  useEffect(() => {
    if (rows.length && columns.values && values.values) {
      // Step 2: Create a value map to organize the data based on parentCol and subCol
      const valueMap = new Map<string, any[]>();
      values.values.forEach((value: any, valueIndex: number) => {
        const parentCol = columns.values[valueIndex];
        const subCol = subCols.values[valueIndex];
        const key = `${parentCol}_${subCol}`;

        if (!valueMap.has(key)) {
          valueMap.set(key, []);
        }
        if (value !== undefined) {
          valueMap.get(key)![valueIndex] = value;
        } else {
          console.warn(
            `Value is undefined for key: ${key}, valueIndex: ${valueIndex}`
          );
        }
      });
      // Step 3: Identify if there's a topN role in the rows
      let filteredTableData = [];
      filteredTableData =
        rows[0]?.values.map((_, rowIndex) => {
          const rowKey = `row_${rowIndex}`;
          const rowData: DataType = { key: rowKey };

          // Populate dynamic rows
          rows.forEach((row, rowIdx) => {
            if (rowIdx === 0) {
              rowData["Price Index"] = row.values[rowIndex];
            }
            if (rowIdx === 1) {
              rowData["TopNOn"] = topNOn.values[rowIndex];
            }
            rowData[`dynamic_row_${rowIdx}`] =
              rowIdx === 0 ? row.values[rowIndex] : row.values[rowIndex];
          });

          subCols.values.forEach((subCol, subColIndex) => {
            const parentCol = columns.values[subColIndex];

            // Generate keys for Current Year and Previous Year
            const cyKey = `Current Year_${subCol}`;
            const pyKey = `Previous Year_${subCol}`;

            // Fetch values for CY and PY from valueMap, default to 0 if not found
            rowData[cyKey] = valueMap.get(cyKey)?.[rowIndex] ?? 0;
            rowData[pyKey] = valueMap.get(pyKey)?.[rowIndex] ?? 0;

            // Calculate absolute values (CY - PY)
            const cyValue = rowData[cyKey];
            const pyValue = rowData[pyKey];
            rowData[`Absolute Values CY PY_${subCol}`] = cyValue - pyValue;

            // Map values for the current row
            const valueKey = `${parentCol}_${subCol}`;
            rowData[valueKey] = valueMap.get(valueKey)?.[rowIndex] ?? 0;
          });

          return rowData;
        }) || [];

      // Step 6: Extract dynamic values for further use
      setFilteredDynamicValues(
        extractDynamicValues(filteredTableData, formatting)
      );

      // Step 7: Aggregate data if needed
      setCombinedData(aggregateData(filteredTableData));
    }
  }, [rows, columns, subCols, values, formatting]);

  const toggleColumnCollapse = (parentCol: string) => {
    setCollapsedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentCol)) {
        newSet.delete(parentCol);
      } else {
        newSet.add(parentCol);
      }
      return newSet;
    });
  };

  const columnDefinitions = useMemo(() => {
    if (!columns.values) return [];

    const parentSubColumnMap = new Map<string, any[]>();

    // Define sub-columns for existing columns
    subCols.values.forEach((subCol, subColIndex) => {
      const parentCol = columns.values[subColIndex];
      if (!parentSubColumnMap.has(parentCol)) {
        parentSubColumnMap.set(parentCol, []);
      }

      if (
        !parentSubColumnMap.get(parentCol)?.some((col) => col.title === subCol)
      ) {
        const isGrowthColumn =
          parentCol === "% Growth (CY vs PY)" || parentCol === "CAGR";

        const subColumnDefinition = {
          title: subCol,
          dataIndex: `${parentCol}_${subCol}`,
          key: `${parentCol}_${subCol}`,
          bordered: true,
          width: calculateColumnWidth(subCol),
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#295E7E",
              color: "white",
            },
          }),
          render: (text: any, record: DataType) => {
            const isAbsoluteColumn =
              parentCol.startsWith("Absolute Values") ||
              parentCol.startsWith("Absolute Change") ||
              parentCol.startsWith("Absolute Change CY vs PY_All") ||
              parentCol.startsWith("% Growth");
            if (isAbsoluteColumn) {
              const color =
                Number(text) < 0 ? "red" : Number(text) > 0 ? "green" : "black";
              if (parentCol === "% Growth (CY vs PY)") {
                return (
                  <div style={{ color }}>{`${Number(text).toFixed(2)}%`}</div>
                );
              }

              return <div style={{ color }}>{Number(text).toFixed(2)}</div>;
            }
            if (isGrowthColumn) {
              return <div>{`${Number(text).toFixed(2)}%`}</div>;
            }

            return <div>{Number(text).toFixed(2)}</div>;
          },
        };

        setSubColDefination((prevState) => [...prevState, subColumnDefinition]);
        parentSubColumnMap.get(parentCol)?.push(subColumnDefinition);
      }
    });

    columns.values.forEach((parentCol) => {
      if (
        !parentSubColumnMap.get(parentCol)?.some((col) => col.title === "All")
      ) {
        const allSubColumnDefinition = {
          title: "All",
          dataIndex: `${parentCol}_All`,
          key: `${parentCol}_All`,
          bordered: true,
          width: calculateColumnWidth("All"),
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#295E7E",
              color: "white",
            },
          }),
          render: (text: any, record: DataType) => {
            const keys = Object.keys(record).filter((key) =>
              key.startsWith(`${parentCol}_`)
            );

            // Apply a flexible regex to match variations in parentCol
            const shouldColor =
              /^(abs[o0l]?(lut[e3])?|chang[e3]?|val[u0]?[e3]s?)/i.test(
                parentCol
              );

            const total = keys.reduce(
              (acc, key) => acc + (record[key] || 0),
              0
            );

            let color = "black"; // Default color
            if (shouldColor) {
              color = total < 0 ? "red" : total > 0 ? "green" : "black";
            }
            const isGrowthColumn =
              parentCol === "% Growth (CY vs PY)" || parentCol === "CAGR";
            if (parentCol.startsWith("% Growth")) {
              color = total < 0 ? "red" : total > 0 ? "green" : "black"; // Color based on total for growth columns
            }

            return (
              <span style={{ color }}>
                {isGrowthColumn ? `${total.toFixed(2)}%` : total.toFixed(2)}
              </span>
            );
          },
        };

        parentSubColumnMap.get(parentCol)!.unshift(allSubColumnDefinition);
      }
    });

    // Add sub-columns for "Absolute Values CY PY"
    if (showAbsolute) {
      if (!parentSubColumnMap.has("Absolute Values CY PY")) {
        parentSubColumnMap.set("Absolute Values CY PY", []);
      }

      subCols.values.forEach((subCol, subColIndex) => {
        if (
          !parentSubColumnMap
            .get("Absolute Values CY PY")
            ?.some((col) => col.title === subCol)
        ) {
          const subColumnDefinition = {
            title: subCol,
            dataIndex: `Absolute Values CY PY_${subCol}`,
            key: `Absolute Values CY PY_${subCol}`,
            bordered: true,
            width: calculateColumnWidth(subCol),
            onHeaderCell: () => ({
              style: {
                backgroundColor: "#295E7E",
                color: "white",
                whiteSpace: "nowrap",
              },
            }),
            render: (text: any, record: DataType) => {
              const color =
                Number(text) < 0 ? "red" : Number(text) > 0 ? "green" : "black";
              return <div style={{ color }}>{text.toFixed(2)}</div>;
            },
          };

          parentSubColumnMap
            .get("Absolute Values CY PY")
            ?.push(subColumnDefinition);
        }
      });
    }

    // Add "All" column for "Absolute Values CY PY"
    if (showAbsolute) {
      const allSubColumnDefinition = {
        title: "All",
        dataIndex: `Absolute Values CY PY_All`,
        key: `Absolute Values CY PY_All`,
        bordered: true,
        width: calculateColumnWidth("All"),
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#295E7E",
            color: "white",
          },
        }),
        render: (text: any, record: DataType) => {
          const keys = Object.keys(record).filter(
            (key) =>
              key.startsWith("Absolute Values CY PY_") ||
              key.startsWith("Absolute Change CY PY_") ||
              key.startsWith("Absolute Change CY vs PY_All")
          );
          const total = keys.reduce(
            (acc, key) => acc + (Number(record[key]) || 0),
            0
          );
          const color = total < 0 ? "red" : total > 0 ? "green" : "black";
          return <span style={{ color }}>{total.toFixed(2)}</span>;
        },
      };

      parentSubColumnMap
        .get("Absolute Values CY PY")
        ?.unshift(allSubColumnDefinition);
    }

    return Array.from(parentSubColumnMap.entries()).map(
      ([parentCol, subCols]) => {
        const children = collapsedColumns.has(parentCol)
          ? [
              parentSubColumnMap
                .get(parentCol)!
                .find((col) => col.title === "All"),
            ]
          : parentSubColumnMap.get(parentCol);

        return {
          title: (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Button
                size="small"
                onClick={() => toggleColumnCollapse(parentCol)}
                style={{
                  border: "none",
                  boxShadow: "none",
                  background: "none",
                  padding: "0px",
                  fontSize: "24px",
                  color: "#ffffff",
                }}
              >
                {collapsedColumns.has(parentCol) ? (
                  <PlusCircleOutlined />
                ) : (
                  <MinusCircleOutlined />
                )}
              </Button>
              {parentCol}
            </div>
          ),
          dataIndex: parentCol,
          key: parentCol,
          bordered: true,
          width: calculateColumnWidth(parentCol),
          children:
            showAbsolute ||
            !parentCol.startsWith("Absolute Values") ||
            parentCol.startsWith("Absolute Change")
              ? children
              : [],
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#295E7E",
              color: "white",
            },
          }),
        };
      }
    );
  }, [
    columns,
    subCols,
    collapsedColumns,
    filteredDynamicValues,
    formatting,
    showAbsolute,
  ]);

  const dynamicRowColumns = useMemo(() => {
    const fontStyle = "14px Arial"; // Font style for text width calculation

    // Helper function to calculate the text width using canvas
    const getTextWidth = (text: string, font: string) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        context.font = font;
        return context.measureText(text).width;
      }
      return 0;
    };

    // Function to calculate column widths dynamically based on header text
    const calculateColumnWidths = () => {
      const widths = [];
      rows.forEach((row, rowIndex) => {
        const title =
          rowIndex === 0
            ? "Price Tier"
            : row.source?.displayName || `Row ${rowIndex + 1}`;
        const width = getTextWidth(title, fontStyle); // Add more padding to the text width
        widths.push(width);
      });
      return widths;
    };

    // Calculate the widths for each column based on the header text
    const columnWidths = calculateColumnWidths();

    const columns = rows
      .filter((row) => row.source.roles.row)
      .map((row, rowIndex) => {
        const rowTotal = calculateRowsTotal(row); // Calculate total for the specific row

        return {
          title:
            rowIndex === 0
              ? "Price Tier"
              : row.source?.displayName || `Row ${rowIndex + 1}`,
          dataIndex: `dynamic_row_${rowIndex}`,
          key: `dynamic_row_${rowIndex}`,
          bordered: true,
          fixed: "left" as "left" | "right",

          width: columnWidths[rowIndex] - 100, // Use calculated width
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#295E7E",
              color: "white",
              minWidth: columnWidths[rowIndex] - 70, // Set a min-width to prevent excessive compression
              textOverflow: "ellipsis",
              whiteSpace: "wrap", // Prevent text from wrapping
            },
          }),

          render: (text: any, record: DataType) => {
            const value = typeof text === "number" ? text : null;
            return (
              <div
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  minWidth: 100, // Set min-width on cell content
                  maxWidth: 250, // Prevent excessive width
                }}
              >
                {value !== null && row?.source.displayName !== "Price Index"
                  ? calculateAndFormatRowValue(value, rowTotal) // Use helper function to format the value
                  : text}
              </div>
            );
          },
        };
      });

    return [...columns];
  }, [rows]);

  const tableColumns: ColumnsType<DataType> = useMemo(
    () => [...dynamicRowColumns, ...columnDefinitions],
    [dynamicRowColumns, columnDefinitions]
  );

  console.log(columnDefinitions, "dynamicRowColumnsdynamicRowColumns");
  console.log(
    subcolDefination,
    "subcolDefinationsubcolDefinationsubcolDefination"
  );

  const mergeRows = (data) => {
    const mergedData = {};

    data.forEach((row) => {
      // Create a unique key based on dynamic rows
      const key = `"${row.dynamic_row_1}-${row.dynamic_row_2}-${row.dynamic_row_3}"`;

      if (!mergedData[key]) {
        // Initialize if it doesn't exist
        mergedData[key] = {
          dynamic_row_0: row.dynamic_row_0 || 0, // Initialize dynamic_row_0
          dynamic_row_1: row.dynamic_row_1,
          dynamic_row_2: row.dynamic_row_2,
          dynamic_row_3: row.dynamic_row_3,
          dynamic_row_4: row.dynamic_row_4,
          dynamic_row_5: row.dynamic_row_5 || 0,
          dynamic_row_6: row.dynamic_row_6 || 0,
          "Price Index": row["Price Index"] || 0,
          "Absolute Values CY PY_All": 0, // Changed from "Absolute Change"
          "Absolute Values CY PY_MS": 0, // Changed from "Absolute Change"
          "Absolute Values CY PY_SS": 0, // Changed from "Absolute Change"
          "Absolute Values CY PY_MP": 0, // Changed from "Absolute Change"
          TopNOn: row["TopNOn"] || 0,
        };

        // Initialize aggregated values for Current Year, Previous Year, and Absolute Change using subcolDefination
        subcolDefination.forEach((col) => {
          mergedData[key][col.dataIndex] = 0;
        });
      } else {
        // Aggregate dynamic_row_0 and other non-subcolumn data
        mergedData[key]["dynamic_row_0"] += row.dynamic_row_0 || 0;
        mergedData[key]["Price Index"] += row["Price Index"] || 0;
        mergedData[key]["TopNOn"] += row.TopNOn || 0;
        mergedData[key]["dynamic_row_4"] += row.dynamic_row_4 || 0;
        mergedData[key]["dynamic_row_5"] += row.dynamic_row_5 || 0;
      }
      mergedData[key]["Absolute Values CY PY_All"] +=
        row["Absolute Values CY PY_All"] || 0;
      mergedData[key]["Absolute Values CY PY_MS"] +=
        row["Absolute Values CY PY_MS"] || 0;
      mergedData[key]["Absolute Values CY PY_SS"] +=
        row["Absolute Values CY PY_SS"] || 0;
      mergedData[key]["Absolute Values CY PY_MP"] +=
        row["Absolute Values CY PY_MP"] || 0;

      // Aggregate values for Current Year, Previous Year, and Absolute Change using subcolDefination
      subcolDefination.forEach((col) => {
        mergedData[key][col.dataIndex] += row[col.dataIndex] || 0;
      });
    });

    // Convert the merged data object back into an array
    return Object.values(mergedData);
  };

  const sortByTopN = (data) => {
    return data.sort((a, b) => {
      const aTopN = a["TopNOn"] ?? 0; // Replace with appropriate field if 'TopNOn' is different
      const bTopN = b["TopNOn"] ?? 0;
      return bTopN - aTopN; // Sorting descending by TopN
    });
  };
  const tableData = useMemo(() => {
    if (!rows.length || !columns.values) return [];
    // Step 5: Combine company data and sorted non-company data
    console.log(combinedData, "combinedDatacombinedDatacombinedData");
    const meargedData = mergeRows(combinedData);
    const processedData = meargedData.map((row) => {
      row["dynamic_row_0"] = mapValuesToPriceTiers(row["dynamic_row_0"]);
      return row;
    });
    console.log(processedData, "processedDataprocessedDataprocessedData");

    console.log(meargedData, "meargedDatameargedDatameargedDatameargedData");
    const combinedRows = processedData;

    const sortedAllTableData = sortByTopN(combinedRows);
    console.log(sortedAllTableData, "sorting as per topN");
    const allTableData = aggregateData(combinedRows);

    let filteredData = allTableData;

    const filteredDataByOptions = filteredData.filter((row) => {
      const option1Match = selectedCheckboxes1.length
        ? selectedCheckboxes1.includes(row[`dynamic_row_2`]?.toString().trim())
        : true; // If no options are selected in the first dropdown, include all rows

      const option2Match = selectedCheckboxes2.length
        ? selectedCheckboxes2.includes(row[`dynamic_row_3`]?.toString().trim())
        : true; // If no options are selected in the second dropdown, include all rows

      return option1Match && option2Match;
    });
    console.log(selectedCheckboxes2);

    const dynamicRow = createDynamicRow(
      allTableData,
      dynamicRowColumns,
      columnDefinitions
    );

    if (
      (Companies.length && selectedCheckboxes1.length) ||
      (Companies.length &&
        selectedCheckboxes2.length &&
        !Companies.length &&
        selectedCheckboxes1.length) ||
      (!Companies.length && selectedCheckboxes2.length) ||
      (selectedCheckboxes1.length === 0 && selectedCheckboxes2.length > 0)
    ) {
      console.log("if condition");
      return filteredDataByOptions;
    } else if (
      (Companies.length && !selectedCheckboxes1.length) ||
      (Companies.length && !selectedCheckboxes2.length)
    ) {
      console.log("if else condition");

      filteredData = sortedAllTableData.filter((row) => {
        if (row["Price Index"] === 0 || row["Price Index"] === null) {
          return;
        } else {
          return Companies.includes(row[`dynamic_row_2`]?.toString().trim());
        }
      });
    } else {
      if (topN > 0) {
        const aggregatedData = aggregateData(filteredDataByOptions);
        const finalTableData = aggregatedData.sort(sortByCustomOrder);

        return [...finalTableData.slice(0, topN), dynamicRow];
      } else {
        console.log("Showing all data");
        return [...filteredDataByOptions, dynamicRow]; // Return all data if topN is 0
      }
    }

    // Step 8: Filter by custom order
    const filteredDataByOrder = filteredData
      .filter((row) => {
        const rowValue = row[`dynamic_row_0`];
        if (rowValue === 0 || rowValue === null) return;
        return customOrder.includes(rowValue?.toString());
      })
      .sort(sortByCustomOrder);
    console.log(
      filteredDataByOrder,
      "filteredDataByOrderfilteredDataByOrderfilteredDataByOrder"
    );

    const remainingEntriesCount = Math.max(
      0,
      topN - filteredDataByOrder.length
    );

    const additionalEntries = sortedAllTableData
      .filter(
        (row) =>
          !Companies.includes(row[`dynamic_row_2`]?.toString().trim()) &&
          customOrder.includes(row[`dynamic_row_0`]?.toString())
      )
      .slice(0, remainingEntriesCount);
    console.log(
      additionalEntries,
      "additionalEntriesadditionalEntriesadditionalEntries"
    );

    const sortedTableData =
      sortByTopN(additionalEntries).sort(sortByCustomOrder);

    // Combine filtered data and additional entries
    const prefinalData = [...filteredDataByOrder, ...sortedTableData];

    // Aggregate and sort data (before applying checkbox filters)
    const aggregatedData = aggregateData(prefinalData);
    const finalTableData = aggregatedData.sort(sortByCustomOrder);

    return topN === 0
      ? [...finalTableData, dynamicRow]
      : [...finalTableData.slice(0, topN), dynamicRow];
  }, [
    rows,
    columns,
    topN,
    dynamicRowColumns,
    columnDefinitions,
    selectedCheckboxes1,
    selectedCheckboxes2,
    Companies, // Ensure Companies is a dependency to trigger recalculation
    customOrder, // Add customOrder as dependency
  ]);

  const sortByPriceIndex = (data) => {
    return data.sort((a, b) => {
      const aTopN = a["Price Index"] ?? 0; // Replace with appropriate field if 'TopNOn' is different
      const bTopN = b["Price Index"] ?? 0;
      return bTopN - aTopN; // Sorting descending by TopN
    });
  };
  const sortedTableData = sortByPriceIndex(tableData);
  console.log(sortedTableData, "sortedTableDatasortedTableDatasortedTableData");
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = generateRowBackgroundColorStyles(colorMap);
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [colorMap]);

  return (
    <div className="custom-table">
      <div className="custom-table-dropdown">
        <Dropdown
          getPopupContainer={
            (triggerNode) => triggerNode.parentNode as HTMLElement // Explicit cast to HTMLElement
          }
          overlay={
            <MenuCard
              selectedCheckboxes={selectedCheckboxes1}
              setSelectedCheckboxes={setSelectedCheckboxes1}
              dropdownOptions={dropdownOptions[0]} // First dropdown values
            />
          }
          trigger={["click"]}
        >
          <Button style={{ margin: "0 10px" }}>
            {rows[2]?.source?.displayName}'s <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          getPopupContainer={
            (triggerNode) => triggerNode.parentNode as HTMLElement // Explicit cast to HTMLElement
          }
          overlay={
            <MenuCard
              selectedCheckboxes={selectedCheckboxes2}
              setSelectedCheckboxes={setSelectedCheckboxes2}
              dropdownOptions={dropdownOptions[1]} // Second dropdown values
            />
          }
          trigger={["click"]}
        >
          <Button style={{ margin: "0 10px" }}>
            {rows[3]?.source?.displayName}'s <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      <div style={{ height: "90vh", overflow: "auto" }}>
        {tableData.length ? (
          <DataTable tableColumns={tableColumns} tableData={sortedTableData} />
        ) : (
          <div>No data available</div>
        )}
      </div>
    </div>
  );
};

export default App;
