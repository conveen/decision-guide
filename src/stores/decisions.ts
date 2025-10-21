import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Decision, Dimension, Scenario } from "@/types";

const STORAGE_KEY = "decision-guide-decisions";

function generateId(): string {
    return crypto.randomUUID();
}

function loadFromStorage(): Decision[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading from storage:", error);
        return [];
    }
}

function saveToStorage(decisions: Decision[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
    } catch (error) {
        console.error("Error saving to storage:", error);
    }
}

export const useDecisionsStore = defineStore("decisions", () => {
    const decisions = ref<Decision[]>(loadFromStorage());

    const getDecisionById = computed(() => {
        return (id: string) => decisions.value.find(d => d.id === id);
    });

    function createDecision(title: string, description: string = ""): Decision {
        const decision: Decision = {
            id: generateId(),
            title,
            description,
            dimensions: [],
            scenarios: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        decisions.value.push(decision);
        saveToStorage(decisions.value);
        return decision;
    }

    function updateDecision(id: string, updates: Partial<Decision>): void {
        const index = decisions.value.findIndex(d => d.id === id);
        if (index !== -1) {
            decisions.value[index] = {
                ...decisions.value[index],
                ...updates,
                updatedAt: Date.now(),
            };
            saveToStorage(decisions.value);
        }
    }

    function deleteDecision(id: string): void {
        decisions.value = decisions.value.filter(d => d.id !== id);
        saveToStorage(decisions.value);
    }

    function duplicateDecision(id: string): Decision | null {
        const original = decisions.value.find(d => d.id === id);
        if (!original) return null;

        const duplicate: Decision = {
            ...JSON.parse(JSON.stringify(original)), // Deep clone
            id: generateId(),
            title: `${original.title} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Generate new IDs for dimensions and scenarios
        const dimensionIdMap = new Map<string, string>();
        duplicate.dimensions = duplicate.dimensions.map(dim => {
            const newId = generateId();
            dimensionIdMap.set(dim.id, newId);
            return { ...dim, id: newId };
        });

        duplicate.scenarios = duplicate.scenarios.map(scenario => {
            const newId = generateId();
            const newScores: Record<string, number> = {};
            for (const [oldDimId, score] of Object.entries(scenario.scores)) {
                const newDimId = dimensionIdMap.get(oldDimId);
                if (newDimId) {
                    newScores[newDimId] = score;
                }
            }
            return { ...scenario, id: newId, scores: newScores };
        });

        decisions.value.push(duplicate);
        saveToStorage(decisions.value);
        return duplicate;
    }

    function addDimension(decisionId: string, dimension: Omit<Dimension, "id">): void {
        const decision = decisions.value.find(d => d.id === decisionId);
        if (decision) {
            const newDimension: Dimension = {
                ...dimension,
                id: generateId(),
            };
            decision.dimensions.push(newDimension);
            decision.updatedAt = Date.now();
            saveToStorage(decisions.value);
        }
    }

    function updateDimension(decisionId: string, dimensionId: string, updates: Partial<Dimension>): void {
        const decision = decisions.value.find(d => d.id === decisionId);
        if (decision) {
            const dimIndex = decision.dimensions.findIndex(dim => dim.id === dimensionId);
            if (dimIndex !== -1) {
                decision.dimensions[dimIndex] = {
                    ...decision.dimensions[dimIndex],
                    ...updates,
                };
                decision.updatedAt = Date.now();
                saveToStorage(decisions.value);
            }
        }
    }

    function deleteDimension(decisionId: string, dimensionId: string): void {
        const decision = decisions.value.find(d => d.id === decisionId);
        if (decision) {
            decision.dimensions = decision.dimensions.filter(dim => dim.id !== dimensionId);
            // Remove scores for this dimension from all scenarios
            decision.scenarios.forEach(scenario => {
                delete scenario.scores[dimensionId];
            });
            decision.updatedAt = Date.now();
            saveToStorage(decisions.value);
        }
    }

    function addScenario(decisionId: string, scenario: Omit<Scenario, "id" | "scores">): void {
        const decision = decisions.value.find(d => d.id === decisionId);
        if (decision) {
            const newScenario: Scenario = {
                ...scenario,
                id: generateId(),
                scores: {},
            };
            decision.scenarios.push(newScenario);
            decision.updatedAt = Date.now();
            saveToStorage(decisions.value);
        }
    }

    function updateScenario(decisionId: string, scenarioId: string, updates: Partial<Scenario>): void {
        const decision = decisions.value.find(d => d.id === decisionId);
        if (decision) {
            const scenarioIndex = decision.scenarios.findIndex(s => s.id === scenarioId);
            if (scenarioIndex !== -1) {
                decision.scenarios[scenarioIndex] = {
                    ...decision.scenarios[scenarioIndex],
                    ...updates,
                };
                decision.updatedAt = Date.now();
                saveToStorage(decisions.value);
            }
        }
    }

    function deleteScenario(decisionId: string, scenarioId: string): void {
        const decision = decisions.value.find(d => d.id === decisionId);
        if (decision) {
            decision.scenarios = decision.scenarios.filter(s => s.id !== scenarioId);
            decision.updatedAt = Date.now();
            saveToStorage(decisions.value);
        }
    }

    function setScenarioScore(decisionId: string, scenarioId: string, dimensionId: string, score: number): void {
        const decision = decisions.value.find(d => d.id === decisionId);
        if (decision) {
            const scenario = decision.scenarios.find(s => s.id === scenarioId);
            if (scenario) {
                scenario.scores[dimensionId] = score;
                decision.updatedAt = Date.now();
                saveToStorage(decisions.value);
            }
        }
    }

    function importDecisions(importedDecisions: Decision[]): void {
        // Generate new IDs for imported decisions to avoid conflicts
        const processedDecisions = importedDecisions.map(dec => ({
            ...dec,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }));

        decisions.value.push(...processedDecisions);
        saveToStorage(decisions.value);
    }

    function exportDecisions(): Decision[] {
        return JSON.parse(JSON.stringify(decisions.value));
    }

    function importFromSharedUrl(decision: Decision): void {
        // Check if this decision already exists
        const existing = decisions.value.find(d => d.id === decision.id);
        if (existing) {
            // Update existing
            updateDecision(decision.id, decision);
        } else {
            // Add new
            decisions.value.push(decision);
            saveToStorage(decisions.value);
        }
    }

    return {
        decisions,
        getDecisionById,
        createDecision,
        updateDecision,
        deleteDecision,
        duplicateDecision,
        addDimension,
        updateDimension,
        deleteDimension,
        addScenario,
        updateScenario,
        deleteScenario,
        setScenarioScore,
        importDecisions,
        exportDecisions,
        importFromSharedUrl,
    };
});
