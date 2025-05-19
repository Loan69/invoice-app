'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ArrowLeft } from "lucide-react";
import InvoiceForm from "@/app/components/InvoiceForm";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [initialData, setInitialData] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id_int", invoiceId)
        .single();

      if (error) {
        console.error("Erreur lors du chargement :", error.message);
        return;
      }

      setInitialData(data);
    };

    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = confirm(
        "Des modifications non enregistrées seront perdues. Voulez-vous vraiment revenir au tableau de bord ?"
      );
      if (!confirmLeave) return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-gray-50">
      {/* Colonne gauche : Titre + Formulaire */}
      <div className="flex flex-col items-start justify-start p-8">
        <div className="flex justify-between w-full items-center mb-6">
          <h1 className="text-3xl font-bold text-black mb-6">
            Édition de la facture #{invoiceId.toString().padStart(4, "0")}
          </h1>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow cursor-pointer"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>
        {initialData ? (
          <InvoiceForm
            mode="edit"
            invoiceData={initialData}
            invoiceId={invoiceId}
            setIsDirty={setIsDirty}
          />
        ) : (
          <p>Chargement...</p>
        )}
      </div>

      {/* Colonne droite : Image */}
      <div
        className="hidden md:block bg-cover bg-center"
        style={{ backgroundImage: 'url("/images/InvoiceForm_img.jpg")' }}
      />
    </div>
  );
}
