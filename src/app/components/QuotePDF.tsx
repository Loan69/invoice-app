import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image
} from '@react-pdf/renderer';
import { Profile } from '@/types/profile';
import { QuoteWithClient } from '@/types/quoteWithClient';
import { getTotalAmount } from "@/lib/utils";
import { Items } from '@/types/items';

type Props = {
quote: QuoteWithClient;
profile: Profile;
};

const styles = StyleSheet.create({
page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
},
section: {
    marginBottom: 20,
},
titleContainer: {
    textAlign: 'center',
    marginBottom: 20,
},
title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
},
invoiceInfoBox: {
    border: '1 solid #000',
    padding: 10,
    width: '100%',
    marginBottom: 20,
},
invoiceInfoText: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'left',
},
row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
},
tableHeaderText: {
    fontWeight: 'bold',
    borderBottom: '1px solid #000',
    paddingBottom: 4,
},

tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottom: '0.5px solid #ccc',
},

tableCellDescription: {
    width: '70%',
    fontSize: 10,
},

tableCellAmount: {
    width: '30%',
    fontSize: 10,
    textAlign: 'right',
},

bold: {
    fontWeight: 'bold',
},
ribBox: {
    marginTop: 20,
    padding: 10,
    border: '1px solid #000',
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
},
ribTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 12,
},
ribText: {
    fontSize: 11,
    lineHeight: 1.5,
},
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
},
companyInfo: {
    flex: 1,
    marginRight: 20,
},
logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
},
logoBox: {
    marginTop: 10,
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 4,
},
logo: {
    width: 200,
    height: 100,
    objectFit: 'contain',
},
statusText: {
    fontSize: 12,
    fontWeight: 'bold',
},
footerText: {
    fontSize: 10,
    color: '#666',
    width: '100%',
    textAlign: 'center',
    paddingHorizontal: 40,
},
container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
},
quoteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    },  
});

export default function InvoicePDF({ quote, profile }: Props) {
const datequo = new Date(quote.datequo);
const totalHT = getTotalAmount(quote.items ?? 0);

// TVA selon le tax_status
let tvaRate = 0;
let tvaLabel = "TVA non applicable, art. 293 B du CGI";
switch (profile.tax_status) {
    case 'Normal':
    tvaRate = 0.2;
    tvaLabel = 'TVA 20 %';
    break;
    case 'Réduit':
    tvaRate = 0.1;
    tvaLabel = 'TVA 10 %';
    break;
    case 'Super réduit':
    tvaRate = 0.055;
    tvaLabel = 'TVA 5.5 %';
    break;
    case 'Particulier':
    tvaRate = 0.021;
    tvaLabel = 'TVA 2.1 %';
    break;
    case 'Éxonéré':
    default:
    tvaRate = 0;
    tvaLabel = 'TVA non applicable, art. 293 B du CGI';
    break;
}

const montantTVA = totalHT * tvaRate;
const totalTTC = totalHT + montantTVA;

return (
    <Document>
    <Page size="A4" style={styles.page}>
        <View style={styles.container}>

        {/* Logo de l'utilisateur */}
        {profile.logo_url && (
            <View style={styles.logoContainer}>
                <Image
                src={`${profile.logo_url}?v=${Date.now()}`}
                style={styles.logo}
                />
            </View>
            )}

        {/* Informations Devis */}
        <View style={styles.invoiceInfoBox}>
        {/* Titre centré et plus gros */}
        <Text style={styles.quoteTitle}>
            Devis n°{quote.id_int.toString().padStart(4, "0")} - {quote.title}
        </Text>

        {/* Date normale, alignée à gauche */}
        <Text style={styles.invoiceInfoText}>
            <Text style={styles.bold}>Date : {datequo.toLocaleDateString()}</Text>
        </Text>
        </View>


        {/* Émetteur */}
        <View style={styles.section}>
            <Text style={styles.bold}>Société émettrice : {profile.company}</Text>
            {profile.address && (<Text>Adresse : {profile.address}</Text>)}
            {profile.siret && (<Text>Siret : {profile.siret}</Text>)}
            {profile.email && (<Text>Email : {profile.email}</Text>)}
            {profile.phone && (<Text>Téléphone : {profile.phone}</Text>)}
        </View>

        {/* Client */}
        <View style={styles.section}>
            <Text style={styles.bold}>À l&apos;attention de :</Text>
            {quote.clients?.last_name && (<Text>{quote.clients?.first_name} {quote.clients?.last_name}</Text>)}
            {quote.clients?.company && (<Text>Société : {quote.clients?.company}</Text>)}
            {quote.clients?.address && (<Text>Adresse : {quote.clients?.address}</Text>)}
            {quote.clients?.email && (<Text>Email : {quote.clients?.email}</Text>)}
        </View>


        {/* Détail des prestations */}
        <View style={styles.section}>
            <Text style={styles.bold}>Détails :</Text>

            {/* En-tête du tableau */}
            <View style={styles.tableRow}>
            <Text style={[styles.tableCellDescription, styles.tableHeaderText]}>
                Description
            </Text>
            <Text style={[styles.tableCellAmount, styles.tableHeaderText]}>
                Montant HT
            </Text>
            </View>

            {/* Lignes de prestations */}
            {quote.items.map((item: Items, index: number) => (
            <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCellDescription}>{item.description}</Text>
                <Text style={styles.tableCellAmount}>{item.amount} €</Text>
            </View>
            ))}
        </View>


        {/* Totaux */}
        <View style={styles.section}>
            <Text style={styles.bold}>Récapitulatif :</Text>
            <View style={styles.row}>
            <Text>Total HT :</Text>
            <Text>{totalHT.toFixed(2)} €</Text>
            </View>
            <View style={styles.row}>
            <Text>TVA ({(tvaRate * 100).toFixed(1)}%) :</Text>
            <Text>{montantTVA.toFixed(2)} €</Text>
            </View>
            <View style={styles.row}>
            <Text style={styles.bold}>Total TTC :</Text>
            <Text style={styles.bold}>{totalTTC.toFixed(2)} €</Text>
            </View>
        </View>

            {/* Mentions légales */}
        <View>
            <Text style={styles.footerText}>
                Cette offre est valable 2 mois à compter de la date du devis - {tvaLabel}
            </Text>
        </View>
        </View>

    </Page>
    </Document>
);
}
