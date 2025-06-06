import Header from "@/app/components/Header";

export default function CGU() {
    return (
      <div>
        <Header />
        <main className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">Conditions Générales d’Utilisation</h1>
    
          <p className="mb-4">Dernière mise à jour : 6 juin 2025</p>
    
          <p className="mb-4">
            Les présentes Conditions Générales d’Utilisation (ci-après « CGU ») régissent l’accès et l’utilisation du site Alfred Facture.
          </p>
    
          <h2 className="text-xl font-semibold mt-6">1. Acceptation des conditions</h2>
          <p className="mb-4">En accédant au site, vous acceptez sans réserve les présentes CGU.</p>
    
          <h2 className="text-xl font-semibold mt-6">2. Services proposés</h2>
          <p className="mb-4">Alfred Facture propose un service permettant aux entrepreneurs de créer, gérer et envoyer facilement leurs factures. Le service inclut la gestion des clients, le suivi des paiements, et l’édition de documents conformes à la législation française, avec ou sans TVA..</p>
    
          <h2 className="text-xl font-semibold mt-6">3. Accès au service</h2>
          <p className="mb-4">Le service est accessible 24h/24 et 7j/7, sauf interruption pour maintenance.</p>
    
          <h2 className="text-xl font-semibold mt-6">4. Responsabilités</h2>
          <p className="mb-4">L’éditeur ne peut être tenu responsable en cas de dommages résultant de l’utilisation du service.</p>
    
          <h2 className="text-xl font-semibold mt-6">5. Données personnelles</h2>
          <p className="mb-4">
            Pour plus d’informations sur la collecte et le traitement des données, consultez notre <a href="/legal/confidentialite" className="text-blue-600 underline">Politique de confidentialité</a>.
          </p>
    
          <h2 className="text-xl font-semibold mt-6">6. Propriété intellectuelle</h2>
          <p className="mb-4">Le contenu du site est protégé par les lois relatives à la propriété intellectuelle.</p>
    
          <h2 className="text-xl font-semibold mt-6">7. Droit applicable</h2>
          <p className="mb-4">Les présentes CGU sont régies par le droit français.</p>
        </main>
      </div>
    );
  }
  