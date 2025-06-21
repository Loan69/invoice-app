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

type InvoiceFormProps = {
  setIsDirty?: (v: boolean) => void;
  mode?: "create" | "edit";
  invoiceData?: {
    id_int: number;
    client_id: number;
    datefac: string;
    description: string;
    amount: number;
    status: string;
  };
  invoiceId?: string;
};

export default function InvoiceForm({ setIsDirty, mode, invoiceData }: InvoiceFormProps) {
  const user = useUser();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [clients, setClients] = useState<Client[] | [] >([]);
  const [form, setForm] = useState({
    client_id: invoiceData?.client_id?.toString() || "",
    datefac: invoiceData?.datefac || new Date().toISOString().split("T")[0],
    description: invoiceData?.description || "",
    amount: invoiceData?.amount?.toString() || "",
    status: invoiceData?.status || "À régler",
  });
  const [templates, setTemplates] = useState<Template[] | []>([]);
  const [showTemplateName, setShowTemplateName] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [open, setOpen] = useState(false);              // pour contrôler l’ouverture du popover
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null); // id du template sélectionné


  // Requête pour rechercher un client à qui affecter la facture
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user?.id);

      if (error) console.error("Erreur de chargement des clients :", error);
      else setClients(data);
      console.log(clients);
    };
    fetchClients();
  }, [user]);

  // Requête pour aller chercher les templates
  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from("invoice_templates").select("*");
      if (error) {
        console.error("Erreur chargement templates :", error);
        setTemplates([]); // fallback
      } else {
        setTemplates(data || []);
      }
    };
    fetchTemplates();
  }, []);


  // Insertion des valeurs du formulaire dans la table invoices ou modification des données existantes
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
        .from("invoices")
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
      amount: parseFloat(form.amount),
      user_id: user?.id,
      id_int: mode === "edit" && invoiceData?.id_int ? invoiceData.id_int : newIdInt,
    };
  
    let error;
    if (mode === "edit" && invoiceData?.id_int) {
      const { error: updateError } = await supabase
        .from("invoices")
        .update(payload)
        .eq("id_int", invoiceData.id_int)
        .eq("user_id", user?.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("invoices")
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
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (setIsDirty) setIsDirty(true);
  };

  // Gestion de la suppression d'un template
  const handleDeleteTemplate = async (id: number) => {
    const { error } = await supabase
      .from("invoice_templates")
      .delete()
      .eq("id_int", id);
  
    if (error) {
      console.error("Erreur suppression template :", error.message);
    } else {
      // Met à jour la liste
      const { data, error: fetchError } = await supabase.from("invoice_templates").select("*");
      if (fetchError) console.error("Erreur refresh templates :", fetchError.message);
      else setTemplates(data || []);
    }
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
                        description: template.description || "",
                        amount: template.amount?.toString() || "",
                        status: template.status || "",
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
          <Label>Date de facturation</Label>
          <Input
            type="date"
            name="datefac"
            value={form.datefac}
            onChange={handleChange}
            required
          />
        </div>

        <div>
        <Label>Description</Label>
        <Textarea 
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>

        <div>
          <Label>Montant Hors Taxe (€)</Label>
          <Input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>

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
              <SelectItem value="À régler">À régler</SelectItem>
              <SelectItem value="Payée">Payée</SelectItem>
              <SelectItem value="En retard">En retard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bouton de soumission du formulaire */}
        <Button
          type="submit" 
          className="w-full cursor-pointer"
        >{mode === "edit" ? "Modifier la facture" : "Créer la facture"}
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
              placeholder="Ex : Facture standard client B2B"
            />
            <Button
              type="button"
              className="w-full mt-2 cursor-pointer"
              onClick={async () => {
                if (!templateName || !form.description || !form.amount) {
                  alert("Nom, description et montant sont requis pour enregistrer un template.");
                  return;
                }
                const { error } = await supabase.from("invoice_templates").insert([{
                  name: templateName,
                  description: form.description,
                  amount: parseFloat(form.amount),
                  status: form.status,
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
