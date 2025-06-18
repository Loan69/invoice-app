'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "../components/Header";
import { Client } from "@/types/client";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClientsList() {
  const supabase = createClientComponentClient()
  const [clients, setClients] = useState<Client[] | []>([]);
  const router = useRouter()

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id_int, company, first_name, last_name, phone, user_id");

      if (error) console.error("Erreur :", error.message);
      else setClients(data);
    };

    fetchClients();
  }, []);

  const returnToDashboard = () => {
    router.push('/dashboard')
  };

  // Méthode de suppression d'un client
  const handleDelete = async (clientId: number) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et entrainera la suppression de toutes les factures liées au client."
    );
  
    if (!confirmDelete) return;
  
    try {
      // Supprimer d'abord les factures associées
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("client_id", clientId);
  
      if (invoiceError) {
        console.error("Erreur lors de la suppression des factures :", invoiceError.message);
        alert("Erreur lors de la suppression des factures associées.");
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
        return;
      }
  
      // Actualiser l'affichage ou retirer le client supprimé de l'état local
      setClients((prev) => prev.filter((client) => client.id_int !== clientId));
    } catch (error) {
      console.error("Erreur inattendue :", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div>
      <Header />
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between w-full items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">Liste des clients</h1>
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
                <th className="px-4 py-2 text-left">Société</th>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Prénom</th>
                <th className="px-4 py-2 text-left">Téléphone</th>
                <th className="px-4 py-2 text-left">Éditer la fiche client</th>
                <th className="px-4 py-2 text-left">Supprimer la fiche client</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id_int} className="border-t">
                 <td className="px-4 py-2">{client.company && client.company.trim() !== '' ? client.company : 'Particulier'}</td>
                  <td className="px-4 py-2">{client.last_name}</td>
                  <td className="px-4 py-2">{client.first_name}</td>
                  <td className="px-4 py-2">{client.phone}</td>
                  <td className="px-4 py-2 text-center">
                  <Link href={`/clients/${client.id_int}/edit`}>
                      <Button variant="outline" className="cursor-pointer">Éditer</Button>
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="text-white bg-red-600 rounded hover:bg-red-700 px-3 py-1 transition-colors cursor-pointer"
                      onClick={() => handleDelete(client.id_int)}
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
