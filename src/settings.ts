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
  name: string = "tableSettings";
  displayName: string = "Table Settings";
  slices: Array<FormattingSettingsSlice> = [this.hideAbsoluteCYPY];
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
