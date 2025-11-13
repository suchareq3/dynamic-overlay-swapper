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
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import { Tooltip } from "primereact/tooltip";
import { useHref } from "react-router";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useDebounce } from "primereact/hooks";

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
    const [paramsDialogOpen, setParamsDialogOpen] = useState(false);
    const [paramsOverlay, setParamsOverlay] = useState<any | null>(null);
    const [paramsRows, setParamsRows] = useState<{ key: string; value: string; _id: string; }[]>([]);
    const [savingParams, setSavingParams] = useState(false);
    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const overlayHref = useHref("/overlay");
    
    const { t, i18n } = useTranslation();

    type LanguageOption = { code: 'en' | 'pl'; name: string; flag: string };
    const languageOptions: LanguageOption[] = [
        { code: 'en', name: t("config_panel.english"), flag: '🇬🇧' },
        { code: 'pl', name: t("config_panel.polish"), flag: '🇵🇱' },
    ];
    const langItemTemplate = (option: LanguageOption) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{option.flag}</span>
          <span>{option.name}</span>
        </div>
    );  
    const langValueTemplate = (option: LanguageOption) => (
        <span className="text-xl">{option?.flag}</span>
    );
    const selectedLang = languageOptions.find(l => l.code === i18n.language);

    const typeOptions = [
        { label: t("config_panel.image"), value: "image" },
        { label: t("config_panel.react_component"), value: "react-component" },
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
                toast.current?.show({ severity: "error", summary: t("config_panel.error"), detail: t("config_panel.overlay_load_error") });
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
            toast.current?.show({ severity: "success", summary: t("config_panel.activated"), detail: t("config_panel.overlay_activated", { overlay: record.short_description }) });
        } catch (err: any) {
            console.error(err);
            toast.current?.show({ severity: "error", summary: t("config_panel.error"), detail: err?.message || t("config_panel.overlay_activation_failed") });
        }
    };

    const confirmActivate = (record: any) => {
        confirmDialog({
            message: t("config_panel.activate_overlay_confirm", { overlay: record.short_description }),
            header: t("config_panel.activate_overlay_header"),
            acceptLabel: t("config_panel.activate"),
            rejectLabel: t("config_panel.cancel"),
            accept: () => handleActivate(record),
        });
    };

    const handleDeactivate = async (record: any) => {
        try {
            await pb.collection("overlays").update(record.id, { active: false });
            toast.current?.show({ severity: "success", summary: t("config_panel.deactivated"), detail: t("config_panel.overlay_deactivated", { overlay: record.short_description }) });
        } catch (err: any) {
            console.error(err);
            toast.current?.show({ severity: "error", summary: t("config_panel.error"), detail: err?.message || t("config_panel.overlay_deactivation_failed") });
        }
    };

    const confirmDeactivate = (record: any) => {
        confirmDialog({
            message: t("config_panel.deactivate_overlay_confirm", { overlay: record.short_description }),
            header: t("config_panel.deactivate_overlay_header"),
            acceptLabel: t("config_panel.deactivate"),
            rejectLabel: t("config_panel.cancel"),
            acceptClassName: "p-button-warning",
            accept: () => handleDeactivate(record),
        });
    };

    const handleDelete = async (record: any) => {
        try {
            await pb.collection("overlays").delete(record.id);
            toast.current?.show({ severity: "success", summary: t("config_panel.deleted"), detail: t("config_panel.overlay_deleted", { overlay: record.short_description }) });
        } catch (err: any) {
            console.error(err);
            toast.current?.show({ severity: "error", summary: t("config_panel.error"), detail: err?.message || t("config_panel.overlay_deletion_failed") });
        }
    };

    const confirmDelete = (record: any) => {
        confirmDialog({
            message: t("config_panel.delete_overlay_confirm", { overlay: record.short_description }),
            header: t("config_panel.delete_overlay_header"),
            acceptLabel: t("config_panel.delete"),
            rejectLabel: t("config_panel.cancel"),
            acceptClassName: "p-button-danger",
            accept: () => handleDelete(record),
        });
    };

    const getImageBody = (row: any) => {
        if (!row?.image) return <span className="text-gray-500">N/A</span>;

        const url = pb.files.getURL(row, row.image);
        const thumbUrl = pb.files.getURL(row, row.image, { thumb: "80x45" });
        return <Image src={thumbUrl} zoomSrc={url} width="80" height="45" preview />;
    };
    
    const getComponentNameBody = (row: any) => {
        if (!row?.component_name) return <span className="text-gray-500">N/A</span>;
        return <span>{row.component_name}</span>;
    };
    
    const actionsBody = (row: any) => (
        <div className="flex gap-2">
            {row.active ? (
                <Button label={t("config_panel.deactivate")} size="small" severity="warning" onClick={() => confirmDeactivate(row)} />
            ) : (
                <Button label={t("config_panel.activate")} size="small" onClick={() => confirmActivate(row)} />
            )}
            <Button size="small" label={t("config_panel.delete")} outlined onClick={() => confirmDelete(row)} />
        </div>
    );

    const parametersBody = (row: any) => (
        <Button size="small" label={t("config_panel.edit_parameters")}
            onClick={() => {
                setParamsOverlay(row);
                const entries = Object.entries(row?.parameters ?? {}) as [string, any][];
                const rows = entries.map(([k, v]) => ({ key: k, value: JSON.stringify(v), _id: k + "__" + Math.random().toString(36).slice(2) }));
                setParamsRows(rows);
                // snapshot current parameters to avoid immediate save on open
                lastSavedParamsRef.current = JSON.stringify(row?.parameters ?? {});
                setParamsDialogOpen(true);
            }}
        />
    );

    // Normalize useDebounce return in case library returns a tuple in current version
    const _debounced = useDebounce(paramsRows, 500) as any;
    const debouncedParamsRows = Array.isArray(_debounced) ? _debounced[0] : _debounced;
    const lastSavedParamsRef = useRef<string>("");

    useEffect(() => {
        const save = async () => {
            if (!paramsDialogOpen || !paramsOverlay) return;

            const obj: Record<string, any> = {};
            for (const r of debouncedParamsRows || []) {
                const k = r.key?.trim();
                if (!k) continue;
                const valRaw = r.value ?? "";
                let parsed: any = valRaw;
                try {
                    parsed = JSON.parse(valRaw);
                } catch {}
                obj[k] = parsed;
            }

            const json = JSON.stringify(obj);
            if (json === lastSavedParamsRef.current) return;

            try {
                setSavingParams(true);
                await pb.collection("overlays").update(paramsOverlay.id, { parameters: obj });
                lastSavedParamsRef.current = json;
            } catch (err: any) {
                console.error(err);
                toast.current?.show({ severity: "error", summary: t("config_panel.error"), detail: err?.message || t("config_panel.parameters_save_failed") });
            } finally {
                setSavingParams(false);
            }
        };
        save();
        // only run when debounced rows change; dialog open/overlay are checked inside
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedParamsRows]);

    const addParamRow = () => {
        setParamsRows((prev) => [...prev, { key: "", value: "", _id: "row_" + Math.random().toString(36).slice(2) }]);
    };

    const updateParamKey = (id: string, newKey: string) => {
        setParamsRows((prev) => prev.map(r => r._id === id ? { ...r, key: newKey } : r));
    };

    const updateParamValue = (id: string, newValue: string) => {
        setParamsRows((prev) => prev.map(r => r._id === id ? { ...r, value: newValue } : r));
    };

    const removeParamRow = (id: string) => {
        setParamsRows((prev) => prev.filter(r => r._id !== id));
    };

    const handleSubmit = async () => {
        try {
            // basic validation
            if (!shortDescription.trim()) {
                toast.current?.show({ severity: "warn", summary: t("config_panel.validation"), detail: t("config_panel.short_description_required") });
                return;
            }
            if (!type) {
                toast.current?.show({ severity: "warn", summary: t("config_panel.validation"), detail: t("config_panel.type_required") });
                return;
            }
            if (type === "react-component" && !componentName.trim()) {
                toast.current?.show({ severity: "warn", summary: t("config_panel.validation"), detail: t("config_panel.component_name_required") });
                return;
            }
            if (type === "image" && !imageFile) {
                toast.current?.show({ severity: "warn", summary: t("config_panel.validation"), detail: t("config_panel.image_required") });
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

            toast.current?.show({ severity: "success", summary: t("config_panel.created"), detail: t("config_panel.overlay_created") });
            // reset form
            setShortDescription("");
            setType("");
            setComponentName("");
            setImageFile(null);
            
        } catch (err: any) {
            console.error(err);
            const detail = err?.message || t("config_panel.overlay_creation_failed");
            toast.current?.show({ severity: "error", summary: t("config_panel.error"), detail });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen p-8">
            <Toast ref={toast} />
            <ConfirmDialog />
            {/* Create new overlay */}
            <div className="flex flex-col justify-between w-80">
                <Card title={t("config_panel.create_new_overlay")} className="h-fit">
                    <div className="flex flex-col">
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-col">
                                <label htmlFor="short_description" className="text-sm">{t("config_panel.short_description")}</label>
                                <InputText
                                    id="short_description"
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    placeholder={t("config_panel.short_description_inputtext_placeholder")}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="type" className="text-sm">{t("config_panel.type")}</label>
                                <Dropdown
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.value)}
                                    options={typeOptions}
                                    placeholder={t("config_panel.type_placeholder")}
                                />
                            </div>

                            {type === "react-component" && (
                                <div className="flex flex-col">
                                    <Tooltip target=".custom-target-icon" className="w-70" position="bottom" content={t("config_panel.component_name_info_tooltip")}/>
                                    <label htmlFor="component_name" className="text-sm">
                                        {t("config_panel.component_name")}
                                        <i className="custom-target-icon pi pi-question-circle text-sm! ml-1"/>
                                    </label>
                                    <InputText
                                        id="component_name"
                                        value={componentName}
                                        onChange={(e) => setComponentName(e.target.value)}
                                        placeholder={t("config_panel.component_name_inputtext_placeholder")}
                                    />
                                </div>
                            )}

                            {type === "image" && (
                                <div className="" onClickCapture={(e) => {
                                    if (imageFile) {
                                        fileUploadRef.current?.clear();
                                        setImageFile(null);
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}>
                                    <label className="text-sm">{t("config_panel.image_fileupload_label")}</label>
                                    <FileUpload
                                        ref={fileUploadRef}
                                        name="image"
                                        mode="basic"
                                        auto={false}
                                        customUpload={true}
                                        accept="image/png,image/gif"
                                        onSelect={(e) => setImageFile((e.files && e.files[0]) || null)}
                                        onClear={() => setImageFile(null)}
                                    />
                                </div>
                            )}
                        </div>

                        <Divider/>

                        <Button
                            className="w-full"
                            label={submitting ? t("config_panel.submitting") : t("config_panel.create_overlay")}
                            onClick={handleSubmit}
                            disabled={submitting}
                            icon="pi pi-plus"
                        />
                    </div>
                </Card>
                <div className="flex flex-col text-lg">
                    <p className="text-[var(--text-color)]">{t("config_panel.overlay_available_at_url")}</p>
                    <a className="text-[var(--primary-color)] font-bold hover:underline" href={overlayHref} target="_blank" rel="noopener noreferrer">{new URL(overlayHref, window.location.origin).href}</a>
                </div>
            </div>

            <Divider layout="vertical"/>

            {/* Select overlay */}
            <DataTable className="mr-6" stripedRows showGridlines value={overlays} loading={loadingOverlays} scrollable scrollHeight="85vh" emptyMessage={t("config_panel.no_overlays_found")} header={
                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl text-[var(--text-color)]">{t("config_panel.select_overlay")}</h1>
                </div>
            }>
                <Column field="short_description" header={t("config_panel.short_description")} sortable></Column>
                <Column field="type" header={t("config_panel.type")} sortable></Column>
                <Column header={t("config_panel.component_name")} body={getComponentNameBody} sortable></Column>
                <Column header={t("config_panel.image")} body={getImageBody}></Column>
                <Column header={t("config_panel.parameters")} body={parametersBody}></Column>
                <Column field="active" header={t("config_panel.active")} sortable></Column>
                <Column header={t("config_panel.actions")} body={actionsBody}></Column>
            </DataTable>

            <Dialog header={t("config_panel.parameters")} visible={paramsDialogOpen} style={{ width: "40rem" }} onHide={() => { setParamsDialogOpen(false); setParamsOverlay(null); setParamsRows([]); lastSavedParamsRef.current = ""; }}
                footer={
                    <div className="flex justify-between w-full">
                        <div className="text-sm text-[var(--text-color-secondary)]">{savingParams ? t("config_panel.saving") : ""}</div>
                        <div className="flex gap-2">
                            <Button label={t("config_panel.add")} icon="pi pi-plus" onClick={addParamRow} />
                            <Button label={t("config_panel.close")} icon="pi pi-times" severity="secondary" onClick={() => { setParamsDialogOpen(false); setParamsOverlay(null); setParamsRows([]); lastSavedParamsRef.current = ""; }} />
                        </div>
                    </div>
                }
            >
                <div className="flex flex-col gap-3">
                    {paramsRows.length === 0 && (
                        <div className="text-[var(--text-color-secondary)]">{t("config_panel.no_parameters")}</div>
                    )}
                    {paramsRows.map((row) => (
                        <div key={row._id} className="flex items-center gap-2">
                            <InputText className="w-52" value={row.key} onChange={(e) => updateParamKey(row._id, e.target.value)} placeholder={t("config_panel.parameter_key")} />
                            <InputText className="flex-1" value={row.value} onChange={(e) => updateParamValue(row._id, e.target.value)} placeholder={t("config_panel.parameter_value")} />
                            <Button icon="pi pi-trash" severity="danger" text onClick={() => removeParamRow(row._id)} />
                        </div>
                    ))}
                </div>
            </Dialog>

            <Dropdown
                value={selectedLang}
                onChange={(e) => i18n.changeLanguage(e.value.code)}
                options={languageOptions}
                optionLabel="name"
                itemTemplate={langItemTemplate}
                valueTemplate={langValueTemplate}
                className="w-fit h-fit self-end ml-auto"
                aria-label="Language"
            />
        </div>
    )
}