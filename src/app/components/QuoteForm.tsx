'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Client } from "@/types/client";
import { Template } from "@/types/template";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from "@supabase/auth-helpers-react";
import { Items } from "@/types/items";
import { Quote } from "@/types/quote";

type QuoteFormProps = {
  setIsDirty?: (v: boolean) => void;
  mode?: "create" | "edit";
  quoteData?: Partial<Quote>;
  quoteId?: string;
};

export default function QuoteForm({ setIsDirty, mode, quoteData }: QuoteFormProps) {
  const user = useUser();
  const supabase = createClientComponentClient();
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
    <div className="p-1 items-start w-full">

      {/* Sélection d'un template */}
      <div className="m-5">
        <Label className="m-2">Charger un template</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedTemplate
                ? templates.find((t) => t.id_int === selectedTemplate)?.name
                : "Choisir un modèle"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-3xl w-full">

      <div>
          <Label>Titre du devis</Label>
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ex : Pose d'un carrelage"
          />
        </div>

        <div>
          <Label>Client</Label>
          <Select
            value={form.client_id || ""}
            onValueChange={(val) => {
              setForm({ ...form, client_id: val });
              if (setIsDirty) setIsDirty(true);
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder="Sélectionnez un client"
              />
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
          <Label>Date du devis</Label>
          <Input
            type="date"
            name="datequo"
            value={form.datequo}
            onChange={handleChange}
            required
          />
        </div>

        {form.items?.map((item: Items, index: number) => (
          <div key={index}>
            {/* Titre + bouton supprimer */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-800">
                Prestation n°{index + 1}
              </h4>
              <button
                type="button"
                onClick={() => {
                  const updatedItems = form.items?.filter((_: Items, i: number) => i !== index);
                  setForm({ ...form, items: updatedItems });
                  if (setIsDirty) setIsDirty(true);
                }}
                className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                title="Supprimer cette prestation"
              >
                🗑 Supprimer
              </button>
            </div>
            
            <Label>Description</Label>
            <Textarea
              name="description"
              value={item.description}
              onChange={(e) => handleItemChange(index, "description", e.target.value)}
            />

            <div className="relative mt-3 mb-3">
            <Label>Montant hors taxe</Label>
              <Input
                name="amount"
                value={item.amount}
                onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                onBlur={(e) =>
                  handleItemChange(index, "amount", formatAmount(e.target.value))
                }
                className="pr-10" // espace à droite pour le symbole
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                €
              </span>
            </div>

          </div>
        ))}

        {/* Bouton pour ajouter une prestation */}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setForm((prev) => ({
              ...prev,
              items: [...prev.items ?? [], { description: "", amount: "" }],
            }));
            if (setIsDirty) setIsDirty(true);
          }}
          className="cursor-pointer"
        >
          + Ajouter une prestation
        </Button>

        <div>
          <Label>Statut</Label>
          <Select 
            value={form.status}
            onValueChange={(val) => {
              setForm({ ...form, status: val });
              if (setIsDirty) setIsDirty(true);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="À envoyer">À envoyer</SelectItem>
              <SelectItem value="Envoyé">Envoyé</SelectItem>
              <SelectItem value="Accepté">Accepté</SelectItem>
              <SelectItem value="Refusé">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bouton de soumission du formulaire */}
        <Button
          type="submit" 
          className="w-full cursor-pointer"
        >{mode === "edit" ? "Modifier le devis" : "Créer le devis"}
        </Button>

        {/* Enregistrement d'un modèle de facture */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 cursor-pointer"
          onClick={ () => setShowTemplateName(prev => !prev)
            }
        >
        <PlusCircle size={18} />
          Enregistrer comme modèle
        </Button>

        {showTemplateName && (
          <div className="space-y-2 pt-2">
            <Label>Nom du modèle</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex : Devis standard client B2B"
            />
            <Button
              type="button"
              className="w-full mt-2 cursor-pointer"
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
            >
              Sauvegarder
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
