interface Row {
  source: {
    value?: unknown; // Use unknown to account for both numbers and strings
    displayName?: string;
    roles: {
      row: boolean;
    };
  };
  values: number[]; // Added values array
}

// Utility function to check if a value is numeric
const isNumeric = (value: any): boolean =>
  !isNaN(parseFloat(value)) && isFinite(value);

// Function to calculate the total of numeric values across all rows

export const calculateRowsTotal = (row: Row): number => {
  return row.values
    .filter(isNumeric) // Filter out only numeric values
    .reduce((sum, val) => sum + Number(val), 0); // Cast each value to a number and sum them
};

export const calculateAndFormatRowValue = (
  value: number,
  rowsTotal: number
): string => {
  if (rowsTotal > 0) {
    const percentage = (value / rowsTotal) * 100;

    const formattedPercentage = percentage.toFixed(1);

    const finalPercentage = Math.min(
      parseFloat(formattedPercentage),
      100
    ).toFixed(1);

    return `${finalPercentage}%`;
  }

  return "0%";
};

export type DataType = {
  key: React.Key;
  [key: string]: any;
};

export const customOrder = [
  "Super Premium",
  "Premium",
  "Upper Mainstream",
  "Mainstream",
  "Super Value",
  "Value",
];

export const extractDynamicValues = (data: any[], columnPattern: string) => {
  return data.map((row) => {
    const values: any = {};
    Object.keys(row).forEach((key) => {
      if (key.startsWith(columnPattern)) {
        values[key] = row[key];
      }
    });
    return values;
  });
};

export const aggregateData = (data: any[]) => {
  const aggregatedMap = new Map<string, any>();

  data.forEach((row) => {
    const key = Object.keys(row)
      .filter((k) => k.startsWith("dynamic_row_"))
      .map((k) => row[k])
      .join("_");

    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, { ...row });
    } else {
      const existingRow = aggregatedMap.get(key);
      Object.keys(row).forEach((k) => {
        if (
          typeof row[k] === "number" &&
          k !== "Price Index" &&
          k !== "dynamic_row_0" &&
          k !== "TopNOn"
        ) {
          existingRow[k] = (existingRow[k] || 0) + row[k];
        }
      });
    }
  });

  return Array.from(aggregatedMap.values());
};

export const usePriceTier = (rows: any[]) => {
  // Maps each priceIndex to the appropriate price tier
  const mapValuesToPriceTiers = (priceIndex: number) => {
    const tiers = [
      { name: "Super Premium", min: 150 },
      { name: "Premium", min: 120 },
      { name: "Upper Mainstream", min: 105 },
      { name: "Mainstream", min: 85 },
      { name: "Value", min: 70 },
      { name: "Super Value", min: 0 },
    ];

    // Return the name of the first tier where the priceIndex is greater than the min value
    return tiers.find((tier) => priceIndex > tier.min)?.name || "Super Value";
  };

  // Sort function to handle numbers in descending order
  const sortByPriceIndexDescending = (a: number, b: number) => b - a;

  // Check if rows[0]?.values exists and sort them
  const sortedValues = (rows[0]?.values || [])
    .map((val: any) => Number(val)) // Ensure values are numbers
    .sort(sortByPriceIndexDescending);

  // Map sorted values to corresponding price tiers
  return sortedValues.map(mapValuesToPriceTiers);
};

export const calculateColumnWidth = (text: string) => {
  const baseWidth = 100; // Base width for short text
  const extraWidthPerChar = 10; // Extra width for each character in the header
  const minWidth = 50; // Minimum width to prevent very narrow columns
  const maxWidth = 150; // Maximum width to prevent very wide columns

  // Calculate width based on text length
  const calculatedWidth = baseWidth + text.length * extraWidthPerChar;

  // Ensure width is within the min-max range
  return Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
};

