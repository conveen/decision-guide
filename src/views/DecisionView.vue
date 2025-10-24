<template>
    <v-container v-if="decision" fluid>
        <!-- Header -->
        <v-row>
            <v-col cols="12">
                <v-btn prepend-icon="mdi-arrow-left" @click="goBack"> Back </v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>
                        <v-text-field
                            v-model="decision.title"
                            variant="plain"
                            density="comfortable"
                            hide-details
                            class="text-h4"
                            @blur="saveDecision"
                        />
                    </v-card-title>
                    <v-card-text>
                        <v-textarea
                            v-model="decision.description"
                            variant="plain"
                            density="comfortable"
                            hide-details
                            placeholder="Add a description..."
                            rows="2"
                            auto-grow
                            @blur="saveDecision"
                        />
                    </v-card-text>
                    <v-card-actions>
                        <v-btn-toggle
                            v-model="viewMode"
                            mandatory
                            color="primary"
                            variant="outlined"
                            density="comfortable"
                        >
                            <v-btn value="tabs" prepend-icon="mdi-tab">
                                <v-tooltip text="Tab View" location="bottom">
                                    <template #activator="{ props: tooltipProps }">
                                        <span v-bind="tooltipProps">Tabs</span>
                                    </template>
                                </v-tooltip>
                            </v-btn>
                            <v-btn value="matrix" prepend-icon="mdi-table">
                                <v-tooltip text="Matrix View" location="bottom">
                                    <template #activator="{ props: tooltipProps }">
                                        <span v-bind="tooltipProps">Matrix</span>
                                    </template>
                                </v-tooltip>
                            </v-btn>
                        </v-btn-toggle>

                        <v-spacer />

                        <v-btn prepend-icon="mdi-share-variant" @click="shareDecision"> Share </v-btn>
                        <v-btn prepend-icon="mdi-content-copy" @click="duplicateDecision"> Duplicate </v-btn>
                        <v-btn color="error" prepend-icon="mdi-delete" @click="deleteDecision"> Delete </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Tabs -->
        <v-row v-show="viewMode === 'tabs'">
            <v-col cols="12">
                <v-tabs v-model="activeTab" bg-color="primary">
                    <v-tab value="dimensions"> Dimensions </v-tab>
                    <v-tab value="scenarios"> Scenarios </v-tab>
                    <v-tab value="scores" :disabled="!canEnterScores"> Scores </v-tab>
                    <v-tab value="results" :disabled="!canCalculate"> Results </v-tab>
                </v-tabs>
            </v-col>
        </v-row>

        <!-- Tab Content -->
        <v-row v-show="viewMode === 'tabs'">
            <v-col cols="12">
                <v-tabs-window v-model="activeTab">
                    <!-- Dimensions Tab -->
                    <v-tabs-window-item value="dimensions">
                        <DimensionsTab :decision="decision" @update="saveDecision" />
                    </v-tabs-window-item>

                    <!-- Scenarios Tab -->
                    <v-tabs-window-item value="scenarios">
                        <ScenariosTab :decision="decision" @update="saveDecision" />
                    </v-tabs-window-item>

                    <!-- Scores Tab -->
                    <v-tabs-window-item value="scores">
                        <ScoresTab :decision="decision" @update="saveDecision" />
                    </v-tabs-window-item>

                    <!-- Results Tab -->
                    <v-tabs-window-item value="results">
                        <ResultsTab :decision="decision" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>

        <!-- Matrix View -->
        <div v-show="viewMode === 'matrix'">
            <!-- Decision Table -->
            <v-card class="mb-6 mt-4">
                <v-card-title>
                    <span class="text-h6">Decision Matrix</span>
                </v-card-title>
                <v-card-text>
                    <v-table density="compact">
                        <thead>
                            <tr>
                                <th class="text-left" style="min-width: 200px">Dimension</th>
                                <th class="text-center" style="min-width: 100px">Weight</th>
                                <th class="text-center" style="min-width: 100px">Scale Min</th>
                                <th class="text-center" style="min-width: 100px">Scale Max</th>
                                <th
                                    v-for="scenario in decision.scenarios"
                                    :key="scenario.id"
                                    class="text-center"
                                    style="min-width: 150px"
                                >
                                    <v-text-field
                                        v-model="scenario.name"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        placeholder="Scenario name"
                                        @blur="saveDecision"
                                    >
                                        <template #append>
                                            <v-btn
                                                icon="mdi-close"
                                                size="x-small"
                                                variant="text"
                                                :disabled="decision.scenarios.length <= 1"
                                                @click="store.deleteScenario(decision.id, scenario.id)"
                                            />
                                        </template>
                                    </v-text-field>
                                </th>
                                <th style="width: 50px">
                                    <v-btn
                                        icon="mdi-plus"
                                        size="small"
                                        variant="tonal"
                                        color="primary"
                                        title="Add scenario"
                                        @click="store.addScenario(decision.id, { name: '', notes: '' })"
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="dimension in decision.dimensions" :key="dimension.id">
                                <td>
                                    <v-text-field
                                        v-model="dimension.name"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        placeholder="Dimension name"
                                        @blur="saveDecision"
                                    />
                                </td>
                                <td>
                                    <v-text-field
                                        v-model.number="dimension.weight"
                                        type="number"
                                        step="0.1"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        :rules="[v => (v >= 0 && v <= 1) || 'Weight must be 0-1']"
                                        @blur="saveDecision"
                                    />
                                </td>
                                <td>
                                    <v-text-field
                                        v-model.number="dimension.scaleMin"
                                        type="number"
                                        step="0.01"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        @blur="saveDecision"
                                    />
                                </td>
                                <td>
                                    <v-text-field
                                        v-model.number="dimension.scaleMax"
                                        type="number"
                                        step="0.01"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        @blur="saveDecision"
                                    />
                                </td>
                                <td v-for="scenario in decision.scenarios" :key="scenario.id">
                                    <v-text-field
                                        :model-value="getScenarioScore(dimension.id, scenario.id)"
                                        type="number"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        :rules="[
                                            v =>
                                                (v >= dimension.scaleMin && v <= dimension.scaleMax) ||
                                                `Score must be ${dimension.scaleMin}-${dimension.scaleMax}`,
                                        ]"
                                        @update:model-value="
                                            ($event: string | number) => {
                                                if (decision) {
                                                    store.setScenarioScore(
                                                        decision.id,
                                                        scenario.id,
                                                        dimension.id,
                                                        typeof $event === 'string' ? parseFloat($event) || 0 : $event,
                                                    );
                                                }
                                            }
                                        "
                                    />
                                </td>
                                <td>
                                    <v-btn
                                        icon="mdi-delete"
                                        size="x-small"
                                        variant="text"
                                        color="error"
                                        :disabled="decision.dimensions.length <= 1"
                                        @click="store.deleteDimension(decision.id, dimension.id)"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </v-table>

                    <v-btn
                        class="mt-4"
                        variant="outlined"
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="
                            store.addDimension(decision.id, {
                                name: '',
                                description: '',
                                weight: 0,
                                scaleMin: 0,
                                scaleMax: 10,
                            })
                        "
                    >
                        Add Dimension
                    </v-btn>
                </v-card-text>
            </v-card>

            <!-- Calculate Button -->
            <div class="text-center mb-6">
                <v-btn color="primary" size="large" :disabled="!isMatrixValid" @click="calculateMatrixResults">
                    Calculate Results
                </v-btn>
            </div>

            <!-- Results -->
            <v-card v-if="matrixCalculationResult">
                <v-card-title>
                    <span class="text-h6">Results</span>
                </v-card-title>
                <v-card-text>
                    <ResultsDisplay :calculation-result="matrixCalculationResult" />
                </v-card-text>
            </v-card>
        </div>

        <!-- Share Dialog -->
        <v-dialog v-model="showShareDialog" max-width="600">
            <v-card>
                <v-card-title>Share Decision</v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="shareableUrl"
                        label="Shareable URL"
                        readonly
                        variant="outlined"
                        density="comfortable"
                    >
                        <template #append>
                            <v-btn icon size="small" @click="copyShareUrl">
                                <v-icon>mdi-content-copy</v-icon>
                            </v-btn>
                        </template>
                    </v-text-field>
                    <p class="text-caption text-grey">Anyone with this link can view and edit this decision.</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="showShareDialog = false"> Close </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar
            v-model="showSnackbar"
            :timeout="3000"
            color="surface"
            :text-color="isDarkMode ? 'primary' : 'on-surface'"
            class="text-center"
        >
            <div class="text-center">
                {{ snackbarMessage }}
            </div>
        </v-snackbar>
    </v-container>

    <v-container v-else>
        <v-row>
            <v-col cols="12">
                <v-alert type="error"> Decision not found </v-alert>
                <v-btn prepend-icon="mdi-arrow-left" class="mt-4" @click="goBack"> Back to Home </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDecisionsStore } from "@/stores/decisions";
