'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Edit, Trash2, Building2, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "../components/Header";
import { Client } from "@/types/client";
import { useSupabase } from '../providers';

export default function ClientsList() {
  const { supabase } = useSupabase();
  const [clients, setClients] = useState<Client[]>([]);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id_int, company, first_name, last_name, phone, user_id, is_professional")
        .order('id_int', { ascending: false });

      if (error) console.error("Erreur :", error.message);
      else setClients(data || []);
    };

    fetchClients();
  }, [supabase]);

  const returnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleDelete = async (clientId: number) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et entraînera la suppression de toutes les factures et devis liés à ce client."
    );
  
    if (!confirmDelete) return;
  
    setIsDeleting(clientId);

    try {
      // Supprimer les devis associés
      const { error: quoteError } = await supabase
        .from("quotes")
        .delete()
        .eq("client_id", clientId);
  
      if (quoteError) {
        console.error("Erreur lors de la suppression des devis :", quoteError.message);
        alert("Erreur lors de la suppression des devis associés.");
        setIsDeleting(null);
        return;
      }

      // Supprimer les factures associées
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("client_id", clientId);
  
      if (invoiceError) {
        console.error("Erreur lors de la suppression des factures :", invoiceError.message);
        alert("Erreur lors de la suppression des factures associées.");
        setIsDeleting(null);
        return;
      }
  
      // Puis supprimer le client
      const { error: clientError } = await supabase
        .from("clients")
        .delete()
        .eq("id_int", clientId);
  
      if (clientError) {
        console.error("Erreur lors de la suppression du client :", clientError.message);
        alert("Erreur lors de la suppression du client.");
        setIsDeleting(null);
        return;
      }
  
      setClients((prev) => prev.filter((client) => client.id_int !== clientId));
      setIsDeleting(null);
    } catch (error) {
      console.error("Erreur inattendue :", error);
      alert("Une erreur est survenue.");
      setIsDeleting(null);
    }
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes Clients</h1>
                <p className="text-sm text-gray-600 mt-1">{clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <button
              onClick={returnToDashboard}
              className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={20} />
              Retour au tableau de bord
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Société / Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prénom</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Aucun client enregistré</p>
                      <p className="text-sm text-gray-400 mt-2">Commencez par ajouter votre premier client</p>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id_int} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {client.is_professional ? (
                            <>
                              <div className="p-2 bg-indigo-100 rounded-lg">
                                <Building2 className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-xs font-semibold text-indigo-600">PRO</span>
                            </>
                          ) : (
                            <>
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-xs font-semibold text-gray-600">PART.</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {client.company && client.company.trim() !== '' ? client.company : client.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">{client.first_name}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-gray-700">{client.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/clients/${client.id_int}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Éditer
                            </Button>
                          </Link>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(client.id_int)}
                            disabled={isDeleting === client.id_int}
                            className="cursor-pointer hover:bg-red-700 transition-colors"
                          >
                            {isDeleting === client.id_int ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Suppression...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Supprimer
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