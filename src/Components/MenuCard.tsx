/* eslint-disable max-lines-per-function */
import React, { useState } from "react";
import { Menu, Checkbox, Input, Divider } from "antd";
import { BiSolidEraser } from "react-icons/bi";

export const MenuCard = ({
  selectedCheckboxes,
  setSelectedCheckboxes,
  dropdownOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter options based on the search term
  const filteredOptions = dropdownOptions
    .filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

  // Check if all filtered options are selected
  const checkAll =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => selectedCheckboxes.includes(option));
  const indeterminate =
    selectedCheckboxes.length > 0 &&
    selectedCheckboxes.length < filteredOptions.length;

  // Handle the click to prevent menu closing
  const handleMenuClick = (e) => {
    e.preventDefault();
    e.domEvent.stopPropagation();
  };

  // Clear the selected checkboxes
  const handleClear = (e) => {
    setSelectedCheckboxes([]);
    setSearchTerm(""); // Optionally clear the search term
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle changing the selection of checkboxes
  const onChange = (list) => {
    setSelectedCheckboxes(list);
  };

  // Handle checking/unchecking all checkboxes
  const onCheckAllChange = (e) => {
    setSelectedCheckboxes(e.target.checked ? filteredOptions : []); // Select all filtered options
  };

  return (
    <Menu
      onClick={handleMenuClick}
      style={{
        width: "180px",
        maxHeight: "250px", // Set the maximum height
        overflowY: "auto", // Enable vertical scrollbar
        background: "#e6e6e6",
      }}
    >
      <Menu.Item>
        <Input
          onClick={(e) => e.stopPropagation()}
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          style={{ width: "115px", height: "30px" }}
        />
        {selectedCheckboxes.length > 0 && (
          <BiSolidEraser
            onClick={handleClear}
            style={{
              fontSize: "1.3rem",
              color: "#000",
              marginLeft: "10px",
              cursor: "pointer",
            }}
          />
        )}
      </Menu.Item>

      <Checkbox
        className="custom-checkbox"
        style={{ margin: "10px 5px" }}
        indeterminate={indeterminate}
        onChange={onCheckAllChange}
        checked={checkAll}
      >
        Select All
      </Checkbox>
      <Checkbox.Group
        className="custom-checkbox"
        style={{
          margin: "0 5px",
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          flexWrap: "nowrap",
          textWrap: "nowrap",
          justifyContent: "center",
          flexDirection: "column", // Set to column for vertical layout
          gap: "9px", // Optional: add space between checkboxes
        }}
        options={filteredOptions}
        value={selectedCheckboxes}
        onChange={onChange}
      />
    </Menu>
  );
};
