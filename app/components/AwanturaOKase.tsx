import PocketBase, { ClientResponseError } from 'pocketbase';
import { useEffect, useState } from 'react';
import Licytacja from './AwanturaOKase/Licytacja';
import type { Game, Team } from './AwanturaOKase/types';
import './AwanturaOKase/css/_variables.css';
import './AwanturaOKase/css/global.css';
import './AwanturaOKase/css/PulaTile.css';
import 'unfonts.css'
import StanyKont from './AwanturaOKase/StanyKont';


const pb = new PocketBase('http://127.0.0.1:8091');
await pb.collection("_superusers").authWithPassword(import.meta.env.VITE_BACKEND_ADMIN_EMAIL, import.meta.env.VITE_BACKEND_ADMIN_PASSWORD)

export default function AwanturaOKase() {
    const [error, setError] = useState<Error | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [game, setGame] = useState<Game | null>(null);
    const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
    
    //initial first-time data load
    useEffect(() => {
        const authenticate = async () => {
          await pb.collection("_superusers").authWithPassword(import.meta.env.VITE_BACKEND_ADMIN_EMAIL, import.meta.env.VITE_BACKEND_ADMIN_PASSWORD)
          .catch((err: ClientResponseError ) => {
            // autocancelled ("aborted") errors are intended here - https://github.com/pocketbase/pocketbase/discussions/3491
            if (!err.isAbort) {
              setError(err.originalError);
            }
          })
        }

        const getTeams = async () => {
            try {
              const list = await pb.collection('teams').getFullList({ sort: 'name' });
              setTeams(list.map((t: any) => ({ id: t.id, name: t.name, amount: Number(t.amount), amount_given: Number(t.amount_given), active: t.active })));
            } catch (err) {
              console.error('Failed to initialize teams:', err);
            }
        };
      
        const getGame = async () => {
            try {
              const item = await pb.collection('game').getOne("1", {expand: "answering_team,current_category,current_question"});
              setGame({
                id: item.id,
                round: item.round,
                status: item.status,
                jackpot: item.jackpot,
                answering_team: item.expand?.answering_team,
                current_category: item.expand?.current_category,
                current_question: item.expand?.current_question,
                hint_purchased: item.hint_purchased,
                timer_paused: item.timer_paused,
                question_deadline: item.question_deadline,
              })
            } catch (err) {
              console.error('Failed to initialize game state:', err);
            }
        };
      
        const getCategories = async () => {
            try {
              const coll = await pb.collection("categories").getFullList();
              setCategories(coll.map((c: any) => ({ value: c.id, label: c.name })));
            } catch (err) {
              console.error('Failed to initialize categories:', err);
            }
        };
      
        getTeams();
        getGame();
        getCategories();
        authenticate();
    }, []);

    //realtime data subscription
    useEffect(() => {
        pb.collection('teams').subscribe('*', (e) => {
            setTeams(prev =>
                prev.map(x => (x.id === e.record.id ? { id: e.record.id, name: e.record.name, amount: Number(e.record.amount), amount_given: Number(e.record.amount_given), active: e.record.active } : x))
            );
        })
        .catch(err => {
            console.error('Failed to subscribe to teams realtime:', err);
        })

        pb.collection('game').subscribe('1', (e) => {
            setGame({
                id: e.record.id,
                round: e.record.round,
                status: e.record.status,
                jackpot: e.record.jackpot,
                answering_team: e.record.expand?.answering_team,
                current_category: e.record.expand?.current_category,
                current_question: e.record.expand?.current_question,
                hint_purchased: e.record.hint_purchased,
                timer_paused: e.record.timer_paused,
                question_deadline: e.record.question_deadline,
            })
            console.log("item:", e.record)
            //setGameState(item);
        }, {expand: "answering_team,current_category,current_question"})
        .catch(err => {
            console.error('Failed to subscribe to game state realtime:', err);
        })

        return () => {
            pb.collection('teams').unsubscribe();
            pb.collection('game').unsubscribe();
        }
    }, [])

    if (error) {
        return <h1>{error.message + " " + error.name}</h1>
    }

    return (
        <>
        <div className='w-full h-full flex items-center justify-center'>
        <div className="flex flex-col justify-end relative w-[76%] h-[85%]">

            {/* {game?.status === "losowanie_kategorii" && <h1>Losowanie kategorii</h1>} */}
            {game?.status === "licytacja" && 
            <>
            <Licytacja
                kwotaZolci={teams.find(team => team.name === "zolci")?.amount_given ?? 0}
                kwotaZieloni={teams.find(team => team.name === "zieloni")?.amount_given ?? 0}
                kwotaNiebiescy={teams.find(team => team.name === "niebiescy")?.amount_given ?? 0}
                kwotaMistrzowie={teams.find(team => team.name === "mistrzowie")?.amount_given ?? 0}
                czyActiveNiebiescy={teams.find(team => team.name === "niebiescy")?.active}
                czyActiveZieloni={teams.find(team => team.name === "zieloni")?.active}
                czyActiveZolci={teams.find(team => team.name === "zolci")?.active}
                czyActiveMistrzowie={teams.find(team => team.name === "mistrzowie")?.active == false}
            />
            <StanyKont
                kwotaZolci={teams.find(team => team.name === "zolci")?.amount ?? 0}
                kwotaZieloni={teams.find(team => team.name === "zieloni")?.amount ?? 0}
                kwotaNiebiescy={teams.find(team => team.name === "niebiescy")?.amount ?? 0}
                kwotaMistrzowie={teams.find(team => team.name === "mistrzowie")?.amount ?? 0}
                pula={game?.jackpot}
                czyActiveNiebiescy={teams.find(team => team.name === "niebiescy")?.active}
                czyActiveZieloni={teams.find(team => team.name === "zieloni")?.active}
                czyActiveZolci={teams.find(team => team.name === "zolci")?.active}
                czyActiveMistrzowie={teams.find(team => team.name === "mistrzowie")?.active == false}
            />
            </>
            
            }
            {game?.status === "odpowiadanie" && <h1>Odpowiadanie</h1>}
            {game?.status === "kupowanie_podpowiedzi" && <h1>Kupowanie podpowiedzi</h1>}
            {game?.status === "odpowiadanie_z_podpowiedzia" && <h1>Odpowiadanie z podpowiedzia</h1>}

                {/* <>
                <div className="p-4 border border-gray-200 rounded text-3xl">Awantura O Kase</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.status}</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.round}</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.jackpot}</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.answering_team?.name}</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.current_category?.name}</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.current_question?.description}</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.hint_purchased}</div>
                <div className="p-4 border border-gray-200 rounded text-2xl">{game?.timer_paused}</div>
                </> */}
        </div>
        </div>
        </>
    );
}