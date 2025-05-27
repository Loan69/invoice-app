import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer';
import { Profile } from '@/types/profile';
import { InvoiceWithClient } from '@/types/invoiceWithClient'

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
  tableHeader: {
    fontWeight: 'bold',
    marginTop: 10,
    borderBottom: '1px solid #000',
    paddingBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '0.5px solid #ccc',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default function InvoicePDF({ invoice, profile }: Props) {
  const datefac = new Date(invoice.datefac).toLocaleDateString();
  const totalHT = invoice.amount ?? 0;
  const tvaRate = profile.vat_applicable ? 0.2 : 0;
  const montantTVA = totalHT * tvaRate;
  const totalTTC = totalHT + montantTVA;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
         {/* Titre centré */}
         <View style={styles.titleContainer}>
          <Text style={styles.title}>Facture</Text>
        </View>

        {/* Bloc d'informations à droite */}
        <View style={styles.invoiceInfoBox}>
          <Text style={styles.invoiceInfoText}>
            <Text style={styles.bold}>Facture n° {invoice.id_int.toString().padStart(4, '0')}</Text>
          </Text>
          <Text style={styles.invoiceInfoText}>
            <Text style={styles.bold}>Date : {datefac}</Text>
          </Text>
        </View>

        {/* Émetteur */}
        <View style={styles.section}>
          <Text style={styles.bold}>Société émettrice : {profile.company}</Text>
          <Text>Adresse : {profile.address}</Text>
          <Text>Siret : {profile.siret}</Text>
          <Text>Email : {profile.email}</Text>
        </View>

        {/* Destinataire */}
        <View style={styles.section}>
          <Text style={styles.bold}>Client :</Text>
          <Text>{invoice.clients?.first_name} {invoice.clients?.last_name}</Text>
          <Text>Société : {invoice.clients?.company}</Text>
          <Text>Adresse : {invoice.clients?.address}</Text>
          <Text>Email : {invoice.clients?.email}</Text>
        </View>

        {/* Détail des prestations */}
        <View style={styles.section}>
          <Text style={styles.bold}>Détails :</Text>
          <View style={styles.tableHeader}>
            <Text style={{ width: '70%' }}>Description</Text>
            <Text style={{ width: '30%', textAlign: 'right' }}>Montant HT</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={{ width: '70%' }}>{invoice.description}</Text>
            <Text style={{ width: '30%', textAlign: 'right' }}>{totalHT.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Totaux */}
        <View style={styles.section}>
          <Text style={styles.bold}>Récapitulatif :</Text>
          <View style={styles.row}>
            <Text>Total HT :</Text>
            <Text>{totalHT.toFixed(2)} €</Text>
          </View>
          <View style={styles.row}>
            <Text>TVA ({(tvaRate * 100).toFixed(0)}%) :</Text>
            <Text>{montantTVA.toFixed(2)} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Total TTC :</Text>
            <Text style={styles.bold}>{totalTTC.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Mentions légales */}
        <View style={styles.section}>
          <Text>Conditions de paiement : à réception</Text>
          <Text>Pénalités de retard : 10% du montant TTC</Text>
          <Text>{profile.vat_applicable ? `TVA : 20 %` : "TVA non applicable, art. 293 B du CGI"}</Text>
        </View>
      </Page>
    </Document>
  );
}
