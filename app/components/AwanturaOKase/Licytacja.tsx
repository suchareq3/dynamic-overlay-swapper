import PulaTile from "./PulaTile";

export default function Licytacja({ kwotaZolci, kwotaZieloni, kwotaNiebiescy, kwotaMistrzowie, czyActiveNiebiescy = true, czyActiveZieloni = true, czyActiveZolci = true, czyActiveMistrzowie = false }: { kwotaZolci: number, kwotaZieloni: number, kwotaNiebiescy: number, kwotaMistrzowie: number, czyActiveNiebiescy?: boolean, czyActiveZieloni?: boolean, czyActiveZolci?: boolean, czyActiveMistrzowie?: boolean }) {
  const activePlayerCount = [czyActiveNiebiescy, czyActiveZieloni, czyActiveZolci, czyActiveMistrzowie].filter(Boolean).length;
  const widthPercentage = 24 * activePlayerCount + "%";

  return (
    <div className="Licytacja flex flex-col">
      <div className="flex w-full justify-center">
        <div
          className="opis"
          style={{ width: widthPercentage }}
        >
          <p>LICYTACJA</p>
        </div>
        <div className="space-waster"></div>
        {/* zeby sie ukladalo ladnie z pulą z komponentu StanyKont */}
      </div>

      <div className="flex w-full h-full justify-center">
        {czyActiveNiebiescy && (
          <PulaTile
            nazwaDruzyny="niebiescy"
            pula={kwotaNiebiescy}
          />
        )}
        {czyActiveZieloni && (
          <PulaTile
            nazwaDruzyny="zieloni"
            pula={kwotaZieloni}
          />
        )}
        {czyActiveZolci && (
          <PulaTile
            nazwaDruzyny="zolci"
            pula={kwotaZolci}
          />
        )}
        {czyActiveMistrzowie && (
          <PulaTile
            nazwaDruzyny="mistrzowie"
            pula={kwotaMistrzowie}
          />
        )}
        <div className="space-waster"></div>
        {/* zeby sie ukladalo ladnie z pulą z komponentu StanyKont */}
      </div>
    </div>
  );
}
