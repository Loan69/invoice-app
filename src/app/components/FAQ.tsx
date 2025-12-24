const faqs = [
  {
    question: "Pourquoi Alfred Facture est-il payant ?",
    answer: "Nous croyons en la transparence. Un prix clair (9,50€/mois) sans publicité, sans revente de données, et avec toutes les fonctionnalités incluses. Les logiciels gratuits se financent autrement - souvent à vos dépens."
  },
  {
    question: "Quelle différence avec les logiciels gratuits comme Indy ?",
    answer: "Alfred Facture se concentre sur la simplicité pure. Pas de comptabilité complexe, pas de fonctionnalités dont vous n'avez pas besoin. Juste : devis, factures, suivi CA. Parfait pour artisans et TPE."
  },
  {
    question: "Suis-je conforme légalement avec Alfred Facture ?",
    answer: "Oui, 100%. Toutes les mentions légales obligatoires sont automatiquement ajoutées : numérotation, TVA, SIRET, conditions de paiement. Et nous nous préparons à la facturation électronique 2026."
  },
  {
    question: "Combien de temps pour créer ma première facture ?",
    answer: "3 minutes chrono. Ajoutez un client, sélectionnez une prestation, validez. Alfred calcule la TVA, ajoute les mentions légales, génère le PDF. C'est fait."
  },
  {
    question: "Que se passe-t-il après les 15 jours d'essai ?",
    answer: "Vous choisissez : continuer avec l'abonnement (9,50€/mois ou 95€/an), ou arrêter. Aucun engagement, aucune carte bancaire demandée pendant l'essai."
  },
  {
    question: "Alfred Facture fonctionne-t-il sur mobile ?",
    answer: "Oui, l'interface est 100% responsive. Créez une facture depuis votre chantier, chez un client, n'importe où."
  },
  {
    question: "Puis-je essayer sans carte bancaire ?",
    answer: "Absolument. Les 15 jours d'essai ne nécessitent aucune carte bancaire. Testez toutes les fonctionnalités gratuitement."
  }
];

export function FAQ() {
  return (
    <section className="py-16">
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
                }))
            })
            }}
        />
      <h2 className="text-3xl font-bold text-center mb-12">
        Questions fréquentes
      </h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <details key={index} className="border rounded-lg p-6">
            <summary className="font-semibold cursor-pointer">
              {faq.question}
            </summary>
            <p className="mt-4 text-gray-600">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}