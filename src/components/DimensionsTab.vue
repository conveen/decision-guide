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
                                class="ml-2"
                                @click="showBatchAdjustDialog = true"
                            >
                                Batch Adjust Weights
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
                <v-btn @click="showAddDialog = false">Cancel</v-btn>
                <v-btn color="primary" :disabled="!newDimension.name" @click="addDimension">Add</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Batch Adjust Weights Dialog -->
    <v-dialog v-model="showBatchAdjustDialog" max-width="600">
        <v-card>
            <v-card-title>Batch Adjust Weights</v-card-title>
            <v-card-text>
                <p class="mb-4">
                    Select dimensions to adjust, and the remaining weight will be distributed equally among them.
                </p>
                <v-list>
                    <v-list-item v-for="(dimension, index) in decision.dimensions" :key="dimension.id">
                        <v-checkbox
                            v-model="selectedDimensionsForBatch"
                            :value="index"
                            :label="`${dimension.name} (current: ${formatNumber(dimension.weight)})`"
                            hide-details
                        />
                    </v-list-item>
                </v-list>
                <v-divider class="my-4" />
                <p class="text-body-2">
                    Remaining weight: {{ formatNumber(remainingWeight) }}<br />
                    Equal share per selected dimension: {{ formatNumber(equalShare) }}
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="showBatchAdjustDialog = false">Cancel</v-btn>
                <v-btn
                    color="primary"
                    :disabled="selectedDimensionsForBatch.length === 0"
                    @click="applyBatchAdjustment"
                >
                    Apply
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDecisionsStore } from "@/stores/decisions";
import { validateWeights, validateScales, formatNumber, distributeRemainingWeight } from "@/utils/scoring";
import type { Decision, Dimension } from "@/types";

const props = defineProps<{ decision: Decision }>();
const emit = defineEmits<{ update: [] }>();

const store = useDecisionsStore();

const showAddDialog = ref(false);
const showBatchAdjustDialog = ref(false);
const selectedDimensionsForBatch = ref<number[]>([]);

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

const remainingWeight = computed(() => {
    const used = selectedDimensionsForBatch.value.reduce((sum, idx) => sum + props.decision.dimensions[idx].weight, 0);
    return 1.0 - used;
});

const equalShare = computed(() => {
    if (selectedDimensionsForBatch.value.length === 0) return 0;
    return remainingWeight.value / selectedDimensionsForBatch.value.length;
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

function applyBatchAdjustment() {
    const newWeights = distributeRemainingWeight(props.decision.dimensions, selectedDimensionsForBatch.value);

    props.decision.dimensions.forEach((dim, idx) => {
        store.updateDimension(props.decision.id, dim.id, { weight: newWeights[idx] });
    });

    showBatchAdjustDialog.value = false;
    selectedDimensionsForBatch.value = [];
    emitUpdate();
}
</script>
