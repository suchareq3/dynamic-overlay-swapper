import { Suspense, lazy, useEffect, useState } from "react";
import type React from "react";
import Pocketbase from "pocketbase";

// Initialize PocketBase client and authenticate (same as config panel)
const pb = new Pocketbase('http://127.0.0.1:8090');
await pb.collection("_superusers").authWithPassword(import.meta.env.VITE_BACKEND_ADMIN_EMAIL, import.meta.env.VITE_BACKEND_ADMIN_PASSWORD)

// Auto-import any TSX under app/components/**. The filename (without extension) must match `component_name`.
// Each component file should have a default export (the React component).
// Use a loose type to accommodate varying module shapes across matched files
type ModuleLoader = () => Promise<any>;
const COMPONENT_MODULES = import.meta.glob("../components/**/*.tsx") as Record<string, ModuleLoader>;

const findComponentImporter = (name: string): ModuleLoader | null => {
    // match filename (no extension) case-sensitively to the provided name
    const entries = Object.entries(COMPONENT_MODULES);
    for (const [path, importer] of entries) {
        const match = path.match(/([^/\\]+)\.tsx$/);
        const base = match?.[1];
        if (base === name) return importer;
    }
    return null;
};

export function Overlay() {
    const [active, setActive] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const loadActive = async () => {
        try {
            setLoading(true);
            const list = await pb.collection("overlays").getFullList({
                filter: "active = true",
                sort: "-updated",
            });
            setActive(list?.[0] ?? null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActive();
        pb.collection("overlays").subscribe("*", () => {
            loadActive();
        });
        return () => {
            try { pb.collection("overlays").unsubscribe("*"); } catch {}
        };
    }, []);

    if (loading) {
        return <div style={{ color: "#9aa", fontFamily: "sans-serif" }}>Loading overlay…</div>;
    }

    if (!active) {
        return <div style={{ color: "#9aa", fontFamily: "sans-serif" }}>No active overlay</div>;
    }

    if (active.type === "image" && active.image) {
        const url = pb.files.getURL(active, active.image);
        return (
            <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={url} alt={active.short_description} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
        );
    }

    if (active.type === "react-component") {
        const importer = findComponentImporter(active.component_name);
        if (!importer) {
            return (
                <div style={{ color: "#f99", fontFamily: "sans-serif", padding: 16 }}>
                    Component file "{active.component_name}.tsx" not found under `app/components/`.
                </div>
            );
        }
        // Wrap importer so React.lazy always receives { default: Component }
        const LazyComp = lazy(async () => {
            const mod = await importer();
            const Comp = (mod as any).default as React.ComponentType<any>;
            return { default: Comp };
        });
        return (
            <div style={{ width: "100vw", height: "100vh" }}>
                <Suspense fallback={<div style={{ color: "#9aa", fontFamily: "sans-serif" }}>Loading component…</div> }>
                    <LazyComp />
                </Suspense>
            </div>
        );
    }

    return <div />;
}