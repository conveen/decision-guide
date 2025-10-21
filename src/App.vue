<template>
    <v-app>
        <v-app-bar color="primary" prominent>
            <v-app-bar-nav-icon @click="goHome">
                <v-icon>mdi-scale-balance</v-icon>
            </v-app-bar-nav-icon>
            <v-toolbar-title @click="goHome" style="cursor: pointer">Decision Guide</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn
                :icon="isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
                @click="toggleTheme"
                :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            ></v-btn>
        </v-app-bar>

        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { computed, onMounted } from "vue";

const router = useRouter();
const theme = useTheme();

// Check if we"re in dark mode
const isDarkMode = computed(() => theme.global.name.value === "nordDark");

// Load theme preference from localStorage on mount
onMounted(() => {
    const savedTheme = localStorage.getItem("theme-preference");
    if (savedTheme) {
        theme.global.name.value = savedTheme;
    }
});

const goHome = () => {
    router.push("/");
};

const toggleTheme = () => {
    theme.global.name.value = isDarkMode.value ? "nordLight" : "nordDark";
    // Save theme preference to localStorage
    localStorage.setItem("theme-preference", theme.global.name.value);
};
</script>

<style scoped>
/* Smooth transition for theme changes */
:deep(.v-application) {
    transition:
        background-color 0.3s ease,
        color 0.3s ease;
}

:deep(.v-app-bar) {
    transition:
        background-color 0.3s ease,
        color 0.3s ease;
}

:deep(.v-btn) {
    transition: all 0.3s ease;
}
</style>
