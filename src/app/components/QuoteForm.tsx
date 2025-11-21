'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Client } from "@/types/client";
import { Template } from "@/types/template";
import { Items } from "@/types/items";
import { Quote } from "@/types/quote";
import { User } from "@supabase/supabase-js";
import { useSupabase } from "../providers";

type QuoteFormProps = {
  setIsDirty?: (v: boolean) => void;
  mode?: "create" | "edit";
  quoteData?: Partial<Quote>;
  quoteId?: string;
};

export default function QuoteForm({ setIsDirty, mode, quoteData }: QuoteFormProps) {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [clients, setClients] = useState<Client[] | [] >([]);
  const [form, setForm] = useState({
    client_id: quoteData?.client_id?.toString() || "",
    title: quoteData?.title || "",
    datequo: quoteData?.datequo || new Date().toISOString().split("T")[0],
    items: Array.isArray(quoteData?.items)
    ? quoteData?.items.map((item: Items) => ({
        description: item.description || "",
        amount: item.amount || ""
      }))
    : [{ description: "", amount: "" }],
    status: quoteData?.status || "À envoyer",
  });
  const [templates, setTemplates] = useState<Template[] | []>([]);
  const [showTemplateName, setShowTemplateName] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [open, setOpen] = useState(false);              // pour contrôler l’ouverture du popover
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null); // id du template sélectionné

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


  // Requête pour rechercher un client à qui affecter le devis
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user?.id);

      if (error) console.error("Erreur de chargement des clients :", error);
      else setClients(data);
    };
    fetchClients();
  }, [user]);

  // Requête pour aller chercher les templates de devis
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from("quote_templates").select("*");
      if (error) {
        console.error("Erreur chargement templates :", error);
        setTemplates([]); // fallback
      } else {
        setTemplates(data || []);
      }
    };
    fetchTemplates();
  }, [user]);

  // Insertion des valeurs du formulaire dans la table quotes ou modification des données existantes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!form.client_id || form.client_id === "") {
      alert("Vous devez choisir un client.");
      return;
    }
  
    let newIdInt = 1; // valeur par défaut
    if (mode !== "edit") {
      // Aller chercher le plus grand id_int existant pour cet utilisateur
      const { data: maxData, error: maxError } = await supabase
        .from("quotes")
        .select("id_int", { head: false })
        .eq("user_id", user?.id)
        .order("id_int", { ascending: false })
        .limit(1);
  
      if (maxError) {
        console.error("Erreur récupération numéro de facture :", maxError.message);
        alert("Erreur lors de la récupération du numéro de facture.");
        return;
      }
  
      if (maxData && maxData.length > 0) {
        newIdInt = maxData[0].id_int + 1;
      }
    }
  
    const payload = {
      ...form,
      client_id: parseInt(form.client_id),
      user_id: user?.id,
      id_int: mode === "edit" && quoteData?.id_int ? quoteData.id_int : newIdInt,
    };
  
    let error;
    // Modification d'un devis
    if (mode === "edit" && quoteData?.id_int) {
      const { error: updateError } = await supabase
        .from("quotes")
        .update(payload)
        .eq("id_int", quoteData.id_int)
        .eq("user_id", user?.id);
      error = updateError;
    } else {
      // Ajout d'un nouveau devis
      const { error: insertError } = await supabase
        .from("quotes")
        .insert([payload]);
      error = insertError;
    }
  
    if (error) {
      console.error("Erreur lors de la sauvegarde :", error.message);
      alert("Erreur lors de la sauvegarde : " + error.message);
      return;
    }
  
    router.push("/dashboard");
  };
  
  // Gestion de la modification d'un champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (setIsDirty) setIsDirty(true);
  };

  // gestion de la modification de description et montant
  const handleItemChange = (index: number, field: "description" | "amount", value: string) => {
    const updatedItems = [...(form.items ?? [])];
    updatedItems[index][field] = value;
    setForm({ ...form, items: updatedItems });
    if (setIsDirty) setIsDirty(true);
  };
  

  // Gestion de la suppression d'un template
  const handleDeleteTemplate = async (id: number) => {
    const { error } = await supabase
      .from("quote_templates")
      .delete()
      .eq("id_int", id);
  
    if (error) {
      console.error("Erreur suppression template :", error.message);
    } else {
      // Met à jour la liste
      const { data, error: fetchError } = await supabase.from("quote_templates").select("*");
      if (fetchError) console.error("Erreur refresh templates :", fetchError.message);
      else setTemplates(data || []);
    }
  };

  // Mise en forme du montant hors taxe
  const formatAmount = (value: string): string => {
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num)) return "";
    return num.toFixed(2).replace('.', ',');
  };

  return (
    // Container principal
    <div className="p-1 items-start w-full">

      {/* Section Template */}
      <div className="mb-6 bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Charger un modèle
          </h3>
        </div>
        <div className="p-6">
          {/* Popover pour sélection template avec design amélioré */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer w-full justify-between h-12 rounded-xl border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                {selectedTemplate
                  ? templates.find((t) => t.id_int === selectedTemplate)?.name
                  : "Choisir un modèle"}
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Rechercher..." />
                <CommandList>
                  {templates.map((template) => (
                    <CommandItem
                      key={template.id_int}
                      value={template.name}
                      onSelect={() => {
                        setSelectedTemplate(template.id_int);
                        setForm({
                          ...form,
                          items: Array.isArray(template.items)
                            ? template.items.map((item) => ({
                                description: item.description ?? "",
                                amount: item.amount ?? ""
                              }))
                            : [{ description: "", amount: "" }],
                        });
                        setOpen(false);
                      }}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        {template.name}
                        {selectedTemplate === template.id_int && (
                          <Check className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id_int);
                        }}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border-0 space-y-6">
   
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Titre du devis
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ex : Pose d'un carrelage"
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Client
          </label>
          <Select
            value={form.client_id || ""}
            onValueChange={(val) => {
              setForm({ ...form, client_id: val });
              if (setIsDirty) setIsDirty(true);
            }}
          >
            <SelectTrigger className="w-full h-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="Sélectionnez un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id_int} value={client.id_int.toString()}>
                  {client.is_professional
                    ? client.company
                    : `${client.first_name} ${client.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date du devis
          </label>
          <input
            type="date"
            name="datequo"
            value={form.datequo}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Liste des prestations*/}
        {form.items?.map((item, index) => (
          <div key={index} className="p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all">
            {/* Header de la prestation */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-indigo-600">
                Prestation #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  const updatedItems = form.items?.filter((_: Items, i: number) => i !== index);
                  setForm({ ...form, items: updatedItems });
                  if (setIsDirty) setIsDirty(true);}}
                className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>

            {/* Champs de la prestation */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Décrivez la prestation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant HT
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="amount"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                    onBlur={(e) =>
                      handleItemChange(index, "amount", formatAmount(e.target.value))
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0,00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    €
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Bouton ajouter prestation */}
        <button
          type="button"
          onClick={() => {
            setForm((prev) => ({
              ...prev,
              items: [...prev.items ?? [], { description: "", amount: "" }],
            }));
            if (setIsDirty) setIsDirty(true);
          }}
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Ajouter une prestation
        </button>
        
        {/* Statut du devis */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Statut du devis
          </label>
          <Select
            value={form.status}
            onValueChange={(val) => {
              setForm({ ...form, status: val });
              if (setIsDirty) setIsDirty(true);
            }}
          >
            <SelectTrigger className="w-full h-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="Sélectionnez un statut pour le devis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="À envoyer">À envoyer</SelectItem>
              <SelectItem value="Envoyé">Envoyé</SelectItem>
              <SelectItem value="Accepté">Accepté</SelectItem>
              <SelectItem value="Refusé">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>

      {/* Boutons d'action */}
      <div className="space-y-3 pt-6 border-t-2 border-gray-200">
        <button
          type="submit"
          className="cursor-pointer w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {mode === "edit" ? "Modifier le devis" : "Créer le devis"}
        </button>

        <button
          type="button"
          className="cursor-pointer w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
          onClick={() => setShowTemplateName(prev => !prev)}
        >
          <Save className="w-5 h-5" />
          Enregistrer comme modèle
        </button>

        {/* Section enregistrement template */}
        {showTemplateName && (
          <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du modèle
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Devis standard client B2B"
            />
            <button
              type="button"
              onClick={async () => {
                if (!templateName) {
                  alert("Le nom du modèle est requis.");
                  return;
                }

                const hasEmptyFields = form.items?.some(
                  (item: Items) => !item.description || !item.amount
                );

                if (hasEmptyFields) {
                  alert("Toutes les prestations doivent avoir une description et un montant.");
                  return;
                }

                const { error } = await supabase.from("quote_templates").insert([{
                  name: templateName,
                  items: form.items,
                  user_id: user?.id
                }]);

                if (error) {
                  console.log("Supabase insert error:", error);
                  alert("Erreur lors de l'enregistrement : " + error.message);
                } else {
                  alert("Modèle enregistré !");
                  setTemplateName("");
                  setShowTemplateName(false);
                }
              }}
              className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all"
            >
              Sauvegarder le modèle
            </button>
          </div>
        )}
      </div>
    </form>
  </div>
  );
}
