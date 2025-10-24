<template>
    <v-row>
        <v-col cols="12">
            <v-card>
                <v-card-title>
                    <v-row align="center">
                        <v-col>Scenarios</v-col>
                        <v-col cols="auto">
                            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
                                Add Scenario
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-title>

                <v-card-text>
                    <v-row v-if="decision.scenarios.length > 0">
                        <v-col v-for="scenario in decision.scenarios" :key="scenario.id" cols="12" md="6" lg="4">
                            <v-card variant="outlined">
                                <v-card-title>
                                    <v-text-field
                                        v-model="scenario.name"
                                        variant="plain"
                                        density="comfortable"
                                        hide-details
                                        @blur="emitUpdate"
                                    />
                                </v-card-title>
                                <v-card-text>
                                    <v-textarea
                                        v-model="scenario.notes"
                                        label="Notes (optional)"
                                        variant="outlined"
                                        density="comfortable"
                                        rows="3"
                                        auto-grow
                                        @blur="emitUpdate"
                                    />
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer />
                                    <v-btn color="error" variant="text" @click="deleteScenario(scenario)">
                                        <v-icon>mdi-delete</v-icon>
                                        Delete
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <!-- Add Scenario Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
        <v-card>
            <v-card-title>Add Scenario</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="newScenario.name"
                    label="Name"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                />
                <v-textarea
                    v-model="newScenario.notes"
                    label="Notes (optional)"
                    variant="outlined"
                    density="comfortable"
                    rows="3"
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="showAddDialog = false"> Cancel </v-btn>
                <v-btn color="primary" :disabled="!newScenario.name" @click="addScenario"> Add </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDecisionsStore } from "@/stores/decisions";
import type { Decision, Scenario } from "@/types";

const props = defineProps<{ decision: Decision }>();
const emit = defineEmits<{ update: [] }>();

const store = useDecisionsStore();

const showAddDialog = ref(false);
const newScenario = ref({
    name: "",
    notes: "",
});

function emitUpdate() {
    emit("update");
}

function addScenario() {
    store.addScenario(props.decision.id, {
        name: newScenario.value.name,
        notes: newScenario.value.notes,
    });

    newScenario.value = {
        name: "",
        notes: "",
    };
    showAddDialog.value = false;
    emitUpdate();
}

function deleteScenario(scenario: Scenario) {
    if (confirm(`Delete scenario "${scenario.name}"?`)) {
        store.deleteScenario(props.decision.id, scenario.id);
        emitUpdate();
    }
}
</script>
