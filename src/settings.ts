"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Data Point Formatting Card
 */
class DataPointCardSettings extends FormattingSettingsCard {
  defaultColor = new formattingSettings.ColorPicker({
    name: "defaultColor",
    displayName: "Default color",
    value: { value: "" },
  });

  showAllDataPoints = new formattingSettings.ToggleSwitch({
    name: "showAllDataPoints",
    displayName: "Show all",
    value: true,
  });

  fill = new formattingSettings.ColorPicker({
    name: "fill",
    displayName: "Fill",
    value: { value: "" },
  });

  fillRule = new formattingSettings.ColorPicker({
    name: "fillRule",
    displayName: "Color saturation",
    value: { value: "" },
  });

  fontSize = new formattingSettings.NumUpDown({
    name: "fontSize",
    displayName: "Text Size",
    value: 12,
  });

  name: string = "dataPoint";
  displayName: string = "Data colors";
  slices: Array<FormattingSettingsSlice> = [
    this.defaultColor,
    this.showAllDataPoints,
    this.fill,
    this.fillRule,
    this.fontSize,
  ];
}

class TopN extends FormattingSettingsCard {
  topn = new formattingSettings.TextInput({
    name: "topN",
    displayName: "Top n",
    placeholder: "",
    value: "30",
  });

  name: string = "TopN";
  displayName: string = "TopN";
  slices: Array<FormattingSettingsSlice> = [this.topn];
}

class ConditionalFormating extends FormattingSettingsCard {
  conditionalformating = new formattingSettings.TextInput({
    name: "conditionalFormating",
    displayName: "Current to Next",
    placeholder: "",
    value: "Current to Next ",
  });

  name: string = "ConditionalFormating";
  displayName: string = "ConditionalFormating";
  slices: Array<FormattingSettingsSlice> = [this.conditionalformating];
}

class TopCompanies extends FormattingSettingsCard {
  topcompanies = new formattingSettings.TextInput({
    name: "topCompanies",
    displayName: "Top Company",
    placeholder: "",
    value: "",
  });

  name: string = "TopCompanies";
  displayName: string = "TopCompanies";
  slices: Array<FormattingSettingsSlice> = [this.topcompanies];
}
class TableSettings extends FormattingSettingsCard {
  hideAbsoluteCYPY = new formattingSettings.ToggleSwitch({
    name: "hideAbsoluteCYPY",
    displayName: "Hide Absolute CY PY",
    value: false,
  });
  hideAllCol = new formattingSettings.ToggleSwitch({
    name: "hideAllCol",
    displayName: "Hide All sub Column",
    value: false,
  });
  allColumnLogic = new formattingSettings.ItemDropdown({
    name: "allColumnLogic",
    displayName: "All column Options :",
    items: [
      { value: "sum", displayName: "Sum" },
      { value: "division", displayName: "Division" },
      { value: "normal", displayName: "Normal" },
    ],
    value: { value: "sum", displayName: "Sum" }, // Default selection
  });
  precisonPlace = new formattingSettings.ItemDropdown({
    name: "precisonPlace",
    displayName: "Precison Place",
    items: [
      { value: 0, displayName: "0." }, // Default selection
      { value: 1, displayName: "0.0" }, // Default selection
      { value: 2, displayName: "0.00" }, // Default selection
      { value: 3, displayName: "0.000" },
      { value: 4, displayName: "0.0000" },
      { value: 5, displayName: "0.00000" },
    ],
    value: { value: 2, displayName: "0.00" }, // Default selection
  });

  name: string = "tableSettings";
  displayName: string = "Table Settings";
  slices: Array<FormattingSettingsSlice> = [
    this.hideAbsoluteCYPY,
    this.hideAllCol,
    this.allColumnLogic,
    this.precisonPlace,
  ];
}

/**
 * visual settings model class
 *
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
  // Create formatting settings model formatting cards
  dataPointCard = new DataPointCardSettings();

  topn: TopN = new TopN();
  conditionalformating: ConditionalFormating = new ConditionalFormating();
  topcompanies: TopCompanies = new TopCompanies();
  tableSettings: TableSettings = new TableSettings();
  cards = [
    this.dataPointCard,
    this.conditionalformating,
    this.topn,
    this.topcompanies,
    this.tableSettings,
  ];
}
