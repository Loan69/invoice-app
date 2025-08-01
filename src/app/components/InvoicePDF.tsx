import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { Profile } from '@/types/profile';
import { InvoiceWithClient } from '@/types/invoiceWithClient';
import { getTotalAmount } from "@/lib/utils";
import { Items } from '@/types/items';

type Props = {
  invoice: InvoiceWithClient;
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
    alignItems: 'center', // clé pour l’alignement vertical
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
   
});

export default function InvoicePDF({ invoice, profile }: Props) {
  const datefac = new Date(invoice.datefac);
  const dueDate = new Date(datefac);
  dueDate.setDate(dueDate.getDate() + 30);

  const totalHT = getTotalAmount(invoice.items ?? 0);

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

          {/* Informations facture */}
          <View style={styles.invoiceInfoBox}>
            <Text style={styles.invoiceInfoText}>
              <Text style={styles.bold}>{invoice.is_credit_note
                ? `Ce document annule la facture F-${invoice.original_invoice_id?.toString().padStart(4, '0')}`
                : `Facture n° F-${invoice.id_int.toString().padStart(4, '0')}`}
              </Text>
            </Text>
            <Text style={styles.invoiceInfoText}>
              <Text style={styles.bold}>Date : {datefac.toLocaleDateString()}</Text>
            </Text>
            <Text style={styles.invoiceInfoText}>
              <Text style={styles.bold}>Échéance : {dueDate.toLocaleDateString()}</Text>
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
            <Text style={styles.bold}>A l&apos;attention de :</Text>
            {invoice.clients?.last_name && (<Text>{invoice.clients?.first_name} {invoice.clients?.last_name}</Text>)}
            {invoice.clients?.company && (<Text>Société : {invoice.clients?.company}</Text>)}
            {invoice.clients?.address && (<Text>Adresse : {invoice.clients?.address}</Text>)}
            {invoice.clients?.email && (<Text>Email : {invoice.clients?.email}</Text>)}
          </View>

          {/* Statut de la facture */}
          {invoice.status && (<View style={styles.section}>
            <Text style={styles.statusText}>
              Statut de la facture : {invoice.status}
            </Text>
          </View>)}


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
            {invoice.items.map((item: Items, index: number) => (
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

          {/* Coordonnées bancaires */}
          {invoice.clients?.is_professional === true && (
            <View style={styles.ribBox}>
              <Text style={styles.ribTitle}>Coordonnées bancaires</Text>
              <Text style={styles.ribText}>IBAN : {profile.bank_details?.iban}</Text>
              <Text style={styles.ribText}>BIC : {profile.bank_details?.bic}</Text>
              <Text style={styles.ribText}>Banque : {profile.bank_details?.bank_name}</Text>
            </View>
          )}

            {/* Mentions légales */}
          <View>
            <Text style={styles.footerText}>
              Paiement à réception - Pénalités de retard : 10% du montant TTC - {tvaLabel}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
