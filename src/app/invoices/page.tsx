'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from '../components/InvoicePDF';
import { useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import Header from "../components/Header";
import { InvoiceWithClient } from "@/types/invoiceWithClient";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from "@supabase/auth-helpers-react";
import { Profile } from "@/types/profile";
import { getTotalAmount } from "@/lib/utils";


export default function FacturesList() {
  const user = useUser();
  const [profile, setProfile] = useState<Profile>();
  const supabase = createClientComponentClient();
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const router = useRouter();

  // Chargment des données de l'utilisateur
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

  // Récupération des données de factures
  useEffect(() => {
    const fetchFactures = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          clients (
            company, is_professional, last_name, first_name
          )
        `);

      if (error) console.error("Erreur pour récupérer les données :", error.message);
      else setInvoices(data);
    };

    fetchFactures();
  }, []);

  const returnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleCreateCreditNote = async (invoiceId: number) => {
    const confirmCreate = window.confirm(
      "Confirmez-vous la création d’un avoir pour cette facture ? Cette action est irréversible."
    );
  
    if (!confirmCreate) return;
  
    try {
      const res = await fetch('/api/create-credit-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        console.error("Erreur lors de la création de l'avoir :", result.error);
        alert("Erreur : " + result.error);
        return;
      }
  
      alert("Avoir créé avec succès !");
      // Rechargement des factures
      setInvoices((prev) => [...prev]); // ou refetcher depuis Supabase si besoin
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div>
      <Header />
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between w-full items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">Liste des factures</h1>
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
                <th className="px-4 py-2 text-left">Facture</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Montant</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2">Éditer</th>
                <th className="px-4 py-2">Télécharger</th>
                <th className="px-4 py-2">Avoir</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id_int} className="border-t">
                  <td className="px-4 py-2">
                    {invoice.is_credit_note ? (
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-sm">AV-{invoice.id_int.toString().padStart(4, "0")}</span>
                        <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">AVOIR</span>
                      </span>
                    ) : (
                      <span className="font-mono text-sm">F-{invoice.id_int.toString().padStart(4, "0")}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{formatDateFR(invoice.datefac)}</td>
                  <td className="px-4 py-2">{invoice.clients?.is_professional}
                    {invoice.clients?.is_professional ? invoice.clients?.company : `${invoice.clients?.last_name ?? ''} ${invoice.clients?.first_name ?? ''}`}
                  </td>
                  <td className="px-4 py-2">{getTotalAmount(invoice.items)} €</td>
                  <td className="px-4 py-2">{invoice.status}</td>
                  <td className="px-4 py-2 text-center">
                    <Link href={`/invoices/${invoice.id_int}/edit`}>
                      <Button variant="outline" className="cursor-pointer">Éditer</Button>
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {profile && invoice.clients && (
                      <PDFDownloadLink
                        document={<InvoicePDF invoice={invoice} profile={profile} />}
                        fileName={`${invoice.is_credit_note ? 'avoir' : 'facture'}_${invoice.id_int.toString().padStart(4, "0")}_${invoice.clients?.company ?? 'client'}_${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '-'}.pdf`}
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
                  <td className="text-center">
                    <Button
                      onClick={() => handleCreateCreditNote(invoice.id_int)}
                      variant="destructive"
                      className="text-xs px-2 py-1 cursor-pointer"
                      disabled={invoice.is_credit_note}
                    >
                      {invoice.is_credit_note ? "Déjà un avoir" : "Créer un avoir"}
                    </Button>
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