import { useTheme } from "vuetify";
import { createShareableUrl, decodeDecision } from "@/utils/urlEncoding";
import { validateScales, validateWeights, calculateScores } from "@/utils/scoring";
import DimensionsTab from "@/components/DimensionsTab.vue";
import ScenariosTab from "@/components/ScenariosTab.vue";
import ScoresTab from "@/components/ScoresTab.vue";
import ResultsTab from "@/components/ResultsTab.vue";
import ResultsDisplay from "@/components/ResultsDisplay.vue";
import type { Decision, CalculationResult } from "@/types";

const props = defineProps<{ id: string }>();

const router = useRouter();
const route = useRoute();
const store = useDecisionsStore();
const theme = useTheme();

const decision = ref<Decision | null>(null);
const activeTab = ref("dimensions");
const showShareDialog = ref(false);
const shareableUrl = ref("");
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const viewMode = ref("tabs");

// Matrix view results
const matrixCalculationResult = ref<CalculationResult | null>(null);

const canCalculate = computed(() => {
    if (!decision.value) return false;
    const hasValidScales = validateScales(decision.value.dimensions);
    const hasValidWeights = validateWeights(decision.value.dimensions);
    return (
        decision.value.dimensions.length > 0 &&
        hasValidScales &&
        hasValidWeights &&
        decision.value.scenarios.length >= 2
    );
});

const canEnterScores = computed(() => {
    if (!decision.value) return false;
    // Check if all dimensions have valid scales and at least 2 scenarios exist
    const hasValidScales = validateScales(decision.value.dimensions);
    return decision.value.dimensions.length > 0 && hasValidScales && decision.value.scenarios.length >= 2;
});

const isMatrixValid = computed(() => {
    if (!decision.value) return false;

    // Check all dimensions have names and valid weights
    const validDimensions = decision.value.dimensions.every(
        d => d.name.trim() !== "" && d.weight >= 0 && d.weight <= 1,
    );

    // Check all scenarios have names
    const validScenarios = decision.value.scenarios.every(s => s.name.trim() !== "");

    // Check all dimensions have valid scales
    const hasValidScales = validateScales(decision.value.dimensions);

    return (
        validDimensions &&
        validScenarios &&
        hasValidScales &&
        validateWeights(decision.value.dimensions) &&
        decision.value.dimensions.length > 0 &&
        decision.value.scenarios.length >= 2
    );
});

const isDarkMode = computed(() => {
    return theme.global.name.value === "nordDark";
});

onMounted(() => {
    loadDecision();
});

watch(
    () => props.id,
    () => {
        loadDecision();
    },
);

function loadDecision() {
    // Check if this is from a shared URL
    const shareParam = route.query.share as string;
    if (shareParam) {
        try {
            const sharedDecision = decodeDecision(shareParam);
            store.importFromSharedUrl(sharedDecision);
            decision.value = sharedDecision;
            router.replace({ query: {} }); // Remove share param from URL
        } catch (error) {
            console.error("Failed to load shared decision:", error);
        }
    } else {
        const found = store.getDecisionById(props.id);
        if (found) {
            decision.value = found;
        }
    }
}

function goBack() {
    router.push("/");
}

function saveDecision() {
    console.log(decision.value);
    if (decision.value) {
        store.updateDecision(decision.value.id, decision.value);
    }
}

function shareDecision() {
    if (decision.value) {
        shareableUrl.value = createShareableUrl(decision.value);
        showShareDialog.value = true;
    }
}

function copyShareUrl() {
    navigator.clipboard.writeText(shareableUrl.value);
    showSnackbar.value = true;
    snackbarMessage.value = "URL copied to clipboard";
}

function duplicateDecision() {
    if (decision.value) {
        const duplicate = store.duplicateDecision(decision.value.id);
        if (duplicate) {
            router.push(`/decision/${duplicate.id}`);
        }
    }
}

function deleteDecision() {
    if (decision.value && confirm(`Delete "${decision.value.title}"? This cannot be undone.`)) {
        store.deleteDecision(decision.value.id);
        router.push("/");
    }
}

// Matrix view functions
function calculateMatrixResults() {
    if (!decision.value || !isMatrixValid.value) return;
    matrixCalculationResult.value = calculateScores(decision.value);
}

function getScenarioScore(dimId: string, scenarioId: string): number {
    const scenario = decision.value?.scenarios.find(s => s.id === scenarioId);
    return scenario?.scores[dimId] || 0;
}
</script>
