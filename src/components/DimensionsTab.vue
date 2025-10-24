<template>
    <v-row>
        <v-col cols="12">
            <v-card>
                <v-card-title>
                    <v-row align="center">
                        <v-col>Dimensions</v-col>
                        <v-col cols="auto">
                            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
                                Add Dimension
                            </v-btn>
                            <v-btn
                                v-if="decision.dimensions.length > 0"
                                color="secondary"
                                prepend-icon="mdi-auto-fix"
                                :disabled="!canFillRemainingWeights"
                                class="ml-2"
                                @click="fillRemainingWeights"
                            >
                                Fill Remaining Weights
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-title>

                <v-card-text>
                    <v-alert v-if="!weightsValid" type="warning" class="mb-4">
                        Dimension weights must add up to exactly 1.00 (currently:
                        {{ formatNumber(totalWeight) }})
                    </v-alert>

                    <v-alert v-if="!scalesValid && decision.dimensions.length > 0" type="warning" class="mb-4">
                        All dimensions must have scale minimum and maximum values defined.
                    </v-alert>

                    <v-alert v-if="decision.dimensions.length === 0" type="info">
                        Add dimensions that factor into your decision. Each dimension should have a weight from 0.0 to
                        1.0, and all weights must sum to 1.0.
                    </v-alert>

                    <v-list v-if="decision.dimensions.length > 0">
                        <v-list-item v-for="(dimension, index) in decision.dimensions" :key="dimension.id" class="mb-2">
                            <v-card variant="outlined">
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12" md="4">
                                            <v-text-field
                                                v-model="dimension.name"
                                                label="Name"
                                                variant="outlined"
                                                density="comfortable"
                                                hide-details
                                                @blur="emitUpdate"
                                            />
                                        </v-col>
                                        <v-col cols="12" md="5">
                                            <v-textarea
                                                v-model="dimension.description"
                                                label="Description (optional)"
                                                variant="outlined"
                                                density="comfortable"
                                                hide-details
                                                rows="1"
                                                auto-grow
                                                @blur="emitUpdate"
                                            />
                                        </v-col>
                                        <v-col cols="12" md="3">
                                            <v-text-field
                                                v-model.number="dimension.weight"
                                                label="Weight"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                variant="outlined"
                                                density="comfortable"
                                                hide-details
                                                @blur="handleWeightChange(dimension)"
                                            />
                                        </v-col>
                                    </v-row>
                                    <v-row class="mt-2">
                                        <v-col cols="12" md="4">
                                            <v-text-field
                                                v-model.number="dimension.scaleMin"
                                                label="Scale Min"
                                                type="number"
                                                step="0.01"
                                                variant="outlined"
                                                density="comfortable"
                                                hide-details
                                                @blur="emitUpdate"
                                            />
                                        </v-col>
                                        <v-col cols="12" md="4">
                                            <v-text-field
                                                v-model.number="dimension.scaleMax"
                                                label="Scale Max"
                                                type="number"
                                                step="0.01"
                                                variant="outlined"
                                                density="comfortable"
                                                hide-details
                                                @blur="emitUpdate"
                                            />
                                        </v-col>
                                        <v-col cols="12" md="4" class="d-flex align-center">
                                            <v-btn color="error" variant="text" @click="deleteDimension(index)">
                                                <v-icon>mdi-delete</v-icon>
                                                Delete
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <!-- Add Dimension Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600">
        <v-card>
            <v-card-title>Add Dimension</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="newDimension.name"
                    label="Name"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                />
                <v-textarea
                    v-model="newDimension.description"
                    label="Description (optional)"
                    variant="outlined"
                    density="comfortable"
                    rows="2"
                    class="mb-3"
                />
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model.number="newDimension.weight"
                            label="Weight"
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            variant="outlined"
                            density="comfortable"
                        />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model.number="newDimension.scaleMin"
                            label="Scale Min"
                            type="number"
                            step="0.01"
                            variant="outlined"
                            density="comfortable"
                        />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model.number="newDimension.scaleMax"
                            label="Scale Max"
                            type="number"
                            step="0.01"
                            variant="outlined"
                            density="comfortable"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="showAddDialog = false"> Cancel </v-btn>
                <v-btn color="primary" :disabled="!newDimension.name" @click="addDimension"> Add </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar
        v-model="showSnackbar"
        color="surface"
        :text-color="isDarkMode ? 'primary' : 'on-surface'"
        class="text-center"
    >
        <div class="text-center">
            {{ snackbarMessage }}
        </div>
    </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDecisionsStore } from "@/stores/decisions";
import { useTheme } from "vuetify";
import { validateWeights, validateScales, formatNumber, distributeRemainingWeight } from "@/utils/scoring";
import type { Decision, Dimension } from "@/types";

const props = defineProps<{ decision: Decision }>();
const emit = defineEmits<{ update: [] }>();

const store = useDecisionsStore();
const theme = useTheme();

const showAddDialog = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref("");

const newDimension = ref({
    name: "",
    description: "",
    weight: 0.0,
    scaleMin: 0.0,
    scaleMax: 10.0,
});

const totalWeight = computed(() => {
    return props.decision.dimensions.reduce((sum, dim) => sum + dim.weight, 0);
});

const weightsValid = computed(() => {
    return validateWeights(props.decision.dimensions);
});

const scalesValid = computed(() => {
    return validateScales(props.decision.dimensions);
});

const canFillRemainingWeights = computed(() => {
    return props.decision.dimensions.some(dim => dim.weight === 0);
});

const isDarkMode = computed(() => {
    return theme.global.name.value === "nordDark";
});

function emitUpdate() {
    emit("update");
}

function handleWeightChange(dimension: Dimension) {
    dimension.weight = parseFloat(dimension.weight.toFixed(2));
    emitUpdate();
}

function addDimension() {
    store.addDimension(props.decision.id, {
        name: newDimension.value.name,
        description: newDimension.value.description,
        weight: parseFloat(newDimension.value.weight.toFixed(2)),
        scaleMin: parseFloat(newDimension.value.scaleMin.toFixed(2)),
        scaleMax: parseFloat(newDimension.value.scaleMax.toFixed(2)),
    });

    newDimension.value = {
        name: "",
        description: "",
        weight: 0.0,
        scaleMin: 0.0,
        scaleMax: 10.0,
    };
    showAddDialog.value = false;
    emitUpdate();
}

function deleteDimension(index: number) {
    const dimension = props.decision.dimensions[index];
    if (confirm(`Delete dimension "${dimension.name}"?`)) {
        store.deleteDimension(props.decision.id, dimension.id);
        emitUpdate();
    }
}

function fillRemainingWeights() {
    // Find dimensions with 0 weight
    const zeroWeightIndices = props.decision.dimensions
        .map((dim, idx) => (dim.weight === 0 ? idx : -1))
        .filter(idx => idx !== -1);

    if (zeroWeightIndices.length === 0) {
        snackbarMessage.value = "No dimensions with 0 weight found";
        showSnackbar.value = true;
        return;
    }

    // Calculate remaining weight BEFORE updating
    const totalRemaining = 1.0 - totalWeight.value;

    const newWeights = distributeRemainingWeight(props.decision.dimensions, zeroWeightIndices);

    props.decision.dimensions.forEach((dim, idx) => {
        store.updateDimension(props.decision.id, dim.id, { weight: newWeights[idx] });
    });

    snackbarMessage.value = `Distributed ${formatNumber(totalRemaining)} weight to ${zeroWeightIndices.length} dimension${
        zeroWeightIndices.length > 1 ? "s" : ""
    }`;
    showSnackbar.value = true;

    emitUpdate();
}
</script>
