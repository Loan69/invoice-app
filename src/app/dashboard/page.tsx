'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BarChart2, Users, TrendingUp, Clock, FileText, Download, Edit, CheckCircle, XCircle, Send, DollarSign, AlertCircle, ChartColumnIncreasing } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from '../components/InvoicePDF';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { InvoiceWithClient } from '@/types/invoiceWithClient'
import { Profile } from '@/types/profile'
import LoadingSpinner from '../components/LoadingSpinner';
import SubscriptionBadge from '../components/SubscriptionBadge';
import { GraphInvoice } from '@/types/graphInvoice';
import { getTotalAmount } from "@/lib/utils";
import { QuoteWithClient } from '@/types/quoteWithClient';
import QuotePDF from '../components/QuotePDF';
import Header from '../components/Header';
import { useSupabase } from '../providers';
import { User } from "@supabase/supabase-js";
import { GraphQuote } from '@/types/graphQuote';


export default function DashboardPage() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter()

  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([])
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0)
  const [pendinginvoices, setPendingInvoices] = useState(0)
  const [potentialRevenue, setPotentialRevenue] = useState(0)

  const [graphData, setGraphData] = useState<GraphInvoice[]>([]);
  const [quoteGraphData, setQuoteGraphData] = useState<GraphQuote[]>([]);

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
      if (!user) return
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq('id', user?.id)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
      } else {
        console.error("Erreur lors de la récupération du profil de l'utilisateur:", error);
      }

      setProfileLoading(false);
    };
    
    fetchUser();
  }, [user]);

  useEffect(() => {
    if (profile && !profile.is_subscribed && !profile.is_demo) {
      router.push("/aboExpire")
    }
  }, [profile, router])
  
  useEffect(() => {
    const fetchQuotes = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*, clients (company, last_name, first_name, address, email, is_professional)")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (!error && data) {
        setQuotes(data);
      } else {
        console.error("Erreur lors de la récupération des clients:", error);
      }
    };

    fetchQuotes();
  }, []);

  const fetchLast12MonthsInvoices = async () => {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
  
    // Récupération des factures
    const { data: last12MonthsInvoices, error } = await supabase
      .from("invoices")
      .select("datefac, items, status")
      .gte("datefac", lastYear.toISOString());

    // Récupération des devis acceptés
    const { data: acceptedQuotes, error: quoteError } = await supabase
      .from("quotes")
      .select("datequo, items, status")
      .eq("status", "Accepté")
      .gte("datequo", lastYear.toISOString());
  
    if (!error && last12MonthsInvoices) {
      setGraphData(last12MonthsInvoices);
  
      const totalPaid = last12MonthsInvoices
        .filter((inv) => inv.status === "Payée")
        .reduce((acc, curr) => acc + getTotalAmount(curr.items), 0);
      const pendingCount = last12MonthsInvoices.filter((inv) => inv.status === "À régler").length;
  
      setTotalRevenue(totalPaid);
      setPendingInvoices(pendingCount);
    } else {
      console.error("Erreur lors de la récupération des factures sur 12 mois :", error);
    }

    // Calcul du CA potentiel (devis acceptés)
    if (!quoteError && acceptedQuotes) {
      setQuoteGraphData(acceptedQuotes);
      const potential = acceptedQuotes.reduce((acc, curr) => acc + getTotalAmount(curr.items), 0);
      setPotentialRevenue(potential);
    } else {
      console.error("Erreur lors de la récupération des devis acceptés :", quoteError);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: recentInvoices, error: errorRecent } = await supabase
        .from("invoices")
        .select(`*, clients (company, last_name, first_name, address, email, is_professional)`)
        .order('created_at', { ascending: false })
        .limit(15);
  
      if (!errorRecent && recentInvoices) {
        setInvoices(recentInvoices);
      }
  
      fetchLast12MonthsInvoices();
    };
  
    fetchData();
  }, []);
  
  const monthlyData = useMemo(() => {
    const today = new Date();
    const map = new Map<string, { label: string; total: number; potential: number }>();
  
    // Initialiser les 12 mois à 0
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleString("fr-FR", { month: "short", year: "numeric" });
      map.set(key, { label, total: 0, potential: 0 });
    }
  
    // Ajouter les montants des factures payées (CA réel)
    graphData.forEach((inv) => {
      if (inv?.status?.toLowerCase() !== "payée") return;
      const date = new Date(inv.datefac);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (map.has(key)) {
        map.get(key)!.total += getTotalAmount(inv.items);
      }
    });

    // Ajouter les montants des devis acceptés (CA potentiel)
    quoteGraphData.forEach((quote) => {
      const date = new Date(quote.datequo);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (map.has(key)) {
        map.get(key)!.potential += getTotalAmount(quote.items);
      }
    });
  
    return Array.from(map.values());
  }, [graphData, quoteGraphData]);
  
  if (profileLoading) {
    return <LoadingSpinner />;
  }

  if (profile && !profile.is_subscribed && !profile.is_demo) {
    return <LoadingSpinner />;
  }

  function getStatusIcon(status: string) {
    const baseClass = "w-4 h-4";
    switch (status.toLowerCase()) {
      case "accepté":
      case "payée":
        return <CheckCircle className={`${baseClass} text-green-500`} />;
      case "refusé":
      case "en retard":
        return <XCircle className={`${baseClass} text-red-500`} />;
      case "à envoyer":
      case "à régler":
        return <Clock className={`${baseClass} text-amber-500`} />;
      case "envoyé":
        return <Send className={`${baseClass} text-blue-500`} />;
      default:
        return null;
    }
  }

  const handleQuoteStatusChange = async (quote: QuoteWithClient) => {
    const statusCycle = ["À envoyer", "Envoyé", "Accepté", "Refusé"];
    const index = statusCycle.indexOf(quote.status);
    const newStatus = statusCycle[(index + 1) % statusCycle.length];

    await supabase
      .from("quotes")
      .update({ status: newStatus })
      .eq("id_int", quote.id_int);
    
    setQuotes((prevQuotes) =>
      prevQuotes.map((q) =>
        q.id_int === quote.id_int ? { ...q, status: newStatus } : q
      )
    );

    // Rafraîchir les données du graphique si le statut change vers/depuis Accepté
    if (newStatus === "Accepté" || quote.status === "Accepté") {
      fetchLast12MonthsInvoices();
    }
  };

  const handleInvoiceStatusChange = async (invoice: InvoiceWithClient) => {
    const statusCycle = ["À régler", "Payée", "En retard"];
    const index = statusCycle.indexOf(invoice.status);
    const newStatus = statusCycle[(index + 1) % statusCycle.length];

    await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id_int", invoice.id_int);
    
    setInvoices((prevInvoices) =>
      prevInvoices.map((i) =>
        i.id_int === invoice.id_int ? { ...i, status: newStatus } : i
      )
    );
    
    fetchLast12MonthsInvoices();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
    
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col">
        {/* En-tête avec message de bienvenue */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex flex-col flex-row md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Bonjour {profile?.first_name} 👋
              </h1>
              <p className="text-sm text-gray-600">Voici un aperçu de votre activité</p>
            </div>
            <SubscriptionBadge isSubscribed={!!profile?.is_subscribed} isDemo={!!profile?.is_demo} />
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 flex-shrink-0">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
                <ChartColumnIncreasing className="w-4 h-4 opacity-80" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium opacity-90">Chiffre d&apos;affaires</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} €</p>
                <p className="text-xs opacity-75">12 derniers mois</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <ChartColumnIncreasing className="w-4 h-4 opacity-80" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium opacity-90">CA Potentiel</p>
                <p className="text-2xl font-bold">{potentialRevenue.toLocaleString('fr-FR')} €</p>
                <p className="text-xs opacity-75">Devis acceptés</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <AlertCircle className="w-4 h-4 opacity-80" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium opacity-90">En attente</p>
                <p className="text-2xl font-bold">{pendinginvoices}</p>
                <p className="text-xs opacity-75">Facture{pendinginvoices > 1 ? 's' : ''} à régler</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          {/* Colonne gauche - 2/3 */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            {/* Accès rapide clients */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
              <CardContent className="p-4">
                <Link href="/clients">
                  <Button
                    className="cursor-pointer w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    size="lg"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Gérer mes clients
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Graphique */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 md:flex-1 flex flex-col md:min-h-0"
              style={{ height: 350 }} // style pour la version mobile
            >
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 py-3 px-4 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Évolution du chiffre d&apos;affaires
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-3 px-4 flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          const label = name === 'total' ? 'CA réalisé' : 'CA potentiel';
                          return [`${value} €`, label];
                        }}
                        labelFormatter={(label) => `Période : ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                      {/* Barres CA réalisé (bleu) */}
                      <Bar dataKey="total" name="total" radius={[6, 6, 0, 0]} fill="#4f46e5" />
                      {/* Barres CA potentiel (vert) */}
                      <Bar dataKey="potential" name="potential" radius={[6, 6, 0, 0]} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - 1/3 */}
          <div className="flex flex-col gap-4">
            {/* Devis récents */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ height: '300px' }}>
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Devis récents
                  </CardTitle>
                  <Link href="/quotes">
                    <Button variant="ghost" size="sm" className="cursor-pointer text-xs hover:bg-indigo-50 hover:text-indigo-700 h-7 px-2">
                      Tout voir
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto h-[calc(100% - 56px)]">
                {quotes.length === 0 ? (
                  <div className="text-center py-1">
                    <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Aucun devis récent</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quotes.map((quote) => {
                      const total = getTotalAmount(quote.items).toFixed(2).replace(".", ",");
                      
                      return (
                        <div key={quote.id_int} className="p-2.5 rounded-lg bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-xs font-bold text-indigo-600">#{quote.id_int.toString().padStart(4, "0")}</span>
                              <button
                                title={`Statut : ${quote.status}`}
                                className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                                onClick={() => handleQuoteStatusChange(quote)}>
                                {getStatusIcon(quote.status)}
                              </button>
                            </div>
                            <span className="text-sm font-bold text-indigo-600 flex-shrink-0 ml-2">{total} €</span>
                          </div>
                          
                          <p className="text-xs font-medium text-gray-700 truncate mb-2">{quote.clients?.company}</p>
                          
                          <div className="flex items-center gap-1.5">
                            <Link href={`quotes/${quote.id_int}/edit`} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer w-full text-xs h-7 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Éditer
                              </Button>
                            </Link>

                            {profile && quote.clients && (
                              <PDFDownloadLink
                                document={<QuotePDF quote={quote} profile={profile} />}
                                fileName={`Devis-${quote.id_int.toString().padStart(4, "0")}.pdf`}
                                className="flex-1"
                              >
                                {({ loading }) =>
                                  loading ? (
                                    <Button
                                      size="sm" 
                                      variant="ghost" 
                                      disabled className="w-full text-xs h-7"
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm"
                                      variant="ghost"
                                      className="cursor-pointer w-full text-xs h-7 hover:bg-indigo-600 hover:text-white transition-colors"
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  )
                                }
                              </PDFDownloadLink>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Factures récentes */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ height: '300px' }}>
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 py-3 px-4">
              <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Factures récentes
                  </CardTitle>
                  <Link href="/invoices">
                    <Button variant="ghost" size="sm" className="cursor-pointer text-xs hover:bg-indigo-50 hover:text-indigo-700 h-7 px-2">
                      Tout voir
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto h-[calc(100% - 56px)]">
              {invoices.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Aucune facture récente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.map((invoice) => {
                      const total = getTotalAmount(invoice.items).toFixed(2).replace(".", ",");
                      
                      return (
                        <div key={invoice.id_int} className="p-2.5 rounded-lg bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-xs font-bold text-indigo-600">#{invoice.id_int.toString().padStart(4, "0")}</span>
                              <button
                                title={`Statut : ${invoice.status}`}
                                className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                                onClick={() => handleInvoiceStatusChange(invoice)}>
                                {getStatusIcon(invoice.status)}
                              </button>
                            </div>
                            <span className="text-sm font-bold text-indigo-600 flex-shrink-0 ml-2">{total} €</span>
                          </div>
                          
                          <p className="text-xs font-medium text-gray-700 truncate mb-2">{invoice.clients?.company}</p>
                          
                          <div className="flex items-center gap-1.5">
                            <Link href={`invoices/${invoice.id_int}/edit`} className="flex-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="cursor-pointer w-full text-xs h-7 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Éditer
                              </Button>
                            </Link>

                            {profile && invoice.clients && (
                              <PDFDownloadLink
                                document={<InvoicePDF invoice={invoice} profile={profile} />}
                                fileName={`facture_${invoice.id_int.toString().padStart(4, "0")}_${invoice.clients?.company}_${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '-'}.pdf`}
                                className="flex-1"
                              >
                                {({ loading }) =>
                                  loading ? (
                                    <Button size="sm" variant="ghost" disabled className="w-full text-xs h-7">
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="cursor-pointer w-full text-xs h-7 hover:bg-indigo-600 hover:text-white transition-colors"
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  )
                                }
                              </PDFDownloadLink>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 mt-20 pb-6">
          © {new Date().getFullYear()} Alfred Facture. Tous droits réservés. 
          <Link href="/legal/mentionsLegales" className="underline ml-2 hover:text-indigo-600 transition-colors">
            Mentions légales
          </Link>
        </footer>
      </div>
    </div>
  );
}