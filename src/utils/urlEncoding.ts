import pako from "pako";
import type { Decision } from "@/types";

/**
 * Encode a decision into a shareable URL parameter
 */
export function encodeDecision(decision: Decision): string {
    try {
        const json = JSON.stringify(decision);
        const compressed = pako.deflate(json);
        const base64 = btoa(String.fromCharCode(...compressed));
        return encodeURIComponent(base64);
    } catch (error) {
        console.error("Error encoding decision:", error);
        throw new Error("Failed to encode decision");
    }
}

/**
 * Decode a decision from a URL parameter
 */
export function decodeDecision(encoded: string): Decision {
    try {
        const base64 = decodeURIComponent(encoded);
        const compressed = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const json = pako.inflate(compressed, { to: "string" });
        return JSON.parse(json);
    } catch (error) {
        console.error("Error decoding decision:", error);
        throw new Error("Failed to decode decision");
    }
}

/**
 * Create a shareable URL for a decision
 */
export function createShareableUrl(decision: Decision): string {
    const encoded = encodeDecision(decision);
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/decision/${decision.id}?share=${encoded}`;
}
