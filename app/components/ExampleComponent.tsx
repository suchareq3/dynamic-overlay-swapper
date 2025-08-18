import { useTranslation } from "react-i18next";

export default function ExampleComponent() {
    const { t } = useTranslation();
    return (
        <>
            <div className="p-4 border border-gray-200 rounded text-3xl">{t("components.example_text")}</div>
        </>
    );
}