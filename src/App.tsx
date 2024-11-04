/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-lines-per-function */

import React, { useState, useEffect, useMemo } from "react";
import { Button, Dropdown } from "antd";
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
  createDynamicRow,
} from "./utils/helper";
import DataTable from "./Components/DataTable";
import {
  mapValuesToPriceTiers,
  formatNumberWithCommas,
  mergeRows,
  sortByField,
} from "./utils/dataUtils";

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
  const [brandIndex, setBrandIndex] = useState([]);
  const [division, setDivision] = useState([]);
  const [volume, setVolume] = useState([]);
  const [topNOn, setTopNOn] = useState([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [selectedCheckboxes1, setSelectedCheckboxes1] = useState<string[]>([]); // State for first dropdown
  const [selectedCheckboxes2, setSelectedCheckboxes2] = useState<string[]>([]); // State for second dropdown
  const [dropdownOptions, setDropdownOptions] = useState<any>([]);
  const [subcolDefination, setSubColDefination] = useState<any[]>([]);
  const [uniqeParentCol, setUniqueParentCol] = useState<any[]>([]);
  const formatting: any =
    formattingSettings?.conditionalformating?.conditionalformating?.value;
  const Companies: any =
    formattingSettings?.topcompanies?.topcompanies?.value || [];
  const topN = formattingSettings?.topn?.topn?.value || 0;
  const showAbsolute =
    formattingSettings?.tableSettings?.hideAbsoluteCYPY?.value;
  const hideAllCol = formattingSettings?.tableSettings?.hideAllCol?.value;
  const precisonPlace =
    formattingSettings?.tableSettings?.precisonPlace?.value?.value;
  const allColumnLogic =
    formattingSettings?.tableSettings?.allColumnLogic?.value?.value;
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

    setDivision(
      categories.find((colRole) => colRole.source.roles.division) ||
        val.find((valueRole) => valueRole.source.roles.division) ||
        {}
    );
    setVolume(
      categories.find((colRole) => colRole.source.roles.volume) ||
        val.find((valueRole) => valueRole.source.roles.volume) ||
        {}
    );
    setBrandIndex(
      categories.find((colRole) => colRole.source.roles.brandIndex) ||
        val.find((valueRole) => valueRole.source.roles.brandIndex) ||
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
      const uniqueParentColSet = new Set<string>();

      filteredTableData =
        rows[0]?.values.map((_, rowIndex) => {
          const rowKey = `row_${rowIndex}`;
          const rowData: DataType = { key: rowKey };
          const parentCol = columns.values[rowIndex];
          uniqueParentColSet.add(parentCol);
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
          const divisionVal = division?.values?.[rowIndex] ?? 0;
          const volumeVal = volume?.values?.[rowIndex] ?? 0;
          const brandIndexVal = brandIndex?.values?.[rowIndex] ?? 0;
          rowData[`${parentCol}_divisionVal`] = divisionVal;
          rowData[`${parentCol}_volumeVal`] = volumeVal;
          rowData[`${parentCol}_brandIndexVal`] = brandIndexVal;

          subCols.values.forEach((subCol, subColIndex) => {
            const parentCol = columns.values[subColIndex];
            const cyKey = `Current Year_${subCol}`;
            const pyKey = `Previous Year_${subCol}`;
            rowData[cyKey] = valueMap.get(cyKey)?.[rowIndex] ?? 0;
            rowData[pyKey] = valueMap.get(pyKey)?.[rowIndex] ?? 0;
            const cyValue = rowData[cyKey];
            const pyValue = rowData[pyKey];
            rowData[`Absolute Values CY PY_${subCol}`] = cyValue - pyValue;
            const valueKey = `${parentCol}_${subCol}`;
            rowData[valueKey] = valueMap.get(valueKey)?.[rowIndex] ?? 0;
          });
          return rowData;
        }) || [];
      setUniqueParentCol(Array.from(uniqueParentColSet));

      setFilteredDynamicValues(
        extractDynamicValues(filteredTableData, formatting)
      );
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

    const sortedSubCols = [...subCols.values].sort((a, b) => {
      return b.localeCompare(a); // This sorts from Z to A
    });
    sortedSubCols.forEach((subCol, subColIndex) => {
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
              textAlign: "center",
              borderRadius: 0,
              alignItem: "center",
            },
          }),
          render: (text: any, record: DataType) => {
            if (text === null || text === undefined || text === "") {
              return <div style={{ textAlign: "center" }}> {""}</div>;
            }

            if (parentCol === "CAGR") {
              const currentYearKey = `Current Year_${subCol}`; // Dynamically fetch Current Year value
              const previousYearKey = `2PY_${subCol}`; // Dynamically fetch 2PY value
              const currentYearSales = Number(record[currentYearKey]) || 0;
              const previousYearSales = Number(record[previousYearKey]) || 0;

              if (currentYearSales === 0 || previousYearSales === 0) {
                return (
                  <div style={{ textAlign: "center" }}>
                    {(0).toFixed(precisonPlace)}
                  </div>
                ); // Handle division by zero or missing data
              }

              // Calculate result :CAGR- ((CY / 2PY) ^ 1/3) - 1
              const result =
                (currentYearSales / previousYearSales) ** 0.33333333333 - 1;
              // Format the CAGR value as a percentage with specified precision
              const formattedCAGR = `${(result * 100).toFixed(precisonPlace)}%`;

              // Return the formatted result with color coding for positive/negative growth
              return <div style={{ textAlign: "center" }}>{formattedCAGR}</div>;
            }

            const isAbsoluteColumn =
              parentCol.startsWith("Absolute Values") ||
              parentCol.startsWith("Absolute Change") ||
              parentCol.startsWith("Absolute Change CY vs PY_All") ||
              parentCol.startsWith("% Growth");

            if (isAbsoluteColumn) {
              const numericValue = Number(text);

              // Round the number to the desired precision to avoid floating-point issues
              const roundedValue = parseFloat(
                numericValue.toFixed(precisonPlace)
              );

              const color =
                numericValue < -0.0001
                  ? "red"
                  : numericValue > 0.0001
                  ? "green"
                  : "black";

              if (parentCol === "% Growth (CY vs PY)") {
                return (
                  <div style={{ color, textAlign: "center" }}>
                    {`${roundedValue.toFixed(precisonPlace)}%`}
                  </div>
                );
              }

              return (
                <div style={{ color, textAlign: "center" }}>
                  {formatNumberWithCommas(roundedValue, precisonPlace)}
                </div>
              );
            }

            if (isGrowthColumn) {
              return (
                <div style={{ textAlign: "center" }}>{`${formatNumberWithCommas(
                  Number(text),
                  precisonPlace
                )}%`}</div>
              );
            }

            return (
              <div style={{ textAlign: "center" }}>
                {formatNumberWithCommas(Number(text), precisonPlace)}
              </div>
            );
            // formatNumberWithCommas(Number(text), precisonPlace)
          },
        };
        setSubColDefination((prevState) => [...prevState, subColumnDefinition]);
        parentSubColumnMap.get(parentCol)?.push(subColumnDefinition);
      }
    });

    if (!hideAllCol) {
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
                textAlign: "center",
              },
            }),
            render: (text: any, record: DataType) => {
              if (record.key === "dynamic_row_end") {
                return <div style={{ textAlign: "center" }}>{""}</div>; // Empty string for dynamic_row_end
              }
              const keys = Object.keys(record).filter((key) => {
                // Ensure that divisionVal and volumeVal are not included in the sum
                return (
                  key.startsWith(`${parentCol}_`) &&
                  !key.endsWith("_divisionVal") &&
                  !key.endsWith("_volumeVal") &&
                  !key.endsWith("_brandIndexVal")
                );
              });
              // Apply a flexible regex to match variations in parentCol
              const shouldColor =
                /^(abs[o0l]?(lut[e3])?|chang[e3]?|val[u0]?[e3]s?)/i.test(
                  parentCol
                );
              const total = keys.reduce(
                (acc, key) => acc + (record[key] || 0),
                0
              );
              let dividedValue;

              if (parentCol !== "Absolute Change CY vs PY") {
                const divisionValue =
                  Number(record[`${parentCol}_divisionVal`]) || 1;
                const volume = Number(record[`${parentCol}_volumeVal`]) || 1;
                dividedValue = divisionValue / volume;
              } else {
                if (allColumnLogic === "division") {
                  const currentYearDivisionVal =
                    Number(record[`Current Year_divisionVal`]) || 1; // Use 1 to avoid division by 0
                  const currentYearVolume =
                    Number(record[`Current Year_volumeVal`]) || 1;

                  const previousYearDivisionVal =
                    Number(record[`Previous Year_divisionVal`]) || 1;
                  const previousYearVolume =
                    Number(record[`Previous Year_volumeVal`]) || 1;

                  // Step 1: Perform the division for both Current Year and Previous Year
                  const currentYearResult =
                    currentYearDivisionVal / currentYearVolume;
                  const previousYearResult =
                    previousYearDivisionVal / previousYearVolume;

                  // Step 2: Calculate the difference (Current Year - Previous Year)
                  const diff = currentYearResult - previousYearResult;

                  // Assign the calculated difference to dividedValue
                  // dividedValue = diff;
                  const formattedDiff = diff.toFixed(precisonPlace);
                  const color = diff < 0 ? "red" : diff > 0 ? "green" : "black";
                  return (
                    <div style={{ color, textAlign: "center" }}>
                      {formatNumberWithCommas(
                        Number(formattedDiff),
                        precisonPlace
                      )}
                    </div>
                  );
                } else if (allColumnLogic === "sum") {
                  subCols.values.forEach((subCol, subColIndex) => {
                    const currentYearTotal =
                      Number(record[`Current Year_${subCol}`]) || 0;
                    const previousYearTotal =
                      Number(record[`Previous Year_${subCol}}`]) || 0;

                    const totalDifference =
                      currentYearTotal - previousYearTotal;

                    // Assign the calculated difference to dividedValue
                    const formattedTotalDiff =
                      totalDifference.toFixed(precisonPlace);
                    const totalColor =
                      totalDifference < 0
                        ? "red"
                        : totalDifference > 0
                        ? "green"
                        : "black";

                    return (
                      <div style={{ color: totalColor, textAlign: "center" }}>
                        {formatNumberWithCommas(
                          Number(formattedTotalDiff),
                          precisonPlace
                        )}
                      </div>
                    );
                  });

                  // Calculate the difference between Current Year All and Previous Year All
                } else {
                  const formattedTotalDiff =
                    record[`${parentCol}_brandIndexVal`].toFixed(precisonPlace);
                  const totalColor =
                    formattedTotalDiff < 0
                      ? "red"
                      : formattedTotalDiff > 0
                      ? "green"
                      : "black";

                  return (
                    <div style={{ color: totalColor, textAlign: "center" }}>
                      {formatNumberWithCommas(
                        Number(formattedTotalDiff),
                        precisonPlace
                      )}
                    </div>
                  );
                }
              }

              let color = "black"; // Default color
              if (shouldColor) {
                color = total < 0 ? "red" : total > 0 ? "green" : "black";
              }
              const isGrowthColumn =
                parentCol === "% Growth (CY vs PY)" || parentCol === "CAGR";
              if (parentCol.startsWith("% Growth")) {
                color = total < 0 ? "red" : total > 0 ? "green" : "black"; // Color based on total for growth columns
              }
              if (parentCol === "% Growth (CY vs PY)") {
                // Assuming record contains values for 'Current Year' and 'Previous Year'
                let totalCurrentYearValue = 0;
                let totalPreviousYearValue = 0;

                // Ensure no double-counting, check for uniqueness if necessary
                const uniqueSubCols = [...new Set(subCols.values)]; // Ensure subCols.values are unique
                uniqueSubCols.forEach((subCol) => {
                  // Extract current year and previous year values for each sub-column
                  const currentValue = record[`Current Year_${subCol}`] || 0; // Use 0 as default if undefined
                  const previousValue = record[`Previous Year_${subCol}`] || 0; // Use 0 as default if undefined
                  totalCurrentYearValue += currentValue;
                  totalPreviousYearValue += previousValue;
                });

                // Now you can use totalCurrentYearValue and totalPreviousYearValue

                let growthPercentage = 0;
                if (totalPreviousYearValue !== 0) {
                  growthPercentage =
                    ((totalCurrentYearValue - totalPreviousYearValue) /
                      totalPreviousYearValue) *
                    100;
                }
                const color =
                  growthPercentage < 0
                    ? "red"
                    : growthPercentage > 0
                    ? "green"
                    : "black"; // Adjust the color logic

                return (
                  <div
                    style={{ color, textAlign: "center" }}
                  >{`${formatNumberWithCommas(
                    growthPercentage,
                    precisonPlace
                  )}%`}</div>
                );
              }

              if (parentCol === "CAGR") {
                let totalCurrentYearValue = 0;
                let totalPreviousYearValue = 0;

                // Ensure no double-counting by using unique sub-columns
                const uniqueSubCols = [...new Set(subCols.values)]; // Ensure subCols.values are unique

                uniqueSubCols.forEach((subCol) => {
                  // Dynamically fetch Current Year and 2PY values for each sub-column
                  const currentValue = record[`Current Year_${subCol}`] || 0; // Use 0 if undefined
                  const previousValue = record[`2PY_${subCol}`] || 0; // Use 0 if undefined
                  totalCurrentYearValue += currentValue;
                  totalPreviousYearValue += previousValue;
                });

                if (
                  totalCurrentYearValue === 0 ||
                  totalPreviousYearValue === 0 ||
                  isNaN(totalCurrentYearValue) ||
                  isNaN(totalPreviousYearValue)
                ) {
                  return (
                    <div style={{ color: "black", textAlign: "center" }}>0</div>
                  ); // Handle missing data or division by zero
                }

                // Apply the CAGR formula: CAGR - (totalCurrentYearValue / totalPreviousYearValue) ** (1/3) - 1
                // const result =
                //   Number(record[`CAGR_All`]) =

                // console.log(result, "CAGR result");

                // Format the result as a percentage with specified precision

                const result =
                  (totalCurrentYearValue / totalPreviousYearValue) **
                    0.33333333333 -
                  1;
                const formattedCAGR = `${(result * 100).toFixed(
                  precisonPlace
                )}%`;

                // Return the formatted result with color coding for positive/negative growth
                return (
                  <div style={{ textAlign: "center" }}>{formattedCAGR}</div>
                );
              }

              return (
                <div style={{ color, textAlign: "center" }}>
                  {isGrowthColumn
                    ? `${formatNumberWithCommas(
                        allColumnLogic === "normal"
                          ? record[`${parentCol}_brandIndexVal`] || 0 // Use brandIndexVal if 'normal'
                          : allColumnLogic === "division"
                          ? dividedValue
                          : total,
                        precisonPlace
                      )}%`
                    : formatNumberWithCommas(
                        allColumnLogic === "normal"
                          ? record[`${parentCol}_brandIndexVal`] || 0 // Use brandIndexVal if 'normal'
                          : allColumnLogic === "division"
                          ? dividedValue
                          : total,
                        precisonPlace
                      )}
                </div>
              );
            },
          };
          parentSubColumnMap.get(parentCol)!.unshift(allSubColumnDefinition);
        }
      });
    }

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
                textAlign: "center",
              },
            }),
            render: (text: any, record: DataType) => {
              const color =
                Number(text) < 0 ? "red" : Number(text) > 0 ? "green" : "black";
              return (
                <div style={{ color, textAlign: "center" }}>
                  {formatNumberWithCommas(Number(text), precisonPlace)}
                </div>
              );
            },
          };
          parentSubColumnMap
            .get("Absolute Values CY PY")
            ?.push(subColumnDefinition);
        }
      });
    }
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
            textAlign: "center",
          },
        }),
        render: (text: any, record: DataType) => {
          if (text === null || text === undefined || text === "") {
            return <div style={{ textAlign: "center" }}>{""}</div>; // Return empty string for missing values
          }
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
          const roundedTotal = Number(total.toFixed(precisonPlace)); // Ensure rounding to precision

          const color =
            roundedTotal < 0 ? "red" : roundedTotal > 0 ? "green" : "black";

          return (
            <div style={{ color, textAlign: "center" }}>
              {formatNumberWithCommas(total, precisonPlace)}
            </div>
          );
        },
      };
      parentSubColumnMap
        .get("Absolute Values CY PY")
        ?.unshift(allSubColumnDefinition);
    }
    return Array.from(parentSubColumnMap.entries()).map(
      ([parentCol, subCols]) => {
        const children = collapsedColumns.has(parentCol)
          ? parentSubColumnMap
              .get(parentCol)
              ?.filter((col) => col?.title === "All")
          : parentSubColumnMap.get(parentCol);
        return {
          title: (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
              }}
            >
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
    precisonPlace,
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
              alignItems: "center",

              textAlign: "center" as React.CSSProperties["textAlign"], // This will center the header text
            },
          }),

          render: (text: any, record: DataType) => {
            const value = typeof text === "number" ? text : null;
            return (
              <div
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  textAlign: "center" as React.CSSProperties["textAlign"], // This will center the header text
                  borderRadius: 0,
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
  const tableData = useMemo(() => {
    if (!rows.length || !columns.values) return [];
    // Step 5: Combine company data and sorted non-company data
    const meargedData = mergeRows(
      combinedData,
      subcolDefination,
      uniqeParentCol
    );
    const processedData = meargedData.map((row) => {
      row["dynamic_row_0"] = mapValuesToPriceTiers(row["dynamic_row_0"]);
      return row;
    });

    const combinedRows = processedData;

    const sortedAllTableData = sortByField(combinedRows, "TopNOn");

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

    const dynamicRow = createDynamicRow(
      allTableData,
      dynamicRowColumns,
      columnDefinitions
    );
    let companyFilteredData = [];

    if (
      (Companies.length && selectedCheckboxes1.length) ||
      (Companies.length &&
        selectedCheckboxes2.length &&
        !Companies.length &&
        selectedCheckboxes1.length) ||
      (!Companies.length && selectedCheckboxes2.length) ||
      (selectedCheckboxes1.length === 0 && selectedCheckboxes2.length > 0)
    ) {
      return filteredDataByOptions;
    } else if (
      (Companies.length && !selectedCheckboxes1.length) ||
      (Companies.length && !selectedCheckboxes2.length)
    ) {
      filteredData = sortedAllTableData.filter((row) => {
        if (row["Price Index"] === 0 || row["Price Index"] === null) {
          return false;
        } else {
          companyFilteredData = filteredData.filter((row) =>
            Companies.includes(row[`dynamic_row_2`]?.toString().trim())
          );
          companyFilteredData = companyFilteredData
            .sort((a, b) => b.TopNOn - a.TopNOn)
            .slice(0, topN)
            .sort((a, b) => b.TopNOn - a.TopNOn)
            .sort((a, b) => b["Price Index"] - a["Price Index"]);
        }
      });
    } else {
      if (topN > 0) {
        const aggregatedData = aggregateData(filteredDataByOptions);
        const finalTableData = aggregatedData.sort(sortByCustomOrder);

        return [...finalTableData.slice(0, topN), dynamicRow];
      } else {
        return [...filteredDataByOptions, dynamicRow]; // Return all data if topN is 0
      }
    }

    // Step 8: Filter by custom order
    const filteredDataByOrder = companyFilteredData
      .filter((row) => {
        const rowValue = row[`dynamic_row_0`];
        if (rowValue === 0 || rowValue === null) return;
        return customOrder.includes(rowValue?.toString());
      })
      .sort(sortByCustomOrder);

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

    const sortedTableData = sortByField(additionalEntries, "TopNOn").sort(
      sortByCustomOrder
    );

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
  const sortedTableData = sortByField(tableData, "Price Index");

  return (
    <div className="custom-table">
      <div className="custom-table-dropdown">
        <div className="filter-dropdown-wrapper">
          <div className="dropdown-label">{rows[2]?.source?.displayName}:</div>
          <Dropdown
            overlay={
              <MenuCard
                selectedCheckboxes={selectedCheckboxes1}
                setSelectedCheckboxes={setSelectedCheckboxes1}
                dropdownOptions={dropdownOptions[0]}
              />
            }
            trigger={["click"]}
          >
            <Button
              className="custom-dropdown-button"
              style={{
                width: "180px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              All <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <div className="filter-dropdown-wrapper">
          <div className="dropdown-label">{rows[3]?.source?.displayName}:</div>
          <Dropdown
            overlay={
              <MenuCard
                selectedCheckboxes={selectedCheckboxes2}
                setSelectedCheckboxes={setSelectedCheckboxes2}
                dropdownOptions={dropdownOptions[1]}
              />
            }
            trigger={["click"]}
          >
            <Button
              className="custom-dropdown-button"
              style={{
                width: "180px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              All <DownOutlined />
            </Button>
          </Dropdown>
        </div>
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