export const sortByCustomOrder = (a: DataType, b: DataType) => {
  const orderMap = customOrder.reduce((acc, value, index) => {
    acc[value] = index;
    return acc;
  }, {} as Record<string, number>);

  const aOrder = orderMap[a[`dynamic_row_0`]];
  const bOrder = orderMap[b[`dynamic_row_0`]];

  if (aOrder === undefined && bOrder === undefined) return 0;
  if (aOrder === undefined) return 1; // a is not in customOrder, b is
  if (bOrder === undefined) return -1; // b is not in customOrder, a is

  return aOrder - bOrder;
};

export const enhancedSort = (a: DataType, b: DataType) => {
  const aCompany = a[`dynamic_row_2`]?.toString().trim();
  const bCompany = b[`dynamic_row_2`]?.toString().trim();

  // Check if either company matches the specific company
  const isPriorityCompanyA = aCompany === "Manufacture1"; // Replace with the target company
  const isPriorityCompanyB = bCompany === "Manufacture1"; // Replace with the target company

  // If both entries are the priority company, sort by Price Index
  if (isPriorityCompanyA && isPriorityCompanyB) {
    return (b["Price Index"] ?? 0) - (a["Price Index"] ?? 0);
  }

  // If only one is the priority company, prioritize it
  if (isPriorityCompanyA) return -1; // a is the priority company
  if (isPriorityCompanyB) return 1; // b is the priority company

  // If neither is the priority company, use the custom order
  return sortByCustomOrder(a, b);
};
export const createDynamicRow = (
  tableData: DataType[],
  dynamicRowColumns: any,
  columnDefinitions: any
): DataType => {
  const dynamicRow: DataType = { key: "dynamic_row_end" }; // Unique key for the dynamic row

  const firstColumnDataIndex = dynamicRowColumns[0]?.dataIndex;
  if (firstColumnDataIndex) {
    dynamicRow[firstColumnDataIndex] = "Total"; // Ensure it is the correct column at 0th index
  }

  // Only calculate totals for the last two dynamicRowColumns
  const lastTwoDynamicRowColumns = dynamicRowColumns.slice(-2); // Get the last two dynamicRowColumns

  lastTwoDynamicRowColumns.forEach((column: any) => {
    const dataIndex = column.dataIndex;
    const isNumeric = tableData.some((row) => !isNaN(Number(row[dataIndex]))); // Check if column contains numeric values

    if (isNumeric) {
      // Calculate the sum for numeric columns
      const sum = tableData.reduce(
        (acc, row) => acc + (Number(row[dataIndex]) || 0),
        0
      );
      dynamicRow[dataIndex] = sum;
    } else {
      dynamicRow[dataIndex] = ""; // Set placeholders for non-numeric columns
    }
  });

  // Ensure all other columns (from columnDefinitions) are left empty
  columnDefinitions.forEach((column: any) => {
    const dataIndex = column.dataIndex;

    if (column.children) {
      // Set empty for all sub-columns
      column.children.forEach((subColumn: any) => {
        dynamicRow[subColumn.dataIndex] = ""; // Leave sub-columns empty
      });
    } else {
      dynamicRow[dataIndex] = ""; // Leave top-level columns empty
    }
  });

  return dynamicRow;
};

export const generateRowBackgroundColorStyles = (
  colorMap: Record<string, string>
) => {
  return Object.entries(colorMap)
    .map(
      ([value, color]) => `
        .first-column-background-${value.replace(
          /[^a-zA-Z0-9]/g,
          ""
        )} td:first-child {
          background-color: ${color} !important;
          color: white;
        }
        .first-column-background-${value.replace(
          /[^a-zA-Z0-9]/g,
          ""
        )} td:not(:first-child) {
          border-bottom: 2px solid ${color} !important;
        }
      `
    )
    .join("\n");
};

export const colorMap = {
  "Super Value": "#B90000",
  Value: "#EF6D15",
  Mainstream: "#00A7F8",
  "Upper Mainstream": "#F3BA00",
  Premium: "#81C23E",
  "Super Premium": "#C355F3",
  default: "white",
};
