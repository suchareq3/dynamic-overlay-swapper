import { Suspense, lazy, useEffect, useState } from "react";
import type React from "react";
import Pocketbase from "pocketbase";
import { useTranslation } from "react-i18next";

const pb = new Pocketbase('http://127.0.0.1:8090');
await pb.collection("_superusers").authWithPassword(import.meta.env.VITE_BACKEND_ADMIN_EMAIL, import.meta.env.VITE_BACKEND_ADMIN_PASSWORD)

// Auto-import any TSX under app/components/**. The filename (without extension) must match `component_name`.
// Each component file should have a default export (the React component).
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
    const { t, i18n } = useTranslation();

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
        return <p className="text-2xl">{t("overlay.loading_overlay")}</p>;
    }

    if (!active) {
        return <p className="text-2xl">{t("overlay.inactive")}</p>;
    }

    if (active.type === "image" && active.image) {
        const url = pb.files.getURL(active, active.image);
        return (
            <div className="w-full h-full flex items-center justify-center">
                <img src={url} alt={active.short_description} className="max-w-full max-h-full object-contain" />
            </div>
        );
    }

    if (active.type === "react-component") {
        const importer = findComponentImporter(active.component_name);

        if (!importer) {
            return (
                <p className="text-2xl text-red-500">
                    {t("overlay.componentNotFound", { name: active.component_name })}
                </p>
            );
        }

        const LazyComp = lazy(async () => {
            const mod = await importer();
            const Comp = (mod as any).default as React.ComponentType<any>;
            return { default: Comp };
        });

        return (
            <div className="w-full h-full">
                <Suspense fallback={<p className="text-2xl">{t("overlay.loading_component")}</p>}>
                    <LazyComp />
                </Suspense>
            </div>
        );
    }

    return <div />;
}