import { useState, useRef, useEffect } from "react";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Pocketbase, { ClientResponseError } from "pocketbase";

const pb = new Pocketbase('http://127.0.0.1:8090');
await pb.collection("_superusers").authWithPassword(import.meta.env.VITE_BACKEND_ADMIN_EMAIL, import.meta.env.VITE_BACKEND_ADMIN_PASSWORD)

export function ConfigPanel() {
    const [shortDescription, setShortDescription] = useState("");
    const [type, setType] = useState<"image" | "react-component" | "">("");
    const [componentName, setComponentName] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [overlays, setOverlays] = useState<any[]>([]);
    const [loadingOverlays, setLoadingOverlays] = useState(false);
    const toast = useRef<Toast>(null);

    const typeOptions = [
        { label: "Image", value: "image" },
        { label: "React Component", value: "react-component" },
    ];

    const fetchOverlays = async () => {
        try {
            setLoadingOverlays(true);
            // pull all records; adjust per your collection rules/pagination
            const res = await pb.collection("overlays").getFullList({ sort: "-created" });
            setOverlays(res);
        } catch (err) {
            // allow intended auto-cancellation errors - https://github.com/pocketbase/pocketbase/discussions/3491
            if (err instanceof ClientResponseError && !err.isAbort) {
                console.error(err);
                toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load overlays" });
            }
        } finally {
            setLoadingOverlays(false);
        }
    };

    useEffect(() => {
        // initial load
        fetchOverlays().then(() => {
            pb.collection("overlays").subscribe("*", () => {
                // simplest: re-fetch on any change
                pb.can
                fetchOverlays();
            });
        });
        // subscribe to realtime changes
        
        return () => {
            try { pb.collection("overlays").unsubscribe() } catch {}
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ensureSingleActive = async (targetId: string) => {
        // Deactivate any other active overlays, then activate target
        const currentActive = overlays.filter((o) => o.active && o.id !== targetId);
        for (const rec of currentActive) {
            try { await pb.collection("overlays").update(rec.id, { active: false }); } catch (e) { console.error(e); }
        }
    };

    const handleActivate = async (record: any) => {
        try {
            await ensureSingleActive(record.id);
            await pb.collection("overlays").update(record.id, { active: true });
            toast.current?.show({ severity: "success", summary: "Activated", detail: `Activated: ${record.short_description}` });
        } catch (err: any) {
            console.error(err);
            toast.current?.show({ severity: "error", summary: "Error", detail: err?.message || "Failed to activate" });
        }
    };

    const confirmActivate = (record: any) => {
        confirmDialog({
            message: `Set "${record.short_description}" as active? This will deactivate any other active overlay.`,
            header: "Confirm Activate",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Activate",
            rejectLabel: "Cancel",
            acceptClassName: "p-button-success",
            accept: () => handleActivate(record),
        });
    };

    const handleDelete = async (record: any) => {
        try {
            await pb.collection("overlays").delete(record.id);
            toast.current?.show({ severity: "success", summary: "Deleted", detail: `Deleted: ${record.short_description}` });
        } catch (err: any) {
            console.error(err);
            toast.current?.show({ severity: "error", summary: "Error", detail: err?.message || "Failed to delete" });
        }
    };

    const confirmDelete = (record: any) => {
        confirmDialog({
            message: `Delete "${record.short_description}"? This cannot be undone.`,
            header: "Confirm Delete",
            icon: "pi pi-trash",
            acceptLabel: "Delete",
            rejectLabel: "Cancel",
            acceptClassName: "p-button-danger",
            accept: () => handleDelete(record),
        });
    };

    const imageBody = (row: any) => {
        if (!row?.image) return <span style={{ opacity: 0.6 }}>—</span>;
        const url = pb.files.getURL(row, row.image);
        return <img src={url} alt={row.short_description} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }} />;
    };

    const activeBody = (row: any) => <span>{row.active ? "true" : "false"}</span>;

    const actionsBody = (row: any) => (
        <div className="p-d-flex p-ai-center p-gap-2" style={{ display: "flex", gap: 8 }}>
            <Button label="Activate" icon="pi pi-check" severity="success" outlined onClick={() => confirmActivate(row)} disabled={row.active} />
            <Button label="Delete" icon="pi pi-trash" severity="danger" outlined onClick={() => confirmDelete(row)} />
        </div>
    );

    const handleSubmit = async () => {
        try {
            // basic validation
            if (!shortDescription.trim()) {
                toast.current?.show({ severity: "warn", summary: "Validation", detail: "Short description is required" });
                return;
            }
            if (!type) {
                toast.current?.show({ severity: "warn", summary: "Validation", detail: "Type is required" });
                return;
            }
            if (type === "react-component" && !componentName.trim()) {
                toast.current?.show({ severity: "warn", summary: "Validation", detail: "Component name is required for React component overlays" });
                return;
            }
            if (type === "image" && !imageFile) {
                toast.current?.show({ severity: "warn", summary: "Validation", detail: "Please choose a PNG or GIF image" });
                return;
            }

            setSubmitting(true);

            const formData = new FormData();
            formData.append("short_description", shortDescription);
            formData.append("type", type);
            formData.append("component_name", componentName);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            await pb.collection("overlays").create(formData);

            toast.current?.show({ severity: "success", summary: "Created", detail: "Overlay created successfully" });
            // reset form
            setShortDescription("");
            setType("");
            setComponentName("");
            setImageFile(null);
            // refresh list (subscription will also catch it, but do immediate refresh for responsiveness)
            fetchOverlays();
        } catch (err: any) {
            console.error(err);
            const detail = err?.message || "Failed to create overlay";
            toast.current?.show({ severity: "error", summary: "Error", detail });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Toast ref={toast} />
            <ConfirmDialog />
            {/* Create new overlay */}
            <div>
                <h1>Create New Overlay</h1>
                <div className="p-fluid p-formgrid p-grid" style={{ maxWidth: 640 }}>
                    <div className="p-field p-col-12">
                        <label htmlFor="short_description">Short description</label>
                        <InputText
                            id="short_description"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder="e.g. Cheer overlay"
                        />
                    </div>

                    <div className="p-field p-col-12">
                        <label htmlFor="type">Type</label>
                        <Dropdown
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.value)}
                            options={typeOptions}
                            placeholder="Select type"
                        />
                    </div>

                    {type === "react-component" && (
                        <div className="p-field p-col-12">
                            <label htmlFor="component_name">Component name</label>
                            <InputText
                                id="component_name"
                                value={componentName}
                                onChange={(e) => setComponentName(e.target.value)}
                                placeholder="e.g. ConfettiOverlay"
                            />
                        </div>
                    )}

                    {type === "image" && (
                        <div className="p-field p-col-12">
                            <label>Image (PNG/GIF)</label>
                            <FileUpload
                                name="image"
                                mode="basic"
                                auto={false}
                                customUpload={false}
                                accept="image/png,image/gif"
                                chooseLabel={imageFile ? imageFile.name : "Choose"}
                                onSelect={(e) => setImageFile((e.files && e.files[0]) || null)}
                                onClear={() => setImageFile(null)}
                            />
                        </div>
                    )}

                    <div className="p-field p-col-12" style={{ marginTop: 8 }}>
                        <Button
                            label={submitting ? "Submitting..." : "Create Overlay"}
                            onClick={handleSubmit}
                            disabled={submitting}
                            icon="pi pi-plus"
                        />
                    </div>
                </div>
            </div>

            {/* Select overlay */}
            <div>
                <h1>Select Overlay</h1>
                <DataTable value={overlays} loading={loadingOverlays} paginator rows={10} responsiveLayout="scroll" emptyMessage="No overlays found">
                    <Column field="short_description" header="Short Description" sortable></Column>
                    <Column field="type" header="Type" sortable></Column>
                    <Column field="component_name" header="Component Name" sortable></Column>
                    <Column header="Image" body={imageBody}></Column>
                    <Column field="active" header="Active" body={activeBody} sortable></Column>
                    <Column header="Actions" body={actionsBody} style={{ width: 220 }}></Column>
                </DataTable>
            </div>
        </div>
    )
}