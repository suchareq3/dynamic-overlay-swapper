export type Team = { 
  id: string; 
  name: 'mistrzowie' | 'niebiescy' | 'zieloni' | 'zolci'; 
  amount: number; 
  amount_given: number;
  active: boolean;
};
export type Game = {
  id: string;
  round: number;
  status: 'losowanie_kategorii' | 'licytacja' | 'odpowiadanie' | 'kupowanie_podpowiedzi' | 'odpowiadanie_z_podpowiedzia';
  jackpot: number;
  answering_team?: Team;
  current_category?: Category;
  current_question?: Question;
  hint_purchased?: boolean;
  timer_paused?: boolean;
  question_deadline?: Date;
};
export type Category = {
  id: string;
  name: string;
};
export type Question = {
  id: string;
  description: string;
  answer: string;
  fake_answers: string;//json, actually...
  category: Category;
  used: boolean;
}