'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from '../components/InvoicePDF';
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Edit, Download, Receipt, AlertCircle } from 'lucide-react';
import Header from "../components/Header";
import { InvoiceWithClient } from "@/types/invoiceWithClient";
import { Profile } from "@/types/profile";
import { getTotalAmount } from "@/lib/utils";
import { useSupabase } from '../providers';
import { User } from "@supabase/supabase-js";

export default function InvoicesList() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>();
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [isCreatingCreditNote, setIsCreatingCreditNote] = useState<number | null>(null);
  const router = useRouter();

  // Récupération de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          console.warn("Aucun utilisateur valide, redirection vers /signin");
          router.replace("/login");
          return;
        }

        setUser(data.user);
        console.log("Utilisateur connecté :", data.user);
      } catch (err) {
        console.error("Erreur récupération user :", err);
        router.replace("/login");
      }
    };

    fetchUser();
  }, [router, supabase]);

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
  }, [user, supabase]);

  const formatDateFR = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          clients (
            company, is_professional, last_name, first_name
          )
        `)
        .order('id_int', { ascending: false });

      if (error) console.error("Erreur pour récupérer les données :", error.message);
      else setInvoices(data || []);
    };

    fetchInvoices();
  }, [supabase]);

  const returnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleCreateCreditNote = async (invoiceId: number) => {
    const confirmCreate = window.confirm(
      "Confirmez-vous la création d'un avoir pour cette facture ? Cette action est irréversible."
    );
  
    if (!confirmCreate) return;
  
    setIsCreatingCreditNote(invoiceId);

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
        setIsCreatingCreditNote(null);
        return;
      }
  
      alert("Avoir créé avec succès !");
      // Recharger les factures
      const { data } = await supabase
        .from("invoices")
        .select(`
          *,
          clients (
            company, is_professional, last_name, first_name
          )
        `)
        .order('id_int', { ascending: false });
      
      if (data) setInvoices(data);
      setIsCreatingCreditNote(null);
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Une erreur est survenue.");
      setIsCreatingCreditNote(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Payée': 'bg-green-100 text-green-800 border-green-200',
      'À régler': 'bg-amber-100 text-amber-800 border-amber-200',
      'En retard': 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes Factures</h1>
                <p className="text-sm text-gray-600 mt-1">{invoices.length} facture{invoices.length > 1 ? 's' : ''} et avoir{invoices.filter(i => i.is_credit_note).length > 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <button
              onClick={returnToDashboard}
              className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={20} />
              Retour au dashboard
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">N° Document</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Aucune facture enregistrée</p>
                      <p className="text-sm text-gray-400 mt-2">Créez votre première facture</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id_int} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.is_credit_note ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-orange-600">AV-{invoice.id_int.toString().padStart(4, "0")}</span>
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold border border-orange-200">AVOIR</span>
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-sm text-indigo-600">F-{invoice.id_int.toString().padStart(4, "0")}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{formatDateFR(invoice.datefac)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {invoice.clients?.is_professional 
                            ? invoice.clients?.company 
                            : `${invoice.clients?.last_name ?? ''} ${invoice.clients?.first_name ?? ''}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{getTotalAmount(invoice.items).toFixed(2)} €</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Link href={`/invoices/${invoice.id_int}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Éditer
                            </Button>
                          </Link>

                          {profile && invoice.clients && (
                            <PDFDownloadLink
                              document={<InvoicePDF invoice={invoice} profile={profile} />}
                              fileName={`${invoice.is_credit_note ? 'avoir' : 'facture'}_${invoice.id_int.toString().padStart(4, "0")}_${invoice.clients?.company ?? 'client'}_${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '-'}.pdf`}
                            >
                              {({ loading }) =>
                                loading ? (
                                  <Button variant="ghost" size="sm" disabled>
                                    <Download className="w-4 h-4 mr-1" />
                                    Chargement...
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-gray-100 transition-colors">
                                    <Download className="w-4 h-4 mr-1" />
                                    PDF
                                  </Button>
                                )
                              }
                            </PDFDownloadLink>
                          )}

                          <Button
                            onClick={() => handleCreateCreditNote(invoice.id_int)}
                            variant={invoice.is_credit_note ? "outline" : "default"}
                            size="sm"
                            disabled={invoice.is_credit_note || isCreatingCreditNote === invoice.id_int}
                            className={invoice.is_credit_note ? "cursor-not-allowed opacity-50" : "cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"}
                          >
                            {isCreatingCreditNote === invoice.id_int ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Création...
                              </>
                            ) : invoice.is_credit_note ? (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Déjà un avoir
                              </>
                            ) : (
                              <>
                                <Receipt className="w-4 h-4 mr-1" />
                                Créer avoir
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Alfred Facture. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}