'use client';

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from '../components/InvoicePDF';
import { useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import Header from "../components/Header";
import { InvoiceWithClient } from "@/types/invoiceWithClient";

export default function FacturesList() {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const router = useRouter()

  // Conversion du format date en version française
  const formatDateFR = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };
  

  useEffect(() => {
    const fetchFactures = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          clients (
            company
          )
        `);
  
      if (error) console.error("Erreur pour récupérer les données :", error.message);
      else setInvoices(data);
    };
  
    fetchFactures();
  }, []);

  const returnToDashboard = () => {
    router.push('/dashboard')
  };

  // Méthode de suppression d'une facture
  const handleDelete = async (invoiceId: number) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
    );
  
    if (!confirmDelete) return;
  
    try {
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("id_int", invoiceId);
  
      if (invoiceError) {
        console.error("Erreur lors de la suppression des factures :", invoiceError.message);
        alert("Erreur lors de la suppression des factures associées.");
        return;
      }
      // Actualiser l'affichage ou retirer la facture supprimée de l'état local
      setInvoices((prev) => prev.filter((invoice) => invoice.id_int !== invoiceId));
    } catch (error) {
      console.error("Erreur inattendue :", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div>
      {/* Header avec logo */}
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
                <th className="px-4 py-2">Éditer la facture</th>
                <th className="px-4 py-2">Télécharger la facture</th>
                <th className="px-4 py-2">Supprimer la facture</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id_int} className="border-t">
                  <td className="px-4 py-2">{invoice.id_int.toString().padStart(4, "0")}</td>
                  <td className="px-4 py-2">{formatDateFR(invoice.date)}</td>
                  <td>{invoice.clients?.company}</td>
                  <td className="px-4 py-2">{invoice.amount} €</td>
                  <td className="px-4 py-2">{invoice.status}</td>
                  <td className="px-4 py-2 text-center">
                    <Link href={`/invoices/${invoice.id_int}/edit`}>
                      <Button variant="outline" className="cursor-pointer">Éditer</Button>
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-center">
                  <PDFDownloadLink
                    document={
                      <InvoicePDF
                        invoice={invoice}
                      />
                    }
                    fileName={`facture_${invoice.id_int}.pdf`}
                  >
                    {({ loading }) =>
                      loading ? (
                        <span className="text-xs text-gray-400">Chargement…</span>
                      ) : (
                        <Button variant="ghost" className="text-xs px-2 py-1 cursor-pointer">
                          Télécharger
                        </Button>
                      )
                    }
                  </PDFDownloadLink>
                  </td>
                  <td className="text-center">
                    <button
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white cursor-pointer"
                      onClick={() => handleDelete(invoice.id_int)}
                    >
                      Supprimer
                    </button>
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
