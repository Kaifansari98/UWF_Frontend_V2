// components/pdf/BankDetailsPDF.tsx

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#025aa5",
    marginBottom: 10,
  },
  regText: {
    fontSize: 10,
    fontWeight: "medium",
    color: "#000",
  },
  addressText: {
    fontSize: 9,
    fontWeight: "medium",
    color: "#5e5e5e",
  },
  logo: {
    width: 90,
    height: 90,
    objectFit: "contain",
  },
  section: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
  },
  heading: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  value: {
    fontSize: 9,
    color: "#111827",
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 4,
  },
});

const LabelValue = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | undefined;
  }) => (
    <View style={styles.column}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? "-"}</Text>
    </View>
  );

const BankDetailsPDF = ({ submission }: { submission: any }) => {
  const {
    parentName,
    mobile,
    alternateMobile,
    coordinatorName,
    coordinatorMobile,
    bankName,
    bankAccountHolder,
    bankAccountNumber,
    ifscCode,
    acceptedAmount,
  } = submission;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerText}>UNITED WELFARE FOUNDATION</Text>
            <Text style={styles.regText}>Regd. F / 39715 / THANE. DATED. 24 / 07 / 2019</Text>
            <Text style={styles.addressText}>
              A-05/605, MILLENNIUM TOWER, SECTOR 09, SANPADA, NAVI MUMBAI, THANE 400705
            </Text>
          </View>
          <Image src="/UWFLogo.png" style={styles.logo} />
        </View>

        {/* Section */}
        <View style={styles.section}>
  <Text style={styles.heading}>Bank Disbursement Details</Text>

  <View style={styles.row}>
    <LabelValue label="Parent / Guardian Name" value={parentName} />
    <LabelValue label="Mobile Number" value={mobile} />
  </View>

  <View style={styles.row}>
    <LabelValue label="Alternate Mobile Number" value={alternateMobile} />
    <LabelValue label="UWF Coordinator Name" value={coordinatorName} />
  </View>

  <View style={styles.row}>
    <LabelValue label="UWF Coordinator Mobile" value={coordinatorMobile} />
    <LabelValue label="Bank Name" value={bankName} />
  </View>

  <View style={styles.row}>
    <LabelValue label="Account Holder Name" value={bankAccountHolder} />
    <LabelValue label="Bank Account Number" value={bankAccountNumber} />
  </View>

  <View style={styles.row}>
    <LabelValue label="IFSC Code" value={ifscCode} />
    {typeof acceptedAmount === "number" && !isNaN(acceptedAmount) && (
      <LabelValue
        label="Accepted Amount"
        value={`${acceptedAmount.toLocaleString()}`}
      />
    )}
  </View>
</View>

      </Page>
    </Document>
  );
};

export default BankDetailsPDF;
