/* eslint-disable max-lines-per-function */
export const mapValuesToPriceTiers = (priceIndex) => {
  if (priceIndex > 150) {
    return "Super Premium";
  } else if (priceIndex >= 120) {
    return "Premium";
  } else if (priceIndex >= 105) {
    return "Upper Mainstream";
  } else if (priceIndex >= 85) {
    return "Mainstream";
  } else if (priceIndex >= 70) {
    return "Value";
  } else {
    return "Super Value";
  }
};

export const formatNumberWithCommas = (
  value: number,
  precision: number = 0
) => {
  // Ensure the value is a number
  const numValue = Number(value);

  // Format the number with commas and specified precision
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(numValue);
};

export const mergeRows = (data, subcolDefination, uniqeParentCol) => {
  const mergedData = {};
  console.log(data, "datadata");
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

      uniqeParentCol.forEach((parentCol) => {
        mergedData[key][`${parentCol}_divisionVal`] = 0;
        mergedData[key][`${parentCol}_volumeVal`] = 0;
        mergedData[key][`${parentCol}_divisionVal`] = 0;
        mergedData[key][`${parentCol}_volumeVal`] = 0;
        mergedData[key][`${parentCol}_divisionVal`] = 0;
        mergedData[key][`${parentCol}_volumeVal`] = 0;
        mergedData[key][`${parentCol}_divisionVal`] = 0;
        mergedData[key][`${parentCol}_volumeVal`] = 0;
        mergedData[key][`${parentCol}_brandIndexVal`] = 0;

        //
      });
    } else {
      // Aggregate dynamic_row_0 and other non-subcolumn data
      mergedData[key]["dynamic_row_0"] += row.dynamic_row_0 || 0;
      mergedData[key]["Price Index"] += row["Price Index"] || 0;
      mergedData[key]["TopNOn"] += row.TopNOn || 0;
      mergedData[key]["dynamic_row_4"] += row.dynamic_row_4 || 0;
      mergedData[key]["dynamic_row_5"] += row.dynamic_row_5 || 0;
      mergedData[key]["dynamic_row_6"] += row.dynamic_row_6 || 0;
    }

    uniqeParentCol.forEach((parentCol) => {
      mergedData[key][`${parentCol}_divisionVal`] +=
        row[`${parentCol}_divisionVal`] || 0;
      mergedData[key][`${parentCol}_volumeVal`] +=
        row[`${parentCol}_volumeVal`] || 0;

      mergedData[key][`${parentCol}_divisionVal`] +=
        row[`${parentCol}_divisionVal`] || 0;
      mergedData[key][`${parentCol}_volumeVal`] +=
        row[`${parentCol}_volumeVal`] || 0;

      mergedData[key][`${parentCol}_divisionVal`] +=
        row[`${parentCol}_divisionVal`] || 0;
      mergedData[key][`${parentCol}_volumeVal`] +=
        row[`${parentCol}_volumeVal`] || 0;

      mergedData[key][`${parentCol}_divisionVal`] +=
        row[`${parentCol}_divisionVal`] || 0;
      mergedData[key][`${parentCol}_volumeVal`] +=
        row[`${parentCol}_volumeVal`] || 0;
      // _brandIndexVal
      mergedData[key][`${parentCol}_brandIndexVal`] +=
        row[`${parentCol}_brandIndexVal`] || 0;
    });

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
      if (
        mergedData[key][col.dataIndex] === 0 ||
        mergedData[key][col.dataIndex] === null
      ) {
        mergedData[key][col.dataIndex] += row[col.dataIndex] || 0;
      }
    });
  });

  // Convert the merged data object back into an array
  return Object.values(mergedData);
};

export const sortByField = (data, field, ascending = false) => {
  return data.sort((a, b) => {
    const aValue = a[field] ?? 0; // Default to 0 if the field is missing
    const bValue = b[field] ?? 0;
    return ascending ? aValue - bValue : bValue - aValue; // Conditional sorting
  });
};
