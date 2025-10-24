<template>
    <div v-if="calculationResult && calculationResult.winner">
        <v-alert type="success" class="mb-4">
            <div class="text-h5">Winner: {{ calculationResult.winner.scenarioName }}</div>
            <div class="text-subtitle-1">Score: {{ formatNumber(calculationResult.winner.totalScore) }}</div>
        </v-alert>

        <v-card class="mb-4">
            <v-card-title>Top Contributing Dimensions</v-card-title>
            <v-card-text>
                <v-list>
                    <v-list-item
                        v-for="contribution in calculationResult.winner.dimensionContributions.slice(0, 3)"
                        :key="contribution.dimensionId"
                    >
                        <v-list-item-title>{{ contribution.dimensionName }}</v-list-item-title>
                        <v-list-item-subtitle>
                            Raw Score: {{ formatNumber(contribution.rawScore) }} | Normalized:
                            {{ formatNumber(contribution.normalizedScore) }} | Weighted:
                            {{ formatNumber(contribution.weightedScore) }} | Contribution:
                            {{ formatNumber(contribution.contribution * 100) }}%
                        </v-list-item-subtitle>
                        <template #prepend>
                            <v-icon color="primary"> mdi-star </v-icon>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>

        <v-card>
            <v-card-title>All Scenario Scores</v-card-title>
            <v-card-text>
                <v-expansion-panels>
                    <v-expansion-panel v-for="result in calculationResult.results" :key="result.scenarioId">
                        <v-expansion-panel-title>
                            <div>
                                <span class="font-weight-bold">{{ result.scenarioName }}</span>
                                <span class="ml-2 text-grey"> - Score: {{ formatNumber(result.totalScore) }} </span>
                                <v-chip
                                    v-if="result.scenarioId === calculationResult.winner?.scenarioId"
                                    color="success"
                                    size="small"
                                    class="ml-2"
                                >
                                    Winner
                                </v-chip>
                            </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-table density="compact">
                                <thead>
                                    <tr>
                                        <th>Dimension</th>
                                        <th>Weight</th>
                                        <th>Raw Score</th>
                                        <th>Normalized</th>
                                        <th>Weighted</th>
                                        <th>Contribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="contrib in result.dimensionContributions" :key="contrib.dimensionId">
                                        <td>{{ contrib.dimensionName }}</td>
                                        <td>{{ formatNumber(contrib.dimensionWeight) }}</td>
                                        <td>{{ formatNumber(contrib.rawScore) }}</td>
                                        <td>{{ formatNumber(contrib.normalizedScore) }}</td>
                                        <td>{{ formatNumber(contrib.weightedScore) }}</td>
                                        <td>{{ formatNumber(contrib.contribution * 100) }}%</td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>
        </v-card>
    </div>

    <v-alert v-else type="info">
        {{ emptyMessage || "No results to display. Calculate scores to see results." }}
    </v-alert>
</template>

<script setup lang="ts">
import { formatNumber } from "@/utils/scoring";
import type { CalculationResult } from "@/types";

defineProps<{
    calculationResult: CalculationResult | null;
    emptyMessage?: string;
}>();
</script>
