'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuotePDF from '../components/QuotePDF';
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Edit, Download, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Header from "../components/Header";
import { QuoteWithClient } from "@/types/quoteWithClient";
import { User } from '@supabase/auth-helpers-nextjs'
import { Profile } from "@/types/profile";
import { getTotalAmount } from "@/lib/utils";
import { useSupabase } from '../providers';

export default function QuotesList() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>();
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [isTransforming, setIsTransforming] = useState<number | null>(null);
  const router = useRouter();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);

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
      } catch (err) {
        console.error("Erreur récupération user :", err);
        router.replace("/login");
      }
    };

    fetchUser();
  }, [router, supabase]);

  const showMessage = (message: string, success: boolean) => {
    setStatusMessage(message);
    setIsSuccess(success);
    setVisible(true);
  };

  useEffect(() => {
    if (!visible) return;

    const timer1 = setTimeout(() => setVisible(false), 4000);
    const timer2 = setTimeout(() => setStatusMessage(null), 4600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [visible]);

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
    const fetchQuotes = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          clients (
            company, is_professional, last_name, first_name
          )
        `)
        .order('id_int', { ascending: false });

      if (error) console.error("Erreur pour récupérer les données :", error.message);
      else setQuotes(data || []);
    };

    fetchQuotes();
  }, [supabase]);

  const returnToDashboard = () => {
    router.push('/dashboard');
  };

  const transformToInvoice = async (quoteId: number) => {
    setIsTransforming(quoteId);
    showMessage("", false);
    
    try {
      const response = await fetch(`${window.location.origin}/api/quote/[${quoteId}]/transform-to-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId }),
      });
      const result = await response.json();
  
      if (!response.ok) {
        showMessage(`Erreur : ${result.error || 'Erreur inconnue'}`, false);
        setIsTransforming(null);
        return;
      }
      showMessage('Le devis a bien été transformé en facture.', true);
      setIsTransforming(null);
  
    } catch (error: unknown) {
      if (error instanceof Error) {
        showMessage(`Erreur lors de la création de la facture : ${error.message}`, false);
      } else {
        showMessage(`Erreur inattendue`, false);
      }
      setIsTransforming(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Accepté': 'bg-green-100 text-green-800 border-green-200',
      'Refusé': 'bg-red-100 text-red-800 border-red-200',
      'À envoyer': 'bg-amber-100 text-amber-800 border-amber-200',
      'Envoyé': 'bg-blue-100 text-blue-800 border-blue-200',
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
                <h1 className="text-3xl font-bold text-gray-900">Mes Devis</h1>
                <p className="text-sm text-gray-600 mt-1">{quotes.length} devis enregistré{quotes.length > 1 ? 's' : ''}</p>
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

        {/* Message d'état */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl border transition-opacity duration-600 flex items-start gap-3 ${
              isSuccess 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            } ${visible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="flex-shrink-0 pt-0.5">
              {isSuccess ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className={`text-sm font-medium ${
              isSuccess ? 'text-green-800' : 'text-red-800'
            }`}>
              {statusMessage}
            </p>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">N° Devis</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Aucun devis enregistré</p>
                      <p className="text-sm text-gray-400 mt-2">Créez votre premier devis</p>
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id_int} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-indigo-600">D-{quote.id_int.toString().padStart(4, "0")}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{formatDateFR(quote.datequo)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {quote.clients?.is_professional
                            ? quote.clients?.company
                            : `${quote.clients?.last_name ?? ''} ${quote.clients?.first_name ?? ''}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{getTotalAmount(quote.items).toFixed(2)} €</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Link href={`/quotes/${quote.id_int}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Éditer
                            </Button>
                          </Link>

                          {profile && quote.clients && (
                            <PDFDownloadLink
                              document={<QuotePDF quote={quote} profile={profile} />}
                              fileName={`Devis-${quote.id_int.toString().padStart(4, "0")}.pdf`}
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

                          {quote.status === 'Accepté' ? (
                            <Button
                              onClick={() => transformToInvoice(quote.id_int)}
                              disabled={isTransforming === quote.id_int}
                              size="sm"
                              className="cursor-pointer bg-green-500 hover:bg-green-600 text-white"
                            >
                              {isTransforming === quote.id_int ? (
                                <>
                                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Transformation...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Transformer
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="cursor-not-allowed opacity-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Non accepté
                            </Button>
                          )}
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