import { Invoice } from "@/types/invoice";
import { InvoiceWithClient } from "@/types/invoiceWithClient";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  companyInfo: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
  invoiceDetails: {
    border: "1px solid #000",
    padding: 10,
    marginBottom: 20,
  },
  table: {
    width: "auto",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "50%",
    fontWeight: "bold",
    paddingBottom: 5,
  },
  tableCol: {
    width: "50%",
    paddingBottom: 5,
  },
  footer: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 10,
    color: "gray",
  },
});

export default function InvoicePDF({ invoice }: { invoice: InvoiceWithClient }) {
  const clientName = invoice.client_id || "Client inconnu";
  const invoiceId = invoice.id_int || "0000";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>FACTURE</Text>

        <View style={styles.companyInfo}>
          <Text>Votre Société</Text>
          <Text>Adresse</Text>
          <Text>Email</Text>
          <Text>Téléphone</Text>
        </View>

        <View style={styles.invoiceDetails}>
          <Text><Text style={styles.label}>Facture n° :</Text> {invoiceId}</Text>
          <Text><Text style={styles.label}>Date :</Text> {invoice.date}</Text>
          <Text><Text style={styles.label}>Client :</Text> {clientName}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Description</Text>
            <Text style={styles.tableColHeader}>Montant</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Prestation ou produit</Text>
            <Text style={styles.tableCol}>{invoice.amount} €</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text><Text style={styles.label}>Statut :</Text> {invoice.status}</Text>
        </View>

        <Text style={styles.footer}>Merci pour votre confiance</Text>
      </Page>
    </Document>
  );
}
