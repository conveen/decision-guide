export interface Dimension {
    id: string;
    name: string;
    description: string;
    scaleMin: number;
    scaleMax: number;
    weight: number;
}

export interface Scenario {
    id: string;
    name: string;
    notes: string;
    // dimensionId: score
    scores: Record<string, number>;
}

export interface Decision {
    id: string;
    title: string;
    description: string;
    dimensions: Dimension[];
    scenarios: Scenario[];
    createdAt: number;
    updatedAt: number;
}

export interface ScenarioResult {
    scenarioId: string;
    scenarioName: string;
    totalScore: number;
    dimensionContributions: DimensionContribution[];
}

export interface DimensionContribution {
    dimensionId: string;
    dimensionName: string;
    dimensionWeight: number;
    rawScore: number;
    normalizedScore: number;
    weightedScore: number;
    // percentage of total score
    contribution: number;
}

export interface CalculationResult {
    results: ScenarioResult[];
    winner: ScenarioResult | null;
}
