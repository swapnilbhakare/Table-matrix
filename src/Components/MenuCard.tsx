import React, { useState } from "react";
import { Menu, Checkbox, Input, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { BiSolidEraser } from "react-icons/bi";

export const MenuCard = ({
  selectedCheckboxes,
  setSelectedCheckboxes,
  dropdownOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = dropdownOptions
    .filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
  const handleMenuClick = (e) => {
    // Prevent default menu closing behavior
    e.preventDefault();

    e.domEvent.stopPropagation();
  };
  const handleClear = (e) => {
    setSelectedCheckboxes([]);
    e.preventDefault();
    e.stopPropagation();
  };
  const allSelected = dropdownOptions.every((option) =>
    selectedCheckboxes.includes(option)
  );

  const handleAllCheck = (e) => {
    if (e.target.checked) {
      setSelectedCheckboxes(dropdownOptions); // Select all
    } else {
      setSelectedCheckboxes([]); // Deselect all
    }
  };
  return (
    <Menu
      onClick={handleMenuClick}
      style={{
        width: "180px",
        maxHeight: "250px", // Set the maximum height
        overflowY: "auto", // Enable vertical scrollbar
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
        <BiSolidEraser
          onClick={handleClear}
          style={{ fontSize: "1.3rem", color: "#000", marginLeft: "10px" }}
        />
      </Menu.Item>
      <Menu.Item key="all">
        <Checkbox onChange={handleAllCheck} checked={allSelected}>
          All
        </Checkbox>
      </Menu.Item>

      {filteredOptions.map((option) => (
        <Menu.Item key={option}>
          <Checkbox
            onChange={(e) => {
              const newSelected = e.target.checked
                ? [...selectedCheckboxes, option]
                : selectedCheckboxes.filter((item) => item !== option);
              setSelectedCheckboxes(newSelected);
            }}
            checked={selectedCheckboxes.includes(option)}
          >
            {option} {/* Use the truncateLabel function here */}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );
};
