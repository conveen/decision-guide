<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h3 mb-4">My Decisions</h1>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="searchQuery"
                    label="Search decisions"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    clearable
                />
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end">
                <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true"> New Decision </v-btn>
                <v-btn color="secondary" prepend-icon="mdi-import" class="ml-2" @click="showImportDialog = true">
                    Import
                </v-btn>
                <v-btn
                    color="secondary"
                    prepend-icon="mdi-export"
                    class="ml-2"
                    :disabled="decisions.length === 0"
                    @click="exportAllDecisions"
                >
                    Export All
                </v-btn>
            </v-col>
        </v-row>

        <v-row v-if="filteredDecisions.length === 0">
            <v-col cols="12">
                <v-card>
                    <v-card-text class="text-center pa-8">
                        <v-icon size="64" color="grey">mdi-scale-balance</v-icon>
                        <p class="text-h6 mt-4">No decisions found</p>
                        <p class="text-body-2 text-grey">
                            {{
                                searchQuery ? "Try adjusting your search" : "Create your first decision to get started"
                            }}
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-else>
            <v-col v-for="decision in filteredDecisions" :key="decision.id" cols="12" md="6" lg="4">
                <v-card hover @click="openDecision(decision.id)">
                    <v-card-title>{{ decision.title }}</v-card-title>
                    <v-card-subtitle v-if="decision.description">{{ decision.description }}</v-card-subtitle>
                    <v-card-text>
                        <div class="text-caption mb-2">
                            <v-icon size="small">mdi-chart-box-outline</v-icon>
                            {{ decision.dimensions.length }} dimension{{ decision.dimensions.length !== 1 ? "s" : "" }}
                        </div>
                        <div class="text-caption mb-2">
                            <v-icon size="small">mdi-compare</v-icon>
                            {{ decision.scenarios.length }} scenario{{ decision.scenarios.length !== 1 ? "s" : "" }}
                        </div>
                        <div class="text-caption text-grey">Updated {{ formatDate(decision.updatedAt) }}</div>
                    </v-card-text>
                    <v-card-actions>
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-btn icon="mdi-dots-vertical" size="small" v-bind="props" @click.stop></v-btn>
                            </template>
                            <v-list>
                                <v-list-item @click.stop="duplicateDecisionHandler(decision.id)">
                                    <v-list-item-title>
                                        <v-icon start>mdi-content-copy</v-icon>
                                        Duplicate
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-spacer />
                        <v-btn size="small" color="error" @click.stop="confirmDelete(decision)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Create Decision Dialog -->
        <v-dialog v-model="showCreateDialog" max-width="500">
            <v-card>
                <v-card-title>Create New Decision</v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="newDecisionTitle"
                        label="Title"
                        variant="outlined"
                        density="comfortable"
                        :rules="[v => !!v || 'Title is required']"
                    />
                    <v-textarea
                        v-model="newDecisionDescription"
                        label="Description (optional)"
                        variant="outlined"
                        density="comfortable"
                        rows="3"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="showCreateDialog = false">Cancel</v-btn>
                    <v-btn color="primary" :disabled="!newDecisionTitle" @click="createNewDecision"> Create </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="showDeleteDialog" max-width="400">
            <v-card>
                <v-card-title>Delete Decision?</v-card-title>
                <v-card-text>
                    Are you sure you want to delete "{{ decisionToDelete?.title }}"? This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
                    <v-btn color="error" @click="deleteDecisionHandler">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Import Dialog -->
        <v-dialog v-model="showImportDialog" max-width="500">
            <v-card>
                <v-card-title>Import Decisions</v-card-title>
                <v-card-text>
                    <v-file-input
                        v-model="importFile"
                        label="Select JSON file"
                        accept=".json"
                        variant="outlined"
                        density="comfortable"
                        prepend-icon="mdi-file-upload"
                    />
                    <v-alert v-if="importError" type="error" class="mt-2">{{ importError }}</v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="closeImportDialog">Cancel</v-btn>
                    <v-btn color="primary" :disabled="!importFile" @click="importDecisionsHandler"> Import </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="showSnackbar" :timeout="3000">
            {{ snackbarMessage }}
        </v-snackbar>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useDecisionsStore } from "@/stores/decisions";
import type { Decision } from "@/types";

const router = useRouter();
const store = useDecisionsStore();

const searchQuery = ref("");
const showCreateDialog = ref(false);
const newDecisionTitle = ref("");
const newDecisionDescription = ref("");
const showDeleteDialog = ref(false);
const decisionToDelete = ref<Decision | null>(null);
const showImportDialog = ref(false);
const importFile = ref<File[] | null>(null);
const importError = ref("");
const showSnackbar = ref(false);
const snackbarMessage = ref("");

const decisions = computed(() => store.decisions);

const filteredDecisions = computed(() => {
    if (!searchQuery.value) return decisions.value;

    const query = searchQuery.value.toLowerCase();
    return decisions.value.filter(
        d => d.title.toLowerCase().includes(query) || d.description.toLowerCase().includes(query),
    );
});

function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
}

function openDecision(id: string) {
    router.push(`/decision/${id}`);
}

function createNewDecision() {
    const decision = store.createDecision(newDecisionTitle.value, newDecisionDescription.value);
    showCreateDialog.value = false;
    newDecisionTitle.value = "";
    newDecisionDescription.value = "";
    router.push(`/decision/${decision.id}`);
}

function confirmDelete(decision: Decision) {
    decisionToDelete.value = decision;
    showDeleteDialog.value = true;
}

function deleteDecisionHandler() {
    if (decisionToDelete.value) {
        store.deleteDecision(decisionToDelete.value.id);
        showSnackbar.value = true;
        snackbarMessage.value = "Decision deleted";
    }
    showDeleteDialog.value = false;
    decisionToDelete.value = null;
}

function duplicateDecisionHandler(id: string) {
    const duplicate = store.duplicateDecision(id);
    if (duplicate) {
        showSnackbar.value = true;
        snackbarMessage.value = "Decision duplicated";
        router.push(`/decision/${duplicate.id}`);
    }
}

function exportAllDecisions() {
    const decisions = store.exportDecisions();
    const json = JSON.stringify(decisions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decisions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showSnackbar.value = true;
    snackbarMessage.value = "Decisions exported";
}

function importDecisionsHandler() {
    if (!importFile.value) {
        importError.value = "Please select a file";
        return;
    }

    const file = importFile.value;
    if (!file) {
        importError.value = "Invalid file selection";
        return;
    }
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
            const json = e.target?.result as string;
            const decisions = JSON.parse(json);

            if (!Array.isArray(decisions)) {
                importError.value = "Invalid file format: expected an array of decisions";
                return;
            }

            store.importDecisions(decisions);
            showSnackbar.value = true;
            snackbarMessage.value = `Imported ${decisions.length} decision(s)`;
            closeImportDialog();
        } catch (error) {
            importError.value = "Invalid file format: failed to parse as JSON";
        }
    };

    reader.readAsText(file);
}

function closeImportDialog() {
    showImportDialog.value = false;
    importFile.value = null;
    importError.value = "";
}
</script>
