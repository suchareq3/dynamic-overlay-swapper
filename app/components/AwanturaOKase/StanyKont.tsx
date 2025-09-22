import PulaTile from "./PulaTile";

export default function StanyKont({ kwotaZolci = 0, kwotaZieloni = 0, kwotaNiebiescy = 0, kwotaMistrzowie = 0, pula = 0, czyActiveNiebiescy = true, czyActiveZieloni = true, czyActiveZolci = true, czyActiveMistrzowie = false, czyPokazacPule = true }: { kwotaZolci: number, kwotaZieloni: number, kwotaNiebiescy: number, kwotaMistrzowie: number, pula: number, czyActiveNiebiescy?: boolean, czyActiveZieloni?: boolean, czyActiveZolci?: boolean, czyActiveMistrzowie?: boolean, czyPokazacPule?: boolean }) {
  return (
    <div className="StanyKont flex">
      {czyActiveNiebiescy && (
        <PulaTile
          nazwaDruzyny="niebiescy"
          pula={kwotaNiebiescy}
          opis="STAN KONTA"
        />
      )}

      {czyActiveZieloni && (
        <PulaTile
          nazwaDruzyny="zieloni"
          pula={kwotaZieloni}
          opis="STAN KONTA"
        />
      )}

      {czyActiveZolci && (
        <PulaTile
          nazwaDruzyny="zolci"
          pula={kwotaZolci}
          opis="STAN KONTA"
        />
      )}

      {czyActiveMistrzowie && (
        <PulaTile
          nazwaDruzyny="mistrzowie"
          pula={kwotaMistrzowie}
          opis="STAN KONTA"
        />
      )}
      
      {czyPokazacPule && (
        <PulaTile
          nazwaDruzyny="ogolna"
          pula={pula}
          opis="PULA"
        />
      )}
    </div>
  );
}
