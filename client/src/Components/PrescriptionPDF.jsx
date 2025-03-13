import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import signature from "../assets/signature.png";

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 12 },
  header: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  section: { marginBottom: 10 },
  infoBlock: {
    marginBottom: 10,
    padding: 10,
    border: "1 solid black",
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: { fontWeight: "bold" },
  signature: { width: 120, height: 60, marginTop: 10 },
  line: { borderBottom: "1 solid black", marginVertical: 5 },
  prescriptionHeader: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  medicineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottom: "1 solid #ccc",
  },
});

const PrescriptionPDF = ({ details }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Doctor’s Prescription</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.label}> Patient ID:</Text>
        <Text>{details.patientId}</Text>
        <Text style={{ marginTop: 5 }} style={styles.label}> Doctor ID:</Text>
        <Text>{details.doctorId}</Text>
        <Text style={{ marginTop: 5 }} style={styles.label}> Date:</Text>
        <Text>{new Date(details.timestamp).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.line}></Text>

      <Text style={styles.prescriptionHeader}>Prescribed Medicines:</Text>
      {details.medicines.map((med, index) => (
        <View key={index} style={styles.medicineRow}>
          <Text> {med.name}</Text>
          <Text>Dosage: {med.dosage}</Text>
          <Text>Freq: {med.frequency}</Text>
          <Text>Duration: {med.duration}</Text>
        </View>
      ))}

      <Text style={styles.line}></Text>

      <View style={styles.section}>
        <Text style={styles.label}> Digital Signature / Hash:</Text>
        <Text>{details.signature}</Text>
        {details.signatureImage && (
          <Image src={details.signatureImage} style={styles.signature} />
        )}
      </View>
    </Page>
  </Document>
);

export default PrescriptionPDF;