import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link
} from "@react-pdf/renderer";
import { Check } from "lucide-react";


const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
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
  docTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 8,
  },
  docTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  dateText: {
    fontSize: 8,
    color: "#000",
  },
  section: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  heading: {
    fontSize: 11,
    fontWeight: "medium",
    color: "#1f2937",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  fullWidthGridItem: {
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 8,
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
  },
  reasonValue: {
    fontSize: 8,
    color: "#111827",
    marginTop: 2,
  },
});

const LabelValue = ({ label, value, isReason = false }: { label: string; value: string | number; isReason?: boolean }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    {typeof value === "string" && value.startsWith("http") ? (
      <Link src={value} style={styles.value}>
        {value}
      </Link>
    ) : (
      <Text style={isReason ? styles.reasonValue : styles.value}>{value || "-"}</Text>
    )}
  </View>
);

const StudentAidPDFDocument = ({ submission }: { submission: any }) => {
  const {
    formId,
    firstName,
    fatherName,
    familyName,
    gender,
    academicYear,
    studyMedium,
    class: className,
    schoolName,
    parentName,
    requested_amount,
    acceptedAmount,
    mobile,
    alternateMobile,
    incomeSource,
    address,
    reason,
    coordinatorName,
    coordinatorMobile,
    bankAccountHolder,
    bankAccountNumber,
    ifscCode,
    bankName,
    feesStructure,
    marksheet,
    signature,
    parentApprovalLetter,
    submitted_at,
  } = submission;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerText}>UNITED WELFARE FOUNDATION</Text>
            <Text style={styles.regText}>Regd. F / 39715 / THANE. DATED. 24 / 07 / 2019</Text>
            <Text style={styles.addressText}>A-05/605, MILLENNIUM TOWER, SECTOR 09, SANPADA, NAVI MUMBAI, THANE 400705</Text>
          </View>
          <Image src="/UWFLogo.png" style={styles.logo} />
        </View>

        {/* Document Title and Date */}
        <View style={styles.docTitleRow}>
          <Text style={styles.docTitle}>STUDENT AID REQUEST FORM</Text>
          <Text style={styles.dateText}>
            Date: {new Date(submitted_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Student Info */}
        <View style={styles.section}>
          <Text style={styles.heading}>Student Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <LabelValue label="Form ID" value={formId} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Student Name" value={`${firstName} ${fatherName} ${familyName}`} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Gender" value={gender.charAt(0).toUpperCase() + gender.slice(1)} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Academic Year" value={academicYear} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Study Medium" value={studyMedium} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Class / Grade / Standard" value={className} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="School Name & Address" value={schoolName} />
            </View>
          </View>
        </View>

        {/* Parent Info */}
        <View style={styles.section}>
          <Text style={styles.heading}>Parent / Guardian Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <LabelValue label="Parent / Guardian Name" value={parentName} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Requested Amount ( as per school / college )" value={`${requested_amount?.toLocaleString()}`} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Mobile Number ( WhatsApp Number )" value={mobile} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Alternate Mobile Number" value={alternateMobile} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Source of Income" value={incomeSource} />
            </View>
            {acceptedAmount !== undefined && acceptedAmount !== null && (
              <View style={styles.gridItem}>
                <LabelValue
                  label="Accepted Amount ( by UWF Treasurer )"
                  value={`${acceptedAmount.toLocaleString()}`}
                />  
              </View>
            )}
            <View style={styles.fullWidthGridItem}>
              <LabelValue label="Residence Address" value={address} />
            </View>
            <View style={styles.fullWidthGridItem}>
              <LabelValue label="Reason for requesting financial aid" value={reason} isReason={true} />
            </View>
          </View>
        </View>

        {/* Bank Info */}
        <View style={styles.section}>
          <Text style={styles.heading}>School Bank Account Details</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <LabelValue label="Bank Account Holder Name" value={bankAccountHolder.toUpperCase()} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Bank Account Number" value={bankAccountNumber.toUpperCase()} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="IFSC Code" value={ifscCode.toUpperCase()} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="Bank Name" value={bankName.toUpperCase()} />
            </View>
          </View>
        </View>

        {/* Coordinator Info */}
        <View style={styles.section}>
          <Text style={styles.heading}>UWF Member / Coordinator Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <LabelValue label="UWF Member / Coordinator Name" value={coordinatorName} />
            </View>
            <View style={styles.gridItem}>
              <LabelValue label="UWF Member / Coordinator Mobile Number" value={coordinatorMobile} />
            </View>
          </View>
        </View>

    {(feesStructure || marksheet || signature || parentApprovalLetter) && (
      <View style={styles.section} wrap={false}>
        <Text style={styles.heading}>Uploaded Documents</Text>
        <View style={styles.grid}>
          {feesStructure && (
            <View style={styles.fullWidthGridItem}>
              <LabelValue
                label="Fees Structure"
                value={`http://localhost:5000/assets/FormData/${feesStructure}`}
              />
            </View>
          )}
          {marksheet && (
            <View style={styles.fullWidthGridItem}>
              <LabelValue
                label="Marksheet"
                value={`http://localhost:5000/assets/FormData/${marksheet}`}
              />
            </View>
          )}
          {signature && (
            <View style={styles.fullWidthGridItem}>
              <LabelValue
                label="Parent/Guardian Signature"
                value={`http://localhost:5000/assets/FormData/${signature}`}
              />
            </View>
          )}
          {parentApprovalLetter && (
            <View style={styles.fullWidthGridItem}>
              <LabelValue
                label="Parent/Guardian Request Letter"
                value={`http://localhost:5000/assets/FormData/${parentApprovalLetter}`}
              />
            </View>
          )}
        </View>
      </View>
    )}

      </Page>
    </Document>
  );
};

export default StudentAidPDFDocument;