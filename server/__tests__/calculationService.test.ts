import { describe, it, expect } from "vitest";
import { calculateEmissions, getUnitForType } from "../src/services/calculationService.js";

describe("Carbon Calculation Service", () => {
  describe("calculateEmissions", () => {
    it("should calculate transportation car emissions correctly", () => {
      const result = calculateEmissions("transportation", "car", 100);
      expect(result).toBe(18); // 100 * 0.18 = 18
    });

    it("should calculate bike emissions as 0", () => {
      const result = calculateEmissions("transportation", "bike", 50);
      expect(result).toBe(0);
    });

    it("should calculate food beef emissions correctly", () => {
      const result = calculateEmissions("food", "beef", 3);
      expect(result).toBe(21.6); // 3 * 7.2 = 21.6
    });

    it("should calculate energy electricity emissions correctly", () => {
      const result = calculateEmissions("energy", "electricity", 200);
      expect(result).toBe(90); // 200 * 0.45 = 90
    });

    it("should calculate waste recycling offset correctly", () => {
      const result = calculateEmissions("waste", "recycling", 10);
      expect(result).toBe(-5); // 10 * -0.5 = -5
    });

    it("should throw an error for invalid categories", () => {
      expect(() => calculateEmissions("unknown", "type", 10)).toThrow();
    });

    it("should throw an error for invalid types", () => {
      expect(() => calculateEmissions("food", "unknown", 10)).toThrow();
    });
  });

  describe("getUnitForType", () => {
    it("should return correct unit for electricity", () => {
      expect(getUnitForType("energy", "electricity")).toBe("kWh");
    });

    it("should return empty string for invalid types", () => {
      expect(getUnitForType("food", "unknown")).toBe("");
    });
  });
});
