import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import DecisionView from "@/views/DecisionView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: Home,
        },
        {
            path: "/decision/:id",
            name: "decision",
            component: DecisionView,
            props: true,
        },
    ],
});

export default router;
