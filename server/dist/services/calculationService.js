import { EMISSION_FACTORS } from "../config/emissionFactors.js";
export function calculateEmissions(category, type, amount) {
    const categoryFactors = EMISSION_FACTORS[category];
    if (!categoryFactors) {
        throw new Error(`Invalid emission category: ${category}`);
    }
    const factorConfig = categoryFactors[type];
    if (!factorConfig) {
        throw new Error(`Invalid emission type: ${type} under category ${category}`);
    }
    // Calculate emissions (result is in kg CO2 equivalent)
    const emissions = amount * factorConfig.kgCO2PerUnit;
    // Round to 2 decimal places
    return Math.round(emissions * 100) / 100;
}
export function getUnitForType(category, type) {
    const categoryFactors = EMISSION_FACTORS[category];
    if (!categoryFactors || !categoryFactors[type]) {
        return "";
    }
    return categoryFactors[type].unit;
}
