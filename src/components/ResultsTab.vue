<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>Results</v-col>
            <v-col cols="auto">
              <v-btn
                color="primary"
                prepend-icon="mdi-calculator"
                @click="calculate"
              >
                Calculate
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <v-card-text>
          <ResultsDisplay
            :calculation-result="calculationResult"
            empty-message="Click 'Calculate' to see results based on your dimensions, scenarios, and scores."
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ResultsDisplay from "@/components/ResultsDisplay.vue";
import type { CalculationResult, Decision } from "@/types";
import { calculateScores, validateWeights } from "@/utils/scoring";

const props = defineProps<{ decision: Decision }>();

const calculationResult = ref<CalculationResult | null>(null);

const weightsValid = computed(() => {
    return validateWeights(props.decision.dimensions);
});

function calculate() {
    if (!weightsValid.value) return;
    calculationResult.value = calculateScores(props.decision);
}
</script>
