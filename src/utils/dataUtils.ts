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
