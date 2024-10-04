import React, { useState } from "react";
import { Menu, Checkbox, Input } from "antd";

export const MenuCard = ({
  selectedCheckboxes,
  setSelectedCheckboxes,
  dropdownOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = dropdownOptions
    .filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

  return (
    <Menu
      style={{
        width: "150px",
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
        />
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
