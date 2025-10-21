import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// Nord color palette
const nordColors = {
    // Polar Night (darkest to dark)
    nord0: "#2E3440",
    nord1: "#3B4252",
    nord2: "#434C5E",
    nord3: "#4C566A",
    // Snow Storm (light colors)
    nord4: "#D8DEE9",
    nord5: "#E5E9F0",
    nord6: "#ECEFF4",
    // Frost (blue accent colors)
    nord7: "#8FBCBB",
    nord8: "#88C0D0",
    nord9: "#81A1C1",
    nord10: "#5E81AC",
    // Aurora (vibrant accent colors)
    nord11: "#BF616A", // red
    nord12: "#D08770", // orange
    nord13: "#EBCB8B", // yellow
    nord14: "#A3BE8C", // green
    nord15: "#B48EAD", // purple
};

export default createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: "nordLight",
        themes: {
            nordLight: {
                dark: false,
                colors: {
                    background: nordColors.nord6,
                    surface: nordColors.nord5,
                    "surface-variant": nordColors.nord4,
                    primary: nordColors.nord10,
                    secondary: nordColors.nord3,
                    accent: nordColors.nord9,
                    error: nordColors.nord11,
                    info: nordColors.nord8,
                    success: nordColors.nord14,
                    warning: nordColors.nord12,
                    "on-background": nordColors.nord0,
                    "on-surface": nordColors.nord0,
                    "on-primary": nordColors.nord6,
                    "on-secondary": nordColors.nord6,
                    "on-error": nordColors.nord6,
                    "on-info": nordColors.nord0,
                    "on-success": nordColors.nord0,
                    "on-warning": nordColors.nord0,
                },
            },
            nordDark: {
                dark: true,
                colors: {
                    background: nordColors.nord0,
                    surface: nordColors.nord1,
                    "surface-variant": nordColors.nord2,
                    primary: nordColors.nord8,
                    secondary: nordColors.nord9,
                    accent: nordColors.nord7,
                    error: nordColors.nord11,
                    info: nordColors.nord8,
                    success: nordColors.nord14,
                    warning: nordColors.nord12,
                    "on-background": nordColors.nord6,
                    "on-surface": nordColors.nord6,
                    "on-primary": nordColors.nord0,
                    "on-secondary": nordColors.nord0,
                    "on-error": nordColors.nord6,
                    "on-info": nordColors.nord0,
                    "on-success": nordColors.nord0,
                    "on-warning": nordColors.nord0,
                },
            },
        },
    },
});
