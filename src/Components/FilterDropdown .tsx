import React from "react";
import { Dropdown, Button } from "antd";
import { MenuCard } from "./MenuCard";
const FilterDropdown = ({
  selectedCheckboxes,
  setSelectedCheckboxes,
  dropdownOptions,
  displayName,
}) => {
  return (
    <Dropdown
      overlay={
        <MenuCard
          selectedCheckboxes={selectedCheckboxes}
          setSelectedCheckboxes={setSelectedCheckboxes}
          dropdownOptions={dropdownOptions}
        />
      }
      trigger={["click"]}
    >
      <Button>Select {displayName}'s</Button>
    </Dropdown>
  );
};

export default FilterDropdown;
