'use client';

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function InvoiceTemplateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    client_id: "",
    description: "",
    amount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      client_id: parseInt(form.client_id),
      amount: parseFloat(form.amount),
    };

    const { error } = await supabase.from("invoice_templates").insert([payload]);
    if (error) return console.error("Erreur lors de l'ajout :", error.message);

    router.refresh();
    router.push("/templates"); // redirige vers la liste
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold">Créer un modèle de facture</h2>

      <div>
        <Label>Nom du modèle</Label>
        <Input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div>
        <Label>ID du client</Label>
        <Input name="client_id" value={form.client_id} onChange={handleChange} required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea name="description" value={form.description} onChange={handleChange} required />
      </div>

      <div>
        <Label>Montant (€)</Label>
        <Input name="amount" type="number" value={form.amount} onChange={handleChange} required />
      </div>

      <Button type="submit" className="w-full">Créer le modèle</Button>
    </form>
  );
}