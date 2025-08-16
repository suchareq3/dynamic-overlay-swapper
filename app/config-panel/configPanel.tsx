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
import { Card } from "primereact/card";

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
                fetchOverlays();
            });
        });
        return () => {
            try { pb.collection("overlays").unsubscribe() } catch {}
        };
    }, []);

    const handleActivate = async (record: any) => {
        try {
            await pb.collection("overlays").update(record.id, { active: true });
            toast.current?.show({ severity: "success", summary: "Activated", detail: `Overlay activated: ${record.short_description}` });
        } catch (err: any) {
            console.error(err);
            toast.current?.show({ severity: "error", summary: "Error", detail: err?.message || "Failed to change active overlay" });
        }
    };

    const confirmActivate = (record: any) => {
        confirmDialog({
            message: `Set "${record.short_description}" as the active overlay? This will deactivate any other active overlay.`,
            header: "Activate overlay?",
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
            message: `Delete the "${record.short_description}" overlay? This cannot be undone.`,
            header: "Delete overlay?",
            acceptLabel: "Delete",
            rejectLabel: "Cancel",
            acceptClassName: "p-button-danger",
            accept: () => handleDelete(record),
        });
    };

    const getImageBody = (row: any) => {
        if (!row?.image) return <span className="text-gray-500">N/A</span>;
        const url = pb.files.getURL(row, row.image);
        return <img src={url} alt={row.short_description} style={{ width: 144, height: 81, objectFit: "cover", borderRadius: 0 }} />;
    };
    
    const actionsBody = (row: any) => (
        <div className="flex gap-2">
            <Button label="Activate" severity="success" onClick={() => confirmActivate(row)} disabled={row.active} />
            <Button label="Delete" severity="danger" onClick={() => confirmDelete(row)} />
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
            <Card title="Create new overlay" className="w-80">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col">
                        <label htmlFor="short_description" className="text-sm">Short description</label>
                        <InputText
                            id="short_description"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder="e.g. Cheer overlay"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="type" className="text-sm">Type</label>
                        <Dropdown
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.value)}
                            options={typeOptions}
                            placeholder="Select type"
                        />
                    </div>

                    {type === "react-component" && (
                        <div className="flex flex-col">
                            <label htmlFor="component_name" className="text-sm">Component name<i className="pi pi-question-circle text-sm! ml-1"></i></label>
                            <InputText
                                id="component_name"
                                value={componentName}
                                onChange={(e) => setComponentName(e.target.value)}
                                placeholder="e.g. ConfettiOverlay"
                            />
                        </div>
                    )}

                    {type === "image" && (
                        <div className="">
                            <label className="text-sm">Image (PNG/GIF)</label>
                            <FileUpload
                                name="image"
                                mode="basic"
                                auto={false}
                                customUpload={false}
                                accept="image/png,image/gif"
                                onSelect={(e) => setImageFile((e.files && e.files[0]) || null)}
                                onClear={() => setImageFile(null)}
                            />
                        </div>
                    )}

                    <Button
                        className="w-fit mt-6!"
                        label={submitting ? "Submitting..." : "Create Overlay"}
                        onClick={handleSubmit}
                        disabled={submitting}
                        icon="pi pi-plus"
                    />
                </div>
            </Card>

            {/* Select overlay */}
            <div>
                <h1>Select Overlay</h1>
                <DataTable value={overlays} loading={loadingOverlays} paginator rows={10} responsiveLayout="scroll" emptyMessage="No overlays found">
                    <Column field="short_description" header="Short Description" sortable></Column>
                    <Column field="type" header="Type" sortable></Column>
                    <Column field="component_name" header="Component Name" sortable></Column>
                    <Column header="Image" body={getImageBody}></Column>
                    <Column field="active" header="Active"  sortable></Column>
                    <Column header="Actions" body={actionsBody} style={{ width: 220 }}></Column>
                </DataTable>
            </div>
        </div>
    )
}