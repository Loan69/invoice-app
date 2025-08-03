'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import LogoutButton from '../components/LogoutButton'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BarChart2, Users } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from '../components/InvoicePDF';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { InvoiceWithClient } from '@/types/invoiceWithClient'
import { useUser } from '@supabase/auth-helpers-react'
import { Profile } from '@/types/profile'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import LoadingSpinner from '../components/LoadingSpinner';
import SubscriptionBadge from '../components/SubscriptionBadge';
import { GraphInvoice } from '@/types/graphInvoice';
import { getTotalAmount } from "@/lib/utils";
import { QuoteWithClient } from '@/types/quoteWithClient';
import { CheckCircle, XCircle, Clock, Send } from "lucide-react";
import QuotePDF from '../components/QuotePDF';


export default function DashboardPage() {
  const supabase = createClientComponentClient()
  const user = useUser()
  const router = useRouter()

  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([])
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true); // loading flag

  const [totalRevenue, setTotalRevenue] = useState(0)
  const [pendinginvoices, setPendingInvoices] = useState(0)

  const [graphData, setGraphData] = useState<GraphInvoice[]>([]);


  // Récupération des données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return  // ne fait rien si pas de user
      
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

      setProfileLoading(false); // fin du chargement
    };
    
    fetchUser();

  }, [user]);

  // Vérification si l'utilisateur est toujours abonné
  useEffect(() => {
    if (profile && !profile.is_subscribed && !profile.is_demo) {
      router.push("/aboExpire")
    }
  }, [profile, router])
  

  // Récupération des derniers devis à afficher
  useEffect(() => {
    const fetchQuotes = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*, clients (company, last_name, first_name, address, email, is_professional)")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (!error && data) {
        setQuotes(data);
      } else {
        console.error("Erreur lors de la récupération des clients:", error);
      }
    };

    fetchQuotes();
  }, []);

  // Récupération des dernières factures à afficher
  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1); // 1er du mois précédent, il y a 12 mois
  
      // 1. Dernières 5 factures
      const { data: recentInvoices, error: errorRecent } = await supabase
        .from("invoices")
        .select(`*, clients (company, last_name, first_name, address, email, is_professional)`)
        .order('created_at', { ascending: false })
        .limit(5);
  
      if (!errorRecent && recentInvoices) {
        setInvoices(recentInvoices);
      }
  
      // 2. Factures des 12 derniers mois
      const { data: last12MonthsInvoices, error: errorLast12 } = await supabase
        .from("invoices")
        .select("datefac, items, status")
        .gte("datefac", lastYear.toISOString());
  
      if (!errorLast12 && last12MonthsInvoices) {
        setGraphData(last12MonthsInvoices); // tu crées un state spécifique
        const totalPaid = last12MonthsInvoices
          .filter((inv) => inv.status === "Payée")
          .reduce((acc, curr) => acc + getTotalAmount(curr.items), 0);
        const pendingCount = last12MonthsInvoices.filter((inv) => inv.status === "À régler").length;
        setTotalRevenue(totalPaid);
        setPendingInvoices(pendingCount);
      } else {
        console.error("Erreur lors de la récupération des factures sur 12 mois :", errorLast12);
      }
    };
  
    fetchData();
  }, []);
  

  // Requête pour le graphique
  const monthlyData = useMemo(() => {
    const today = new Date();
    const map = new Map<string, { label: string; total: number }>();
  
    // Initialiser les 12 mois à 0
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleString("fr-FR", { month: "short", year: "numeric" });
      map.set(key, { label, total: 0 });
    }
  
    // Ajouter les montants
    graphData.forEach((inv) => {
      if (inv?.status?.toLowerCase() !== "payée") return;
      const date = new Date(inv.datefac);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (map.has(key)) {
        map.get(key)!.total += getTotalAmount(inv.items);
      }
    });
  
    return Array.from(map.values());
  }, [graphData]);
  

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  if (profile && !profile.is_subscribed && !profile.is_demo) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-gray-50">
      {/* Header avec actions */}
      <header className="flex justify-between items-center mb-6">
        <div className="space-x-4 justify-between">
          <div className='flex mb-4'>
            <h1 className="text-3xl font-bold text-gray-800">Bienvenue {profile?.first_name}</h1>
            <SubscriptionBadge isSubscribed={!!profile?.is_subscribed} isDemo={!!profile?.is_demo} />

          </div>

          {/* Bouton - Ajouter un client */}
          <Link href="/clients/new">
            <Button
              variant="default"
              className='cursor-pointer'
            >+ Ajouter un client</Button>
          </Link>

          {/* Bouton - Créer un devis */}
          <Link href="/quotes/new">
            <Button
              variant="outline"
              className='cursor-pointer'
            >+ Créer un devis</Button>
          </Link>

          {/* Bouton - Créer une facture */}
          <Link href="/invoices/new">
            <Button
              variant="default"
              className='cursor-pointer'
            >+ Créer une facture</Button>
          </Link>

          {/* Bouton - Paramètre */}
          <Link href="/settings">
            <Button
              variant="outline"
              className="top-4 right-4 cursor-pointer"
            >
             + Paramètres
            </Button>
          </Link>

        </div>
        <LogoutButton />
      </header>

      {/* Contenu principal */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          
          {/* Boutons - Liste des clients */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <Users className="inline-block mr-2" />
                    Vos clients
                  </span>
                  <Link href="/clients">
                    <Button variant="outline" className='cursor-pointer'>Voir tous les clients</Button>
                  </Link>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Devis récents */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <Users className="inline-block mr-2" />
                    Devis récents
                  </span>
                  <Link href="/quotes">
                    <Button variant="outline" className="cursor-pointer">Voir tous les devis</Button>
                  </Link>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun devis récent.</p>
              ) : (
                <ul className="text-sm text-gray-600 space-y-2">
                  {quotes.map((quote) => {
                    const total = getTotalAmount(quote.items).toFixed(2).replace(".", ",");
                    
                    // Icone des statuts du devis
                    function getStatusIcon(status: string) {
                      const baseClass = "ml-2 w-4 h-4 inline";
                      switch (status.toLowerCase()) {
                        case "accepté":
                          return <CheckCircle className={`${baseClass} text-green-500`} />;
                        case "refusé":
                          return <XCircle className={`${baseClass} text-red-500`} />;
                        case "à envoyer":
                          return <Clock className={`${baseClass} text-yellow-500`} />;
                        case "envoyé":
                          return <Send className={`${baseClass} text-blue-500`} />;
                        default:
                          return null;
                      }
                    }

                    const icon = getStatusIcon(quote.status);
                    
                    const statusCycle = ["À envoyer", "Envoyé", "Accepté", "Refusé"];

                    function getNextStatus(current: string) {
                      const index = statusCycle.indexOf(current);
                      return statusCycle[(index + 1) % statusCycle.length];
                    }

                    const handleStatusChange = async () => {
                      const newStatus = getNextStatus(quote.status);

                      // MAJ en base :
                      await supabase
                        .from("quotes")
                        .update({ status: newStatus })
                        .eq("id_int", quote.id_int);
                      // puis refresh ou re-fetch quotes pour mettre à jour la partie graphique
                      setQuotes((prevQuotes) =>
                        prevQuotes.map((q) =>
                          q.id_int === quote.id_int ? { ...q, status: newStatus } : q
                        )
                      );
                    };
                    

                    return (
                      <li key={quote.id_int} className="flex items-center justify-between border-b pb-1">
                        <div>
                          <span className="font-medium">#{quote.id_int.toString().padStart(4, "0")}</span> – {total} € – {quote.clients?.company}
                          <button
                            title={`Statut du devis : ${quote.status}`}
                            className="cursor-pointer"
                            onClick={handleStatusChange}>
                            {icon}
                          </button>
                        </div>

                        {/* Groupe des boutons alignés */}
                        <div className="flex items-center gap-2">
                          <Link href={`quotes/${quote.id_int}/edit`}>
                            <Button size="sm" className="cursor-pointer">Éditer</Button>
                          </Link>

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
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Factures récentes */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <Users className="inline-block mr-2" />
                    Factures récentes
                  </span>
                  <Link href="/invoices">
                    <Button variant="outline" className="cursor-pointer">Voir toutes les factures</Button>
                  </Link>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
            {invoices.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune facture récente.</p>
              ) : (
                <ul className="text-sm text-gray-600 space-y-2">
                  {invoices.map((invoice) => {
                    const total = getTotalAmount(invoice.items).toFixed(2).replace(".", ",");
                    
                    // Icone des statuts du devis
                    function getStatusIcon(status: string) {
                      const baseClass = "ml-2 w-4 h-4 inline";
                      switch (status.toLowerCase()) {
                        case "payée":
                          return <CheckCircle className={`${baseClass} text-green-500`} />;
                        case "en retard":
                          return <XCircle className={`${baseClass} text-red-500`} />;
                        case "à régler":
                          return <Clock className={`${baseClass} text-yellow-500`} />;
                        default:
                          return null;
                      }
                    }

                    const icon = getStatusIcon(invoice.status);
                    
                    const statusCycle = ["À régler", "Payée", "En retard"];

                    function getNextStatus(current: string) {
                      const index = statusCycle.indexOf(current);
                      return statusCycle[(index + 1) % statusCycle.length];
                    }

                    const handleStatusChange = async () => {
                      const newStatus = getNextStatus(invoice.status);

                      // MAJ en base :
                      await supabase
                        .from("invoices")
                        .update({ status: newStatus })
                        .eq("id_int", invoice.id_int);
                      // puis refresh ou re-fetch quotes pour mettre à jour la partie graphique
                      setInvoices((prevInvoices) =>
                        prevInvoices.map((q) =>
                          q.id_int === invoice.id_int ? { ...q, status: newStatus } : q
                        )
                      );
                    };
                    

                    return (
                      <li key={invoice.id_int} className="flex items-center justify-between border-b pb-1">
                        <div>
                          <span className="font-medium">#{invoice.id_int.toString().padStart(4, "0")}</span> – {total} € – {invoice.clients?.company}
                          <button
                            title={`Statut du devis : ${invoice.status}`}
                            className="cursor-pointer"
                            onClick={handleStatusChange}>
                            {icon}
                          </button>
                        </div>

                        {/* Groupe des boutons alignés */}
                        <div className="flex items-center gap-2">
                          <Link href={`invoices/${invoice.id_int}/edit`}>
                            <Button size="sm" className="cursor-pointer">Éditer</Button>
                          </Link>

                          {profile && invoice.clients && (
                            <PDFDownloadLink
                                document={<InvoicePDF invoice={invoice} profile={profile} />}
                                fileName={`facture_${invoice.id_int.toString().padStart(4, "0")}_${invoice.clients?.company}_${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '-'}.pdf`}
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
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Graphique / Indicateurs */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              <BarChart2 className="inline-block mr-2" /> Revenus mensuels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Affichage du graphique */}
            <div className="text-center text-gray-500 text-sm py-10">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => `${value} €`}
                  labelFormatter={(label) => `Mois : ${label}`}
                />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>
            <div className="flex justify-around mt-4 text-center">
              <div>
                <p className="text-lg font-semibold">{totalRevenue} €</p>
                <p className="text-xs text-gray-500">Total encaissé</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{pendinginvoices}</p>
                <p className="text-xs text-gray-500">Facture(s) à régler</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} Alfred Facture. Tous droits réservés. <Link href="/legal/mentionsLegales" className="underline ml-1">Mentions légales</Link>
      </footer>
    </div>
  );
}
