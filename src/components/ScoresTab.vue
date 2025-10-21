<template>
    <v-row>
        <v-col cols="12">
            <v-card>
                <v-card-title>Enter Scores</v-card-title>

                <v-card-text>
                    <v-alert v-if="decision.dimensions.length === 0 || decision.scenarios.length === 0" type="info">
                        {{ decision.dimensions.length === 0 ? "Add dimensions first." : "Add scenarios first." }}
                    </v-alert>

                    <div v-else>
                        <p class="mb-4">
                            Enter a score for each dimension and scenario. Scores must be within the dimension's scale.
                        </p>

                        <v-table>
                            <thead>
                                <tr>
                                    <th class="text-left">Dimension</th>
                                    <th class="text-center">Scale</th>
                                    <th v-for="scenario in decision.scenarios" :key="scenario.id" class="text-center">
                                        {{ scenario.name }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="dimension in decision.dimensions" :key="dimension.id">
                                    <td>
                                        <div class="font-weight-bold">{{ dimension.name }}</div>
                                        <div v-if="dimension.description" class="text-caption text-grey">
                                            {{ dimension.description }}
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <div class="text-caption">
                                            {{ formatNumber(dimension.scaleMin) }} -
                                            {{ formatNumber(dimension.scaleMax) }}
                                        </div>
                                    </td>
                                    <td v-for="scenario in decision.scenarios" :key="scenario.id" class="text-center">
                                        <v-text-field
                                            :model-value="getScore(scenario.id, dimension.id)"
                                            type="number"
                                            step="0.01"
                                            :min="dimension.scaleMin"
                                            :max="dimension.scaleMax"
                                            variant="outlined"
                                            density="compact"
                                            hide-details
                                            :error="!isScoreValid(scenario.id, dimension.id)"
                                            @update:model-value="updateScore(scenario.id, dimension.id, $event)"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>

                        <v-alert v-if="hasInvalidScores" type="warning" class="mt-4">
                            Some scores are outside their dimension's scale. Please correct them.
                        </v-alert>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDecisionsStore } from "@/stores/decisions";
import { validateScore, formatNumber } from "@/utils/scoring";
import type { Decision } from "@/types";

const props = defineProps<{ decision: Decision }>();
const emit = defineEmits<{ update: [] }>();

const store = useDecisionsStore();

const hasInvalidScores = computed(() => {
    for (const scenario of props.decision.scenarios) {
        for (const dimension of props.decision.dimensions) {
            if (!isScoreValid(scenario.id, dimension.id)) {
                return true;
            }
        }
    }
    return false;
});

function getScore(scenarioId: string, dimensionId: string): number {
    const scenario = props.decision.scenarios.find(s => s.id === scenarioId);
    return scenario?.scores[dimensionId] ?? 0;
}

function updateScore(scenarioId: string, dimensionId: string, value: string | number) {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (!isNaN(numValue)) {
        const roundedValue = parseFloat(numValue.toFixed(2));
        store.setScenarioScore(props.decision.id, scenarioId, dimensionId, roundedValue);
        emit("update");
    }
}

function isScoreValid(scenarioId: string, dimensionId: string): boolean {
    const dimension = props.decision.dimensions.find(d => d.id === dimensionId);
    if (!dimension) return true;

    const score = getScore(scenarioId, dimensionId);
    return validateScore(score, dimension.scaleMin, dimension.scaleMax);
}
</script>
