;import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Pocketbase from "pocketbase";
import BetterVCR from "./ZadzwonPoWygrana/Better VCR 9.0.1.ttf";

type ZadzwonPoWygranaParams = {
    kwota: string;
    telefon: string;
    zadanie: string;
}

const pb = new Pocketbase('http://127.0.0.1:8090');
await pb.collection("_superusers").authWithPassword(import.meta.env.VITE_BACKEND_ADMIN_EMAIL, import.meta.env.VITE_BACKEND_ADMIN_PASSWORD)

export default function ZadzwonPoWygrana({ active }: { active?: any }) {

    const kwota = active.parameters?.kwota ?? "69 zł"
    const telefon = active.parameters?.telefon ?? "tel. 123 456 789zł"
    const zadanie = active.parameters?.zadanie ?? "Wyrizzuj sigmę"

    const url = pb.files.getURL(active, active.image);
    console.log("url:", url)
    
    return (
        <>
            <div className="w-screen h-screen flex items-center justify-center">
                <img src={url} alt={active.short_description} className="max-w-full max-h-full object-contain" />
            </div>
            {/* <div className="p-4 border border-gray-200 rounded text-3xl">{t("components.example_text")}</div> */}
            <style>{`
              @font-face {
                font-family: 'Better VCR';
                src: url(${BetterVCR}) format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              .better-vcr { font-family: 'Better VCR', monospace; }
            `}</style>
            <p className="better-vcr absolute bottom-18 right-31 text-7xl italic text-white" >{kwota} Pkt.</p>
            <p className="better-vcr absolute bottom-66 left-8 text-4xl italic text-[#534E7C]" >tel. 123 456 789 (7)</p>
            <p className="better-vcr absolute bottom-22 left-10 text-6xl italic text-white font-light" >{zadanie}</p>
        </>
    );
}