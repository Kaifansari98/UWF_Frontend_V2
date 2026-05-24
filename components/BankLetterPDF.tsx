"use client";

import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type BankLetterPreviewData = {
  principal_headmaster: string;
  school_college_name: string;
  address: string;
  student_name: string;
  admission_no_gr_no: string;
  student_parent_name: string;
  class_course_program: string;
  academic_year_term: string;
  signatory_name?: string;
  generated_at?: string;
};

function formatLetterDate(dateString?: string) {
  if (!dateString) return "[Date]";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "[Date]";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const BLUE = "#0d4f9e";
const PINK = "#000000";
const LABEL_BG = "#f0f5ff";
const BORDER = "#d1d5db";
const MUTED = "#666666";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 42,
    paddingTop: 32,
    paddingBottom: 28,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#000000",
  },
  // ── Header ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: { width: 88, height: 48 },
  orgBlock: { flex: 1, paddingLeft: 14 },
  orgTitle: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    lineHeight: 1.15,
  },
  orgReg: { fontSize: 9, color: MUTED, marginTop: 3 },
  divider: { borderBottomWidth: 2, borderBottomColor: BLUE, marginBottom: 10 },
  // ── Ref / Date ──
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 9.5,
  },
  muted: { color: MUTED },
  pink: { color: PINK },
  // ── To ──
  toBlock: { marginBottom: 10 },
  toBold: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  toLine: { color: PINK, fontSize: 10 },
  // ── Subject ──
  subject: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textDecoration: "underline",
    marginBottom: 10,
  },
  salutation: { fontSize: 10, marginBottom: 7 },
  // ── Body ──
  bodyText: {
    fontSize: 10,
    textAlign: "justify",
    lineHeight: 1.55,
    marginBottom: 11,
  },
  // ── Section headings ──
  sectionHead: {
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    fontSize: 10,
    marginBottom: 2,
  },
  sectionSub: { color: "#999999", fontSize: 8.5, marginBottom: 6 },
  // ── Student table ──
  table: { borderWidth: 1, borderColor: BORDER, marginBottom: 12 },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tRowLast: { flexDirection: "row" },
  tLabel: {
    width: "44%",
    backgroundColor: LABEL_BG,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    paddingHorizontal: 7,
    paddingVertical: 5,
    color: BLUE,
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
  },
  tValue: {
    flex: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#000",
  },
  // ── Bank fill-in lines ──
  bankRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  bankLabel: { fontSize: 10, flexShrink: 0 },
  studentLabel: { width: 145, fontSize: 10, flexShrink: 0 },
  bankLine: {
    flex: 1,
    marginLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    height: 14,
  },
  bankValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 2,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  // ── Closing ──
  closing: {
    fontSize: 10,
    textAlign: "justify",
    lineHeight: 1.55,
    marginBottom: 12,
  },
  faithfully: { fontSize: 10, marginBottom: 18 },
  // ── Signatory ──
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sigBox: {
    borderWidth: 1,
    borderColor: "#aaaaaa",
    width: 105,
    height: 48,
    marginBottom: 5,
  },
  sigName: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  sigDesig: { color: MUTED, fontSize: 9 },
  sigOrg: { fontFamily: "Helvetica-Bold", color: BLUE, fontSize: 10 },
  sigEmail: { color: BLUE, fontSize: 9, textDecoration: "underline", marginTop: 2 },
  stampBox: {
    borderWidth: 2,
    borderColor: "#aaaaaa",
    borderRadius: 40,
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  stampText: { color: "#aaaaaa", fontSize: 7, textAlign: "center" },
  // ── Footer ──
  footerContainer: {
    position: "absolute",
    bottom: 20,
    left: 42,
    right: 42,
  },
  footerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    marginBottom: 7,
  },
  footerText: { color: BLUE, fontSize: 8.5, textAlign: "center" },
});

const STUDENT_ROWS = (l: BankLetterPreviewData) => [
  { label: "Student Name", value: l.student_name },
  { label: "Admission No. / GR No.", value: l.admission_no_gr_no },
  { label: "Parent's / Guardian's Name", value: l.student_parent_name },
  { label: "Class / Course / Program", value: l.class_course_program },
  { label: "Academic Year / Term", value: l.academic_year_term },
];

const BANK_LABELS = [
  "Bank Name",
  "Account Name",
  "Account Number",
  "IFSC Code",
  "Branch & Address",
];

