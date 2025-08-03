'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuotePDF from '../components/QuotePDF';
import { useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import Header from "../components/Header";
import { QuoteWithClient } from "@/types/quoteWithClient";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from "@supabase/auth-helpers-react";
import { Profile } from "@/types/profile";
import { getTotalAmount } from "@/lib/utils";


export default function QuoteList() {
  const user = useUser();
  const [profile, setProfile] = useState<Profile>();
  const supabase = createClientComponentClient();
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const router = useRouter();

  // Récupération du profil de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, company, address, email, phone, logo_url, tax_status")
        .eq("id", user?.id)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
      } else {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUser();
  }, [user]);

  const formatDateFR = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // Récupération des données de devis
  useEffect(() => {
    const fetchQuotes = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          clients (
            company, is_professional, last_name, first_name
          )
        `);

      if (error) console.error("Erreur pour récupérer les données :", error.message);
      else setQuotes(data);
    };

    fetchQuotes();
  }, []);

  const returnToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div>
      <Header />
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between w-full items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">Liste des devis</h1>
          <button
            onClick={returnToDashboard}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow cursor-pointer"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Devis</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Montant</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2">Éditer</th>
                <th className="px-4 py-2 text-left">Télécharger</th>
              </tr>
            </thead>
            <tbody>
                {quotes.map((quote) => (
                    <tr key={quote.id_int} className="border-t">
                    <td className="px-4 py-2">
                        <span className="font-mono text-sm">D-{quote.id_int.toString().padStart(4, "0")}</span>
                    </td>
                    <td className="px-4 py-2">{formatDateFR(quote.datequo)}</td>
                    <td className="px-4 py-2">{quote.clients?.is_professional}
                        {quote.clients?.is_professional ? quote.clients?.company : `${quote.clients?.last_name ?? ''} ${quote.clients?.first_name ?? ''}`}
                    </td>
                    <td className="px-4 py-2">{getTotalAmount(quote.items)} €</td>
                    <td className="px-4 py-2">{quote.status}</td>
                    <td className="px-4 py-2 text-center">
                        <Link href={`/invoices/${quote.id_int}/edit`}>
                        <Button variant="outline" className="cursor-pointer">Éditer</Button>
                        </Link>
                    </td>
                    <td>
                        {profile && quote.clients && (
                            <PDFDownloadLink
                                document={<QuotePDF quote={quote} profile={profile} />}
                                fileName={`Devis-${quote.id_int.toString().padStart(4, "0")}.pdf`}
                            >
                                {({ loading }) =>
                                loading ? (
                                    <span className="text-xs text-gray-400">Chargement…</span>
                                ) : (
                                    <Button variant="ghost" className="text-xs px-2 py-1 cursor-pointer">Télécharger</Button>
                                )
                                }
                            </PDFDownloadLink>
                        )}
                    </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
