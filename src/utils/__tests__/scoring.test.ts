import { describe, it, expect } from "vitest";
import {
    normalizeScore,
    calculateScores,
    validateWeights,
    validateScore,
    formatNumber,
    distributeRemainingWeight,
} from "../scoring";
import type { Decision } from "@/types";

describe("normalizeScore", () => {
    it("should normalize a score correctly", () => {
        expect(normalizeScore(5, 0, 10)).toBe(0.5);
        expect(normalizeScore(0, 0, 10)).toBe(0);
        expect(normalizeScore(10, 0, 10)).toBe(1);
        expect(normalizeScore(7.5, 0, 10)).toBe(0.75);
    });

    it("should handle min equals max", () => {
        expect(normalizeScore(5, 5, 5)).toBe(1);
    });

    it("should handle negative ranges", () => {
        expect(normalizeScore(0, -10, 10)).toBe(0.5);
        expect(normalizeScore(-5, -10, 0)).toBe(0.5);
    });
});

describe("validateWeights", () => {
    it("should validate weights that sum to 1.0", () => {
        expect(validateWeights([{ weight: 0.4 }, { weight: 0.6 }])).toBe(true);
        expect(validateWeights([{ weight: 0.25 }, { weight: 0.25 }, { weight: 0.5 }])).toBe(true);
    });

    it("should reject weights that do not sum to 1.0", () => {
        expect(validateWeights([{ weight: 0.5 }, { weight: 0.6 }])).toBe(false);
        expect(validateWeights([{ weight: 0.3 }, { weight: 0.3 }])).toBe(false);
    });

    it("should handle floating point precision issues", () => {
        expect(validateWeights([{ weight: 0.33333 }, { weight: 0.33333 }, { weight: 0.33334 }])).toBe(true);
    });

    it("should handle empty array", () => {
        expect(validateWeights([])).toBe(true);
    });
});

describe("validateScore", () => {
    it("should validate scores within range", () => {
        expect(validateScore(5, 0, 10)).toBe(true);
        expect(validateScore(0, 0, 10)).toBe(true);
        expect(validateScore(10, 0, 10)).toBe(true);
    });

    it("should reject scores outside range", () => {
        expect(validateScore(-1, 0, 10)).toBe(false);
        expect(validateScore(11, 0, 10)).toBe(false);
    });
});

describe("formatNumber", () => {
    it("should format numbers to 2 decimal places", () => {
        expect(formatNumber(1.2345)).toBe("1.23");
        expect(formatNumber(1)).toBe("1.00");
        expect(formatNumber(0.1)).toBe("0.10");
    });
});

describe("distributeRemainingWeight", () => {
    it("should distribute remaining weight equally", () => {
        const dimensions = [{ weight: 0.2 }, { weight: 0.3 }, { weight: 0.0 }];
        const selectedIndices = [2];
        const result = distributeRemainingWeight(dimensions, selectedIndices);

        expect(result[0]).toBe(0.2);
        expect(result[1]).toBe(0.3);
        expect(result[2]).toBe(0.5);
        expect(Math.abs(result.reduce((sum, w) => sum + w, 0) - 1.0)).toBeLessThan(0.001);
    });

    it("should distribute among multiple dimensions", () => {
        const dimensions = [{ weight: 0.2 }, { weight: 0.0 }, { weight: 0.0 }];
        const selectedIndices = [1, 2];
        const result = distributeRemainingWeight(dimensions, selectedIndices);

        expect(result[0]).toBe(0.2);
        expect(result[1]).toBe(0.4);
        expect(result[2]).toBe(0.4);
        expect(Math.abs(result.reduce((sum, w) => sum + w, 0) - 1.0)).toBeLessThan(0.001);
    });

    it("should handle no selected dimensions", () => {
        const dimensions = [{ weight: 0.5 }, { weight: 0.5 }];
        const selectedIndices: number[] = [];
        const result = distributeRemainingWeight(dimensions, selectedIndices);

        expect(result[0]).toBe(0.5);
        expect(result[1]).toBe(0.5);
    });
});

describe("calculateScores", () => {
    it("should calculate scores correctly", () => {
        const decision: Decision = {
            id: "1",
            title: "Test Decision",
            description: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            dimensions: [
                {
                    id: "d1",
                    name: "Dimension 1",
                    description: "",
                    scaleMin: 0,
                    scaleMax: 10,
                    weight: 0.4,
                },
                {
                    id: "d2",
                    name: "Dimension 2",
                    description: "",
                    scaleMin: 0,
                    scaleMax: 10,
                    weight: 0.6,
                },
            ],
            scenarios: [
                {
                    id: "s1",
                    name: "Scenario 1",
                    notes: "",
                    scores: { d1: 8, d2: 6 },
                },
                {
                    id: "s2",
                    name: "Scenario 2",
                    notes: "",
                    scores: { d1: 6, d2: 8 },
                },
            ],
        };

        const result = calculateScores(decision);

        expect(result.results).toHaveLength(2);
        expect(result.winner).toBeDefined();

        // Scenario 1: (8/10 * 0.4) + (6/10 * 0.6) = 0.32 + 0.36 = 0.68
        expect(result.results[0].totalScore).toBeCloseTo(0.68, 2);

        // Scenario 2: (6/10 * 0.4) + (8/10 * 0.6) = 0.24 + 0.48 = 0.72
        expect(result.results[1].totalScore).toBeCloseTo(0.72, 2);

        // Scenario 2 should win
        expect(result.winner?.scenarioId).toBe("s2");
    });

    it("should handle missing scores as 0", () => {
        const decision: Decision = {
            id: "1",
            title: "Test Decision",
            description: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            dimensions: [
                {
                    id: "d1",
                    name: "Dimension 1",
                    description: "",
                    scaleMin: 0,
                    scaleMax: 10,
                    weight: 1.0,
                },
            ],
            scenarios: [
                {
                    id: "s1",
                    name: "Scenario 1",
                    notes: "",
                    scores: {},
                },
            ],
        };

        const result = calculateScores(decision);
        expect(result.results[0].totalScore).toBe(0);
    });

    it("should sort dimension contributions by weighted score", () => {
        const decision: Decision = {
            id: "1",
            title: "Test Decision",
            description: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            dimensions: [
                {
                    id: "d1",
                    name: "Dimension 1",
                    description: "",
                    scaleMin: 0,
                    scaleMax: 10,
                    weight: 0.3,
                },
                {
                    id: "d2",
                    name: "Dimension 2",
                    description: "",
                    scaleMin: 0,
                    scaleMax: 10,
                    weight: 0.7,
                },
            ],
            scenarios: [
                {
                    id: "s1",
                    name: "Scenario 1",
                    notes: "",
                    scores: { d1: 10, d2: 10 },
                },
            ],
        };

        const result = calculateScores(decision);
        const contributions = result.results[0].dimensionContributions;

        // d2 should be first because it has higher weighted score (0.7 vs 0.3)
        expect(contributions[0].dimensionId).toBe("d2");
        expect(contributions[1].dimensionId).toBe("d1");
    });

    it("should return empty results for no dimensions or scenarios", () => {
        const decision: Decision = {
            id: "1",
            title: "Test Decision",
            description: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            dimensions: [],
            scenarios: [],
        };

        const result = calculateScores(decision);
        expect(result.results).toHaveLength(0);
        expect(result.winner).toBeNull();
    });
});