export function BankLetterPDFDocument({
  letter,
  logoUrl,
}: {
  letter: BankLetterPreviewData;
  logoUrl: string;
}) {
  const rows = STUDENT_ROWS(letter);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.headerRow}>
          <Image src={logoUrl} style={s.logo} />
          <View style={s.orgBlock}>
            <Text style={s.orgTitle}>UNITED WELFARE FOUNDATION</Text>
            <Text style={s.orgReg}>
              Regd. F / 39715 / THANE | Dated: 24 / 07 / 2019
            </Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Ref + Date ── */}
        <View style={s.refRow}>
          <Text>
            {/*
            <Text style={s.muted}>Ref. No.:  </Text>
            <Text style={s.pink}>UWF / ______ / 2025–26</Text>
          */}
          </Text>
          <Text>
            <Text style={s.muted}>Date: </Text>
            <Text style={s.pink}>{formatLetterDate(letter.generated_at)}</Text>
          </Text>
        </View>

        {/* ── To ── */}
        <View style={s.toBlock}>
          <Text style={s.toBold}>To,</Text>
          <Text style={s.toLine}>{letter.principal_headmaster},</Text>
          <Text style={s.toLine}>{letter.school_college_name},</Text>
          <Text style={s.toLine}>{letter.address}</Text>
        </View>

        {/* ── Subject ── */}
        <Text style={s.subject}>
          Subject: Request for Institutional Banking Details for Student Fee
          Support
        </Text>

        <Text style={s.salutation}>Dear Sir / Madam,</Text>

        {/* ── Body ── */}
        <Text style={s.bodyText}>
          <Text style={{ fontFamily: "Helvetica-Bold", color: PINK }}>
            United Welfare Foundation (UWF)
          </Text>
          {
            ", a registered non-governmental organization in Maharashtra (Regd. No. F/39715/Thane, dated 24/07/2019), is committed to providing educational assistance to meritorious and deserving students under its "
          }
          <Text style={{ fontFamily: "Helvetica-Oblique" }}>
            UWF Student Aid Guidelines
          </Text>
          {
            ". Pursuant to the same, we intend to sponsor the academic fees of the student mentioned below, who is currently enrolled at your esteemed institution."
          }
        </Text>

        {/* ── Student Info ── */}
        <Text style={s.sectionHead}>
          Student Information{" "}
          <Text style={s.sectionSub}>(for fee payment reference)</Text>
        </Text>
        <View style={{ marginBottom: 12, marginTop: 6 }}>
          {rows.map((row) => (
            <View key={row.label} style={s.bankRow}>
              <Text style={s.studentLabel}>{row.label}</Text>
              <Text style={s.bankValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Bank Info ── */}
        <Text style={s.sectionHead}>School / College Bank Information</Text>
        <Text style={s.sectionSub}>
          Kindly furnish your institution&apos;s banking details to facilitate
          smooth and direct fee payment:
        </Text>
        <View style={{ marginBottom: 10, marginTop: 10 }}>
          {BANK_LABELS.map((label) => (
            <View key={label} style={s.bankRow}>
              <Text style={s.bankLabel}>{label}</Text>
              <View style={s.bankLine} />
            </View>
          ))}
          {/* Extra continuation line below Branch & Address */}
          <View style={s.bankRow}>
            <View
              style={{
                flex: 1,
                borderBottomWidth: 1,
                borderBottomColor: "#000000",
                height: 14,
              }}
            />
          </View>
        </View>

        {/* ── Closing ── */}
        <Text style={s.closing}>
          We confirm that all payments will be made exclusively through official
          banking channels in full compliance with applicable laws and
          institutional requirements. A NEFT transaction UTR number will be
          provided upon successful transfer as confirmation of fee payment. We
          sincerely appreciate your cooperation and support in facilitating
          access to quality education for deserving students.
        </Text>

        <Text style={s.faithfully}>Yours faithfully,</Text>

        {/* ── Signatory ── */}
        <View style={s.sigRow}>
          <View>
            <Text style={s.sigOrg}>United Welfare Foundation</Text>
            <Link
              src="mailto:united_welfare_foundation@outlook.com"
              style={s.sigEmail}
            >
              united_welfare_foundation@outlook.com
            </Link>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footerContainer}>
          <View style={s.footerDivider} />
          <Text style={s.footerText}>
            A-05 / 605, Millenium Tower, Sector 09, Sanpada, Navi Mumbai,
            Dist: Thane – 400705
          </Text>
        </View>
      </Page>
    </Document>
  );
}
