import { Items } from "./items";

// Type utile pour les données utilisées dans le graphique du dashboard
export interface GraphInvoice {
    datefac: string;
    items: { amount: string }[];
    status: string;
  };
  