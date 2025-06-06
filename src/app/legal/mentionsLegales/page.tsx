import Header from "@/app/components/Header";

export default function MentionsLegales() {
    return (
        <div>
            <Header />

            <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Mentions légales</h1>

            <p className="mb-4">Conformément à l’article 6 de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici les informations concernant ce site.</p>

            <h2 className="text-xl font-semibold mt-6">1. Éditeur</h2>
            <p className="mb-4">
                Nom : Dervillers Loan<br />
                Adresse : Lyon<br />
                Email : supportAlfredFacture@gmail.com<br />
                {/* N° SIRET : [Numéro si société]<br /> */}
            </p>

            <h2 className="text-xl font-semibold mt-6">2. Hébergeur</h2>
            <p className="mb-4">
                Hébergeur : Vercel<br />
                Adresse : Vercel.com
            </p>

            <h2 className="text-xl font-semibold mt-6">3. Propriété intellectuelle</h2>
            <p className="mb-4">Tout le contenu présent sur le site est la propriété de l’éditeur, sauf mention contraire.</p>

            <h2 className="text-xl font-semibold mt-6">4. Responsabilité</h2>
            <p className="mb-4">L’éditeur ne saurait être tenu responsable des dommages liés à l’utilisation du site.</p>
            </main>
        </div>
    );
  }
  