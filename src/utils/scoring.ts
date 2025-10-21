import type { Decision, ScenarioResult, DimensionContribution, CalculationResult } from "@/types";

/**
 * Normalize a score using min-max normalization
 * Formula: (x - min) / (max - min) = z
 */
export function normalizeScore(score: number, min: number, max: number): number {
    if (max === min) return 1.0; // If scale is 0, return 1
    return (score - min) / (max - min);
}

/**
 * Calculate normalized, weighted scores for all scenarios
 */
export function calculateScores(decision: Decision): CalculationResult {
    const { dimensions, scenarios } = decision;

    // Validate that we have the data needed
    if (dimensions.length === 0 || scenarios.length === 0) {
        return { results: [], winner: null };
    }

    const results: ScenarioResult[] = [];

    for (const scenario of scenarios) {
        const dimensionContributions: DimensionContribution[] = [];
        let totalScore = 0;

        for (const dimension of dimensions) {
            const rawScore = scenario.scores[dimension.id] ?? 0;
            const normalizedScore = normalizeScore(rawScore, dimension.scaleMin, dimension.scaleMax);
            const weightedScore = normalizedScore * dimension.weight;

            dimensionContributions.push({
                dimensionId: dimension.id,
                dimensionName: dimension.name,
                dimensionWeight: dimension.weight,
                rawScore,
                normalizedScore,
                weightedScore,
                contribution: 0, // Will calculate after we have total
            });

            totalScore += weightedScore;
        }

        // Calculate contribution percentages
        for (const contribution of dimensionContributions) {
            contribution.contribution = totalScore > 0 ? contribution.weightedScore / totalScore : 0;
        }

        // Sort contributions by weighted score (descending)
        dimensionContributions.sort((a, b) => b.weightedScore - a.weightedScore);

        results.push({
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            totalScore,
            dimensionContributions,
        });
    }

    // Find winner (highest score)
    const winner = results.reduce((prev, current) => (current.totalScore > prev.totalScore ? current : prev));

    return { results, winner };
}

/**
 * Validate that dimension weights sum to 1.0 (with small tolerance for floating point)
 */
export function validateWeights(dimensions: { weight: number }[]): boolean {
    const sum = dimensions.reduce((acc, dim) => acc + dim.weight, 0);
    return Math.abs(sum - 1.0) < 0.001;
}

/**
 * Validate that all dimensions have both scale min and max values defined
 */
export function validateScales(dimensions: { scaleMin: number; scaleMax: number }[]): boolean {
    return dimensions.every(
        dimension =>
            dimension.scaleMin !== null &&
            dimension.scaleMin !== undefined &&
            dimension.scaleMin !== "" &&
            dimension.scaleMax !== null &&
            dimension.scaleMax !== undefined &&
            dimension.scaleMax !== "",
    );
}

/**
 * Validate that a score is within the dimension's scale
 */
export function validateScore(score: number, min: number, max: number): boolean {
    return score >= min && score <= max;
}

/**
 * Format a number to 2 decimal places
 */
export function formatNumber(num: number): string {
    return num.toFixed(2);
}

/**
 * Distribute remaining weight equally across dimensions
 */
export function distributeRemainingWeight(dimensions: { weight: number }[], selectedIndices: number[]): number[] {
    const newWeights = dimensions.map(d => d.weight);
    const usedWeight = selectedIndices.reduce((sum, idx) => sum + newWeights[idx], 0);
    const remainingWeight = 1.0 - usedWeight;

    if (selectedIndices.length === 0 || remainingWeight <= 0) {
        return newWeights;
    }

    const equalShare = remainingWeight / selectedIndices.length;

    for (const idx of selectedIndices) {
        newWeights[idx] = parseFloat((newWeights[idx] + equalShare).toFixed(2));
    }

    // Adjust for rounding errors
    const finalSum = newWeights.reduce((sum, w) => sum + w, 0);
    if (Math.abs(finalSum - 1.0) > 0.001 && selectedIndices.length > 0) {
        newWeights[selectedIndices[0]] = parseFloat((newWeights[selectedIndices[0]] + (1.0 - finalSum)).toFixed(2));
    }

    return newWeights;
}
