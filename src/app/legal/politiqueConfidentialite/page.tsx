import Header from "@/app/components/Header";

export default function PolitiqueConfidentialite() {
    return (
      <div>
        <Header />

      <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Politique de confidentialité</h1>
    
            <p className="mb-4">Dernière mise à jour : 6 juin 2025</p>
    
            <p className="mb-4">
            Cette politique explique comment Alfred Facture collecte, utilise et protège vos données personnelles.
            </p>
    
            <h2 className="text-xl font-semibold mt-6">1. Données collectées</h2>
            <p className="mb-4">Nous collectons les données que vous fournissez lors de votre inscription : email, mot de passe, etc.</p>
    
            <h2 className="text-xl font-semibold mt-6">2. Finalités du traitement</h2>
            <p className="mb-4">Ces données sont utilisées pour créer et gérer votre compte, améliorer le service, et vous contacter si nécessaire.</p>
    
            <h2 className="text-xl font-semibold mt-6">3. Cookies</h2>
            <p className="mb-4">Le site utilise des cookies à des fins de fonctionnement et d’analyse.</p>
    
            <h2 className="text-xl font-semibold mt-6">4. Durée de conservation</h2>
            <p className="mb-4">Vos données sont conservées aussi longtemps que votre compte est actif, sauf obligation légale contraire.</p>
    
            <h2 className="text-xl font-semibold mt-6">5. Vos droits</h2>
            <p className="mb-4">
            Vous disposez d’un droit d’accès, de rectification, de suppression et d’opposition. Pour exercer ces droits, contactez-nous à supportAlfredFacture@gmail.com.
            </p>
    
            <h2 className="text-xl font-semibold mt-6">6. Sécurité</h2>
            <p className="mb-4">Vos données sont stockées de manière sécurisée et protégées contre les accès non autorisés.</p>
    
            <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
            <p className="mb-4">Pour toute question relative à la protection de vos données, contactez : supportAlfredFacture@gmail.com.</p>
        </main>
      </div>
    );
  }
  