"use client";
import { useState } from "react";
import { ParentLoginScreen, ParentPortalApp } from "./ParentPortal";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  Wallet,
  UtensilsCrossed,
  UserCog,
  Bell,
  Plus,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ArrowLeft,
  Shield,
  BookOpen,
  UserPlus,
  Lock,
  Phone,
  User,
  CreditCard,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Receipt,
  Printer,
  RefreshCw,
  CalendarDays,
  CircleCheck,
  CircleMinus,
  CircleX,
  Menu,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
type Screen =
  | "dashboard"
  | "students"
  | "ledger"
  | "finance"
  | "accountant"
  | "cafeteria"
  | "staff";

interface PaymentItem {
  id: string;
  label: string;
  type:
    | "inscription"
    | "scolarite"
    | "cantine"
    | "uniforme"
    | "livres"
    | "activites";
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  paidDate?: string;
  status: "paid" | "partial" | "overdue" | "pending";
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  levelGroup: "maternelle" | "cp" | "ce" | "cm";
  birthDate: string;
  parentName: string;
  parentPhone: string;
  enrollmentType: "new" | "returning";
  annualFee: number;
  canteenSubscribed: boolean;
  canteenPaid: boolean;
  payments: PaymentItem[];
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  studentName?: string;
  studentLevel?: string;
  category: string;
  amount: number;
  direction: "in" | "out";
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  level?: string;
  salary: number;
  joinDate: string;
  paidThisMonth: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const fmtShort = (n: number) => {
  if (n >= 1000000)
    return (
      (n / 1000000).toFixed(1).replace(".", ",") + " M FCFA"
    );
  if (n >= 1000) return (n / 1000).toFixed(0) + " K FCFA";
  return fmt(n);
};

// ── Mock Data ────────────────────────────────────────────────────

const mkPayments = (
  fee: number,
  scenario:
    | "all_paid"
    | "jan_overdue"
    | "partial_dec"
    | "two_months_late"
    | "only_deposit",
): PaymentItem[] => {
  const deposit = Math.round(fee * 0.2);
  const inst = Math.round((fee - deposit) / 4);
  const last = fee - deposit - inst * 3;

  const base = [
    {
      id: "p1",
      label: "Inscription (dépôt)",
      type: "inscription" as const,
      dueDate: "2025-06-01",
      dueAmount: deposit,
    },
    {
      id: "p2",
      label: "Scolarité — Octobre",
      type: "scolarite" as const,
      dueDate: "2025-10-05",
      dueAmount: inst,
    },
    {
      id: "p3",
      label: "Scolarité — Novembre",
      type: "scolarite" as const,
      dueDate: "2025-11-05",
      dueAmount: inst,
    },
    {
      id: "p4",
      label: "Scolarité — Décembre",
      type: "scolarite" as const,
      dueDate: "2025-12-05",
      dueAmount: inst,
    },
    {
      id: "p5",
      label: "Scolarité — Janvier",
      type: "scolarite" as const,
      dueDate: "2026-01-05",
      dueAmount: last,
    },
  ];

  const paidDates = [
    "2025-05-28",
    "2025-10-03",
    "2025-11-05",
    "2025-12-02",
    "2026-01-04",
  ];

  if (scenario === "all_paid") {
    return base.map((p, i) => ({
      ...p,
      paidAmount: p.dueAmount,
      paidDate: paidDates[i],
      status: "paid" as const,
    }));
  }
  if (scenario === "jan_overdue") {
    return base.map((p, i) => ({
      ...p,
      paidAmount: i < 4 ? p.dueAmount : 0,
      paidDate: i < 4 ? paidDates[i] : undefined,
      status: (i < 4
        ? "paid"
        : "overdue") as PaymentItem["status"],
    }));
  }
  if (scenario === "partial_dec") {
    return base.map((p, i) => ({
      ...p,
      paidAmount:
        i < 3
          ? p.dueAmount
          : i === 3
            ? Math.round(p.dueAmount / 2)
            : 0,
      paidDate:
        i < 3
          ? paidDates[i]
          : i === 3
            ? "2025-12-10"
            : undefined,
      status: (i < 3
        ? "paid"
        : i === 3
          ? "partial"
          : "overdue") as PaymentItem["status"],
    }));
  }
  if (scenario === "two_months_late") {
    return base.map((p, i) => ({
      ...p,
      paidAmount: i < 2 ? p.dueAmount : 0,
      paidDate: i < 2 ? paidDates[i] : undefined,
      status: (i < 2
        ? "paid"
        : "overdue") as PaymentItem["status"],
    }));
  }
  // only_deposit
  return base.map((p, i) => ({
    ...p,
    paidAmount: i === 0 ? p.dueAmount : 0,
    paidDate: i === 0 ? "2025-06-15" : undefined,
    status: (i === 0
      ? "paid"
      : "overdue") as PaymentItem["status"],
  }));
};

const STUDENTS: Student[] = [
  {
    id: "s1",
    firstName: "Aminata",
    lastName: "Koné",
    level: "Petite Section",
    levelGroup: "maternelle",
    birthDate: "2022-03-14",
    parentName: "Koné Drissa",
    parentPhone: "07 12 34 56",
    enrollmentType: "new",
    annualFee: 280000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(280000, "all_paid"),
  },
  {
    id: "s2",
    firstName: "Sékou",
    lastName: "Diabaté",
    level: "Moyenne Section",
    levelGroup: "maternelle",
    birthDate: "2021-07-22",
    parentName: "Diabaté Mariam",
    parentPhone: "05 67 89 01",
    enrollmentType: "returning",
    annualFee: 280000,
    canteenSubscribed: true,
    canteenPaid: false,
    payments: mkPayments(280000, "jan_overdue"),
  },
  {
    id: "s3",
    firstName: "Jean-Baptiste",
    lastName: "Coulibaly",
    level: "Grande Section",
    levelGroup: "maternelle",
    birthDate: "2020-11-05",
    parentName: "Coulibaly Sita",
    parentPhone: "01 23 45 67",
    enrollmentType: "returning",
    annualFee: 280000,
    canteenSubscribed: false,
    canteenPaid: false,
    payments: mkPayments(280000, "all_paid"),
  },
  {
    id: "s4",
    firstName: "Mariam",
    lastName: "Traoré",
    level: "CP1",
    levelGroup: "cp",
    birthDate: "2019-05-18",
    parentName: "Traoré Boubacar",
    parentPhone: "07 45 67 89",
    enrollmentType: "returning",
    annualFee: 300000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(300000, "all_paid"),
  },
  {
    id: "s5",
    firstName: "Ibrahim",
    lastName: "Ouattara",
    level: "CP1",
    levelGroup: "cp",
    birthDate: "2019-08-30",
    parentName: "Ouattara Hawa",
    parentPhone: "05 34 56 78",
    enrollmentType: "returning",
    annualFee: 300000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(300000, "partial_dec"),
  },
  {
    id: "s6",
    firstName: "Adjoua",
    lastName: "Camara",
    level: "CP2",
    levelGroup: "cp",
    birthDate: "2018-12-01",
    parentName: "Camara Fatou",
    parentPhone: "07 89 01 23",
    enrollmentType: "returning",
    annualFee: 300000,
    canteenSubscribed: false,
    canteenPaid: false,
    payments: mkPayments(300000, "jan_overdue"),
  },
  {
    id: "s7",
    firstName: "Kouamé",
    lastName: "Sanogo",
    level: "CP2",
    levelGroup: "cp",
    birthDate: "2018-04-17",
    parentName: "Sanogo Paul",
    parentPhone: "01 56 78 90",
    enrollmentType: "returning",
    annualFee: 300000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(300000, "all_paid"),
  },
  {
    id: "s8",
    firstName: "Fatou",
    lastName: "Bamba",
    level: "CE1",
    levelGroup: "ce",
    birthDate: "2017-09-22",
    parentName: "Bamba Souleymane",
    parentPhone: "07 23 45 67",
    enrollmentType: "returning",
    annualFee: 320000,
    canteenSubscribed: true,
    canteenPaid: false,
    payments: mkPayments(320000, "two_months_late"),
  },
  {
    id: "s9",
    firstName: "Mamadou",
    lastName: "Diallo",
    level: "CE1",
    levelGroup: "ce",
    birthDate: "2017-02-08",
    parentName: "Diallo Awa",
    parentPhone: "05 90 12 34",
    enrollmentType: "returning",
    annualFee: 320000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(320000, "all_paid"),
  },
  {
    id: "s10",
    firstName: "Awa",
    lastName: "Touré",
    level: "CE2",
    levelGroup: "ce",
    birthDate: "2016-06-11",
    parentName: "Touré Abou",
    parentPhone: "07 67 89 01",
    enrollmentType: "returning",
    annualFee: 320000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(320000, "jan_overdue"),
  },
  {
    id: "s11",
    firstName: "Moussa",
    lastName: "Cissé",
    level: "CE2",
    levelGroup: "ce",
    birthDate: "2016-10-25",
    parentName: "Cissé Rokia",
    parentPhone: "01 34 56 78",
    enrollmentType: "returning",
    annualFee: 320000,
    canteenSubscribed: false,
    canteenPaid: false,
    payments: mkPayments(320000, "all_paid"),
  },
  {
    id: "s12",
    firstName: "Marie-Laure",
    lastName: "Konaté",
    level: "CM1",
    levelGroup: "cm",
    birthDate: "2015-01-19",
    parentName: "Konaté Tidiane",
    parentPhone: "07 12 90 34",
    enrollmentType: "returning",
    annualFee: 340000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(340000, "all_paid"),
  },
  {
    id: "s13",
    firstName: "Franck",
    lastName: "Bakayoko",
    level: "CM1",
    levelGroup: "cm",
    birthDate: "2015-05-03",
    parentName: "Bakayoko Yves",
    parentPhone: "05 78 90 12",
    enrollmentType: "returning",
    annualFee: 340000,
    canteenSubscribed: true,
    canteenPaid: false,
    payments: mkPayments(340000, "only_deposit"),
  },
  {
    id: "s14",
    firstName: "Hawa",
    lastName: "Dembélé",
    level: "CM2",
    levelGroup: "cm",
    birthDate: "2014-08-14",
    parentName: "Dembélé Moussa",
    parentPhone: "07 56 78 90",
    enrollmentType: "returning",
    annualFee: 340000,
    canteenSubscribed: true,
    canteenPaid: true,
    payments: mkPayments(340000, "all_paid"),
  },
  {
    id: "s15",
    firstName: "Théodore",
    lastName: "Fofana",
    level: "CM2",
    levelGroup: "cm",
    birthDate: "2014-03-29",
    parentName: "Fofana Saran",
    parentPhone: "01 90 12 34",
    enrollmentType: "returning",
    annualFee: 340000,
    canteenSubscribed: false,
    canteenPaid: false,
    payments: mkPayments(340000, "partial_dec"),
  },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "2026-01-15",
    description: "Versement scolarité Janvier",
    studentName: "Mariam Traoré",
    studentLevel: "CP1",
    category: "Scolarité",
    amount: 60000,
    direction: "in",
  },
  {
    id: "t2",
    date: "2026-01-14",
    description: "Abonnement cantine — Janvier",
    studentName: "Aminata Koné",
    studentLevel: "PS",
    category: "Cantine",
    amount: 15000,
    direction: "in",
  },
  {
    id: "t3",
    date: "2026-01-13",
    description: "Versement scolarité Janvier",
    studentName: "Mamadou Diallo",
    studentLevel: "CE1",
    category: "Scolarité",
    amount: 64000,
    direction: "in",
  },
  {
    id: "t4",
    date: "2026-01-12",
    description: "Achat fournitures bureau",
    studentName: undefined,
    studentLevel: undefined,
    category: "Charges",
    amount: 45000,
    direction: "out",
  },
  {
    id: "t5",
    date: "2026-01-10",
    description: "Versement scolarité Janvier",
    studentName: "Awa Touré",
    studentLevel: "CE2",
    category: "Scolarité",
    amount: 64000,
    direction: "in",
  },
  {
    id: "t6",
    date: "2026-01-08",
    description: "Facture électricité Décembre",
    studentName: undefined,
    studentLevel: undefined,
    category: "Charges",
    amount: 82000,
    direction: "out",
  },
  {
    id: "t7",
    date: "2026-01-07",
    description: "Vente uniforme scolaire",
    studentName: "Ibrahim Ouattara",
    studentLevel: "CP1",
    category: "Uniformes",
    amount: 35000,
    direction: "in",
  },
  {
    id: "t8",
    date: "2026-01-06",
    description: "Frais examen CE1 2nd trimestre",
    studentName: "Fatou Bamba",
    studentLevel: "CE1",
    category: "Examens",
    amount: 5000,
    direction: "in",
  },
  {
    id: "t9",
    date: "2026-01-05",
    description: "Versement scolarité Janvier",
    studentName: "Marie-Laure Konaté",
    studentLevel: "CM1",
    category: "Scolarité",
    amount: 68000,
    direction: "in",
  },
  {
    id: "t10",
    date: "2025-12-28",
    description: "Activités extra-scolaires T2",
    studentName: "Jean-Baptiste Coulibaly",
    studentLevel: "GS",
    category: "Activités",
    amount: 20000,
    direction: "in",
  },
];

const STAFF: StaffMember[] = [
  {
    id: "st1",
    name: "Mme Kouassi Bernadette",
    role: "Directrice",
    level: undefined,
    salary: 450000,
    joinDate: "2015-09-01",
    paidThisMonth: true,
  },
  {
    id: "st2",
    name: "M. Yao Edmond",
    role: "Secrétaire",
    level: undefined,
    salary: 180000,
    joinDate: "2018-09-01",
    paidThisMonth: true,
  },
  {
    id: "st3",
    name: "Mme Traoré Salimata",
    role: "Enseignante",
    level: "CP1 / CP2",
    salary: 250000,
    joinDate: "2019-09-01",
    paidThisMonth: true,
  },
  {
    id: "st4",
    name: "M. Coulibaly Mamadou",
    role: "Enseignant",
    level: "CE1 / CE2",
    salary: 250000,
    joinDate: "2017-09-01",
    paidThisMonth: true,
  },
  {
    id: "st5",
    name: "Mme Diallo Hawa",
    role: "Enseignante",
    level: "CM1 / CM2",
    salary: 270000,
    joinDate: "2016-09-01",
    paidThisMonth: false,
  },
  {
    id: "st6",
    name: "Mme Bamba Fatoumata",
    role: "Enseignante",
    level: "Maternelle",
    salary: 220000,
    joinDate: "2020-09-01",
    paidThisMonth: true,
  },
  {
    id: "st7",
    name: "Mme Koné Awa",
    role: "Responsable Cantine",
    level: undefined,
    salary: 120000,
    joinDate: "2021-01-15",
    paidThisMonth: true,
  },
  {
    id: "st8",
    name: "M. Ouédraogo Issa",
    role: "Agent d'entretien",
    level: undefined,
    salary: 80000,
    joinDate: "2019-02-01",
    paidThisMonth: false,
  },
];

const revenueByCategory = [
  { name: "Scolarité", montant: 12500000 },
  { name: "Cantine", montant: 2800000 },
  { name: "Inscription", montant: 1750000 },
  { name: "Uniformes", montant: 850000 },
  { name: "Livres", montant: 650000 },
  { name: "Activités", montant: 350000 },
];

const monthlyFlow = [
  { mois: "Sep", revenus: 2100000, dépenses: 1820000 },
  { mois: "Oct", revenus: 5800000, dépenses: 2100000 },
  { mois: "Nov", revenus: 5200000, dépenses: 1950000 },
  { mois: "Déc", revenus: 4100000, dépenses: 2200000 },
  { mois: "Jan", revenus: 1650000, dépenses: 1820000 },
  { mois: "Fév", revenus: 980000, dépenses: 1820000 },
];

// ── Constants ────────────────────────────────────────────────────
const SIDEBAR_GREEN = "#1C3D2F";
const SIDEBAR_MID = "#1F4534";
const AMBER = "#D9820C";
const AMBER_FAINT = "#FEF5E4";
const CREAM = "#F3EFE6";

const FEE_SCHEDULE = [
  {
    level: "Petite Section",
    annual: 280000,
    deposit: 56000,
    oct: 56000,
    nov: 56000,
    dec: 56000,
    jan: 56000,
  },
  {
    level: "Moyenne Section",
    annual: 280000,
    deposit: 56000,
    oct: 56000,
    nov: 56000,
    dec: 56000,
    jan: 56000,
  },
  {
    level: "Grande Section",
    annual: 280000,
    deposit: 56000,
    oct: 56000,
    nov: 56000,
    dec: 56000,
    jan: 56000,
  },
  {
    level: "CP1",
    annual: 300000,
    deposit: 60000,
    oct: 60000,
    nov: 60000,
    dec: 60000,
    jan: 60000,
  },
  {
    level: "CP2",
    annual: 300000,
    deposit: 60000,
    oct: 60000,
    nov: 60000,
    dec: 60000,
    jan: 60000,
  },
  {
    level: "CE1",
    annual: 320000,
    deposit: 64000,
    oct: 64000,
    nov: 64000,
    dec: 64000,
    jan: 64000,
  },
  {
    level: "CE2",
    annual: 320000,
    deposit: 64000,
    oct: 64000,
    nov: 64000,
    dec: 64000,
    jan: 64000,
  },
  {
    level: "CM1",
    annual: 340000,
    deposit: 68000,
    oct: 68000,
    nov: 68000,
    dec: 68000,
    jan: 68000,
  },
  {
    level: "CM2",
    annual: 340000,
    deposit: 68000,
    oct: 68000,
    nov: 68000,
    dec: 68000,
    jan: 68000,
  },
];

// ── Sub-components ───────────────────────────────────────────────

function StatusBadge({
  status,
}: {
  status: PaymentItem["status"];
}) {
  const map = {
    paid: {
      label: "Réglé",
      bg: "#DCFCE7",
      color: "#166534",
      icon: <CircleCheck size={12} />,
    },
    partial: {
      label: "Partiel",
      bg: "#FEF3C7",
      color: "#92400E",
      icon: <CircleMinus size={12} />,
    },
    overdue: {
      label: "En retard",
      bg: "#FEE2E2",
      color: "#991B1B",
      icon: <CircleX size={12} />,
    },
    pending: {
      label: "À venir",
      bg: "#F5F5F4",
      color: "#57534E",
      icon: <Clock size={12} />,
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon} {s.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  sub,
  trend,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm border"
      style={{ borderColor: "#E8E2D6" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="text-sm font-medium"
          style={{ color: "#6B6557" }}
        >
          {label}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: accent ?? "#EEF4F1" }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div
          className="font-mono text-2xl font-semibold tracking-tight"
          style={{ color: "#1A1A1A" }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="text-xs mt-1 flex items-center gap-1"
            style={{
              color:
                trend === "up"
                  ? "#166534"
                  : trend === "down"
                    ? "#991B1B"
                    : "#6B6557",
            }}
          >
            {trend === "up" && <TrendingUp size={11} />}
            {trend === "down" && <TrendingDown size={11} />}
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2
          className="text-xl font-bold"
          style={{ color: "#1A1A1A" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm mt-0.5"
            style={{ color: "#6B6557" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

function Btn({
  children,
  variant = "primary",
  onClick,
  small,
  icon,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "amber";
  onClick?: () => void;
  small?: boolean;
  icon?: React.ReactNode;
}) {
  const base = `inline-flex items-center gap-2 font-medium rounded-lg cursor-pointer border transition-fast ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`;
  const variants = {
    primary: {
      background: SIDEBAR_GREEN,
      color: "#fff",
      borderColor: SIDEBAR_GREEN,
    },
    secondary: {
      background: "#fff",
      color: "#1A1A1A",
      borderColor: "#E8E2D6",
    },
    ghost: {
      background: "transparent",
      color: "#6B6557",
      borderColor: "transparent",
    },
    amber: {
      background: AMBER,
      color: "#fff",
      borderColor: AMBER,
    },
  };
  return (
    <button
      className={base}
      style={variants[variant]}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────

const navItems = [
  {
    id: "dashboard" as Screen,
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  { id: "students" as Screen, label: "Élèves", icon: Users },
  { id: "finance" as Screen, label: "Finance", icon: Wallet },
  {
    id: "cafeteria" as Screen,
    label: "Cantine",
    icon: UtensilsCrossed,
  },
  { id: "staff" as Screen, label: "Personnel", icon: UserCog },
  {
    id: "accountant" as Screen,
    label: "Vue Comptable",
    icon: Shield,
  },
];

function Sidebar({
  screen,
  setScreen,
  collapsed,
  setCollapsed,
  onOpenParentPortal,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
  onOpenParentPortal: () => void;
}) {
  return (
    <aside
      className="flex-shrink-0 flex flex-col h-full transition-all duration-300"
      style={{
        width: collapsed ? 64 : 240,
        background: SIDEBAR_GREEN,
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-4 gap-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: AMBER }}
        >
          <BookOpen size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm leading-none">
              SGE
            </div>
            <div
              className="text-xs mt-0.5 truncate"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Ecole Primaire D'Abidjan
            </div>
          </div>
        )}
        <button
          className="ml-auto text-white/40 hover:text-white/70 transition-fast"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className="w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-fast"
              style={{
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed
                  ? "center"
                  : "flex-start",
                background: active
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
                color: active
                  ? "#fff"
                  : "rgba(255,255,255,0.55)",
                borderLeft: active
                  ? `3px solid ${AMBER}`
                  : "3px solid transparent",
              }}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.id === "accountant" && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  RO
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Parent portal entry */}
      <div className="px-2 mb-2">
        <button
          onClick={onOpenParentPortal}
          className="w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-fast"
          style={{
            padding: collapsed ? "10px 0" : "10px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.6)",
            borderLeft: "3px solid transparent",
          }}
        >
          <User size={18} className="flex-shrink-0" />
          {!collapsed && (
            <span className="flex-1 text-left">Portail Parents</span>
          )}
          {!collapsed && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
            >
              Démo
            </span>
          )}
        </button>
      </div>

      {/* Overdue alert */}
      {!collapsed && (
        <div
          className="mx-3 mb-3 p-3 rounded-xl"
          style={{ background: "rgba(217,130,12,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={13} style={{ color: AMBER }} />
            <span
              className="text-xs font-semibold"
              style={{ color: AMBER }}
            >
              3 retards de paiement
            </span>
          </div>
          <p
            className="text-xs leading-snug"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Relances à effectuer
          </p>
        </div>
      )}

      {/* User */}
      <div
        className="p-3 border-t flex items-center gap-3"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
          style={{ background: SIDEBAR_MID }}
        >
          KB
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white text-xs font-semibold truncate">
              Mme Kouassi B.
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Directrice
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Dashboard View ───────────────────────────────────────────────

function DashboardView({
  setScreen,
  setSelectedStudent,
}: {
  setScreen: (s: Screen) => void;
  setSelectedStudent: (id: string) => void;
}) {
  const totalStudents = STUDENTS.length;
  const totalRevenue = 18850000;
  const outstanding = STUDENTS.reduce((acc, s) => {
    const unpaid = s.payments.reduce(
      (a, p) => a + (p.dueAmount - p.paidAmount),
      0,
    );
    return acc + unpaid;
  }, 0);
  const monthRevenue = 1650000;

  const overdueStudents = STUDENTS.filter((s) =>
    s.payments.some((p) => p.status === "overdue"),
  );

  const customTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      color: string;
    }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="bg-white rounded-xl shadow-lg p-3 text-xs border"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div
          className="font-semibold mb-2"
          style={{ color: "#1A1A1A" }}
        >
          {label}
        </div>
        {payload.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-2 justify-between"
          >
            <span style={{ color: "#6B6557" }}>{p.name}</span>
            <span
              className="font-mono font-medium"
              style={{ color: p.color }}
            >
              {fmtShort(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="text-xs font-medium mb-1"
            style={{ color: "#9B9589" }}
          >
            Année scolaire 2025–2026
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "#1A1A1A" }}
          >
            Tableau de bord
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6B6557" }}
          >
            École Primaire d'Abidjan — Janvier 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer"
              style={{
                borderColor: "#E8E2D6",
                background: "#fff",
              }}
            >
              <Bell size={16} style={{ color: "#6B6557" }} />
            </div>
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center"
              style={{ background: "#C0392B", fontSize: 10 }}
            >
              3
            </span>
          </div>
          <Btn
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setScreen("students")}
          >
            Nouvel élève
          </Btn>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Élèves inscrits"
          value={String(totalStudents)}
          sub="+3 nouvelles inscriptions"
          trend="up"
          accent="#EEF4F1"
          icon={
            <GraduationCap
              size={20}
              style={{ color: SIDEBAR_GREEN }}
            />
          }
        />
        <MetricCard
          label="Revenus collectés"
          value={fmtShort(totalRevenue)}
          sub="78% de l'objectif annuel"
          trend="up"
          accent="#EEF4F1"
          icon={
            <TrendingUp
              size={20}
              style={{ color: SIDEBAR_GREEN }}
            />
          }
        />
        <MetricCard
          label="Paiements en retard"
          value={fmtShort(outstanding)}
          sub={`${overdueStudents.length} élèves concernés`}
          trend="down"
          accent="#FEE2E2"
          icon={
            <AlertTriangle
              size={20}
              style={{ color: "#991B1B" }}
            />
          }
        />
        <MetricCard
          label="Encaissements — Jan"
          value={fmtShort(monthRevenue)}
          sub="Mois en cours"
          trend="neutral"
          accent={AMBER_FAINT}
          icon={
            <CreditCard size={20} style={{ color: AMBER }} />
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Revenue by category */}
        <div
          className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="mb-4">
            <div
              className="font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              Revenus par catégorie
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "#9B9589" }}
            >
              Cumul 2025–2026
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCategory} barSize={28}>
              <CartesianGrid
                vertical={false}
                stroke="#F0EDE6"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9B9589" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  (v / 1000000).toFixed(1) + "M"
                }
                tick={{ fontSize: 11, fill: "#9B9589" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={customTooltip as any} />
              <Bar
                dataKey="montant"
                name="Montant"
                fill={SIDEBAR_GREEN}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly flow */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="mb-4">
            <div
              className="font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              Flux mensuel
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "#9B9589" }}
            >
              Revenus vs Dépenses
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyFlow}>
              <defs>
                <linearGradient
                  id="revGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={SIDEBAR_GREEN}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={SIDEBAR_GREEN}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="depGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={AMBER}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={AMBER}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#F0EDE6"
              />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 11, fill: "#9B9589" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  (v / 1000000).toFixed(1) + "M"
                }
                tick={{ fontSize: 11, fill: "#9B9589" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={customTooltip as any} />
              <Area
                type="monotone"
                dataKey="revenus"
                name="Revenus"
                stroke={SIDEBAR_GREEN}
                fill="url(#revGrad)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="dépenses"
                name="Dépenses"
                stroke={AMBER}
                fill="url(#depGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent transactions */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              Transactions récentes
            </div>
            <Btn
              variant="ghost"
              small
              onClick={() => setScreen("finance")}
            >
              Voir tout <ChevronRight size={12} />
            </Btn>
          </div>
          <div className="space-y-0">
            {TRANSACTIONS.slice(0, 6).map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-2.5"
                style={{
                  borderTop:
                    i > 0 ? "1px solid #F5F0E8" : undefined,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      tx.direction === "in"
                        ? "#DCFCE7"
                        : "#FEE2E2",
                  }}
                >
                  {tx.direction === "in" ? (
                    <TrendingUp
                      size={14}
                      style={{ color: "#166534" }}
                    />
                  ) : (
                    <TrendingDown
                      size={14}
                      style={{ color: "#991B1B" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: "#1A1A1A" }}
                  >
                    {tx.description}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "#9B9589" }}
                  >
                    {tx.studentName && (
                      <span>{tx.studentName} · </span>
                    )}
                    <span>{tx.date}</span>
                  </div>
                </div>
                <div
                  className="font-mono text-sm font-semibold flex-shrink-0"
                  style={{
                    color:
                      tx.direction === "in"
                        ? "#166534"
                        : "#991B1B",
                  }}
                >
                  {tx.direction === "in" ? "+" : "−"}
                  {new Intl.NumberFormat("fr-FR").format(
                    tx.amount,
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue alerts */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              Alertes retard
            </div>
            <span
              className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
              style={{ background: "#C0392B" }}
            >
              {overdueStudents.length}
            </span>
          </div>
          <div className="space-y-2">
            {overdueStudents.map((s) => {
              const overdue = s.payments.filter(
                (p) => p.status === "overdue",
              );
              const amt = overdue.reduce(
                (a, p) => a + (p.dueAmount - p.paidAmount),
                0,
              );
              return (
                <div
                  key={s.id}
                  className="p-3 rounded-xl cursor-pointer"
                  style={{ background: "#FEF5E4" }}
                  onClick={() => {
                    setSelectedStudent(s.id);
                    setScreen("ledger");
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#1A1A1A" }}
                    >
                      {s.firstName} {s.lastName}
                    </span>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: "#C0392B" }}
                    >
                      −
                      {new Intl.NumberFormat("fr-FR").format(
                        amt,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "#9B9589" }}
                    >
                      {s.level}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: AMBER }}
                    >
                      {overdue.length} échéance
                      {overdue.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div
            className="mt-4 pt-4 border-t space-y-2"
            style={{ borderColor: "#F5F0E8" }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#9B9589" }}
            >
              Actions rapides
            </div>
            {[
              {
                icon: <UserPlus size={13} />,
                label: "Nouvelle inscription",
                action: () => setScreen("students"),
              },
              {
                icon: <Receipt size={13} />,
                label: "Enregistrer paiement",
                action: () => setScreen("finance"),
              },
              {
                icon: <FileText size={13} />,
                label: "Générer rapport",
                action: () => setScreen("accountant"),
              },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.action}
                className="w-full flex items-center gap-2 text-sm rounded-lg px-3 py-2 text-left transition-fast"
                style={{
                  color: "#1A1A1A",
                  background: "#F7F4EE",
                }}
              >
                <span style={{ color: SIDEBAR_GREEN }}>
                  {a.icon}
                </span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Students View ────────────────────────────────────────────────

function StudentsView({
  setScreen,
  setSelectedStudent,
}: {
  setScreen: (s: Screen) => void;
  setSelectedStudent: (id: string) => void;
}) {

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");

  if (loading) {
    return (
      <div className="p-6 text-sm" style={{ color: "#9B9589" }}>
        Chargement des élèves…
      </div>
    );
  }

  const groups = [
    { id: "all", label: "Tous" },
    { id: "maternelle", label: "Maternelle" },
    { id: "cp", label: "CP" },
    { id: "ce", label: "CE" },
    { id: "cm", label: "CM" },
  ];

  const filtered = STUDENTS.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGroup =
      filterGroup === "all" || s.levelGroup === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const groupedByLevel: Record<string, Student[]> = {};
  filtered.forEach((s) => {
    if (!groupedByLevel[s.level]) groupedByLevel[s.level] = [];
    groupedByLevel[s.level].push(s);
  });

  const levelOrder = [
    "Petite Section",
    "Moyenne Section",
    "Grande Section",
    "CP1",
    "CP2",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
  ];
  const sortedLevels = Object.keys(groupedByLevel).sort(
    (a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b),
  );

  return (
    <div className="p-6 space-y-5">
      <SectionHeader
        title="Élèves"
        subtitle={`${STUDENTS.length} élèves inscrits — Année 2025–2026`}
      >
        <Btn variant="secondary" icon={<Download size={14} />}>
          Exporter
        </Btn>
        <Btn variant="primary" icon={<UserPlus size={14} />}>
          Nouvelle inscription
        </Btn>
      </SectionHeader>

      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#9B9589" }}
          />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border bg-white outline-none"
            style={{ borderColor: "#E8E2D6", color: "#1A1A1A" }}
            placeholder="Rechercher un élève…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: "#EAE5D9" }}
        >
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGroup(g.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-fast"
              style={{
                background:
                  filterGroup === g.id ? "#fff" : "transparent",
                color:
                  filterGroup === g.id ? "#1A1A1A" : "#6B6557",
                boxShadow:
                  filterGroup === g.id
                    ? "0 1px 3px rgba(0,0,0,0.08)"
                    : "none",
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Tous niveaux",
            value: STUDENTS.length,
            color: SIDEBAR_GREEN,
          },
          {
            label: "Maternelle",
            value: STUDENTS.filter(
              (s) => s.levelGroup === "maternelle",
            ).length,
            color: "#2563EB",
          },
          {
            label: "Primaire CP/CE",
            value: STUDENTS.filter((s) =>
              ["cp", "ce"].includes(s.levelGroup),
            ).length,
            color: "#7C3AED",
          },
          {
            label: "CM1 / CM2",
            value: STUDENTS.filter((s) => s.levelGroup === "cm")
              .length,
            color: AMBER,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div
              className="font-mono text-2xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "#9B9589" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Table grouped by level */}
      <div
        className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        style={{ borderColor: "#E8E2D6" }}
      >
        {sortedLevels.map((level, li) => (
          <div key={level}>
            {/* Level header */}
            <div
              className="px-5 py-2.5 flex items-center gap-3"
              style={{
                background: "#F7F4EE",
                borderTop:
                  li > 0 ? "1px solid #EAE5D9" : undefined,
              }}
            >
              <GraduationCap
                size={14}
                style={{ color: SIDEBAR_GREEN }}
              />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: SIDEBAR_GREEN }}
              >
                {level}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{
                  background: "#EEF4F1",
                  color: SIDEBAR_GREEN,
                }}
              >
                {groupedByLevel[level].length}
              </span>
            </div>
            {/* Students */}
            {groupedByLevel[level].map((s) => {
              const totalDue = s.payments.reduce(
                (a, p) => a + p.dueAmount,
                0,
              );
              const totalPaid = s.payments.reduce(
                (a, p) => a + p.paidAmount,
                0,
              );
              const balance = totalDue - totalPaid;
              const hasOverdue = s.payments.some(
                (p) => p.status === "overdue",
              );
              const overallStatus: PaymentItem["status"] =
                totalPaid >= totalDue
                  ? "paid"
                  : hasOverdue
                    ? "overdue"
                    : totalPaid > 0
                      ? "partial"
                      : "pending";

              return (
                <div
                  key={s.id}
                  className="px-5 py-3 flex items-center gap-4 cursor-pointer transition-fast"
                  style={{
                    borderTop: "1px solid #F5F0E8",
                    background: "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "#FAFAF7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                  onClick={() => {
                    setSelectedStudent(s.id);
                    setScreen("ledger");
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: "#EEF4F1",
                      color: SIDEBAR_GREEN,
                    }}
                  >
                    {s.firstName[0]}
                    {s.lastName[0]}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "#1A1A1A" }}
                    >
                      {s.firstName} {s.lastName}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "#9B9589" }}
                    >
                      Né·e le {s.birthDate} ·{" "}
                      {s.enrollmentType === "new"
                        ? "Nouvel·le élève"
                        : "Réinscription"}
                    </div>
                  </div>
                  {/* Parent */}
                  <div
                    className="hidden lg:block text-sm min-w-0"
                    style={{ color: "#6B6557", width: 160 }}
                  >
                    <div className="truncate">
                      {s.parentName}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "#9B9589" }}
                    >
                      {s.parentPhone}
                    </div>
                  </div>
                  {/* Canteen */}
                  <div className="hidden lg:flex items-center gap-1.5 w-24">
                    {s.canteenSubscribed ? (
                      <CheckCircle2
                        size={13}
                        style={{ color: "#166534" }}
                      />
                    ) : (
                      <Clock
                        size={13}
                        style={{ color: "#9B9589" }}
                      />
                    )}
                    <span
                      className="text-xs"
                      style={{
                        color: s.canteenSubscribed
                          ? "#166534"
                          : "#9B9589",
                      }}
                    >
                      {s.canteenSubscribed ? "Cantine" : "Sans"}
                    </span>
                  </div>
                  {/* Amount */}
                  <div className="text-right w-36 flex-shrink-0">
                    <div
                      className="font-mono text-sm font-medium"
                      style={{ color: "#1A1A1A" }}
                    >
                      {new Intl.NumberFormat("fr-FR").format(
                        totalPaid,
                      )}{" "}
                      <span
                        style={{
                          color: "#9B9589",
                          fontSize: 10,
                        }}
                      >
                        /{" "}
                        {new Intl.NumberFormat("fr-FR").format(
                          totalDue,
                        )}
                      </span>
                    </div>
                    {balance > 0 && (
                      <div
                        className="font-mono text-xs"
                        style={{ color: "#991B1B" }}
                      >
                        Solde:{" "}
                        {new Intl.NumberFormat("fr-FR").format(
                          balance,
                        )}
                      </div>
                    )}
                  </div>
                  {/* Status */}
                  <div className="w-24 text-right flex-shrink-0">
                    <StatusBadge status={overallStatus} />
                  </div>
                  <ChevronRight
                    size={14}
                    style={{ color: "#C4BDB5" }}
                  />
                </div>
              );
            })}
          </div>
        ))}
        {filtered.length === 0 && (
          <div
            className="py-16 text-center"
            style={{ color: "#9B9589" }}
          >
            <Users
              size={32}
              className="mx-auto mb-3 opacity-30"
            />
            <p className="text-sm">Aucun élève trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Student Ledger View ──────────────────────────────────────────

function StudentLedgerView({
  studentId,
  setScreen,
}: {
  studentId: string;
  setScreen: (s: Screen) => void;
}) {


  if (loading) {
    return (
      <div className="p-6 text-sm" style={{ color: "#9B9589" }}>
        Chargement…
      </div>
    );
  }

  const student = STUDENTS.find((s) => s.id === studentId);
  if (!student) return null;

  const totalDue = student.payments.reduce(
    (a, p) => a + p.dueAmount,
    0,
  );
  const totalPaid = student.payments.reduce(
    (a, p) => a + p.paidAmount,
    0,
  );
  const balance = totalDue - totalPaid;
  const pctPaid = Math.round((totalPaid / totalDue) * 100);

  return (
    <div className="p-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => setScreen("students")}
        className="flex items-center gap-2 text-sm font-medium transition-fast"
        style={{ color: "#6B6557" }}
      >
        <ArrowLeft size={14} /> Retour à la liste
      </button>

      {/* Student card */}
      <div
        className="bg-white rounded-2xl p-6 shadow-sm border"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div className="flex items-start gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{
              background: "#EEF4F1",
              color: SIDEBAR_GREEN,
            }}
          >
            {student.firstName[0]}
            {student.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2
                className="text-xl font-bold"
                style={{ color: "#1A1A1A" }}
              >
                {student.firstName} {student.lastName}
              </h2>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  background: "#EEF4F1",
                  color: SIDEBAR_GREEN,
                }}
              >
                {student.level}
              </span>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  background:
                    student.enrollmentType === "new"
                      ? AMBER_FAINT
                      : "#F5F5F4",
                  color:
                    student.enrollmentType === "new"
                      ? AMBER
                      : "#6B6557",
                }}
              >
                {student.enrollmentType === "new"
                  ? "Nouvel·le élève"
                  : "Réinscription"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              {[
                {
                  icon: <CalendarDays size={13} />,
                  label: "Date de naissance",
                  value: student.birthDate,
                },
                {
                  icon: <User size={13} />,
                  label: "Parent / Tuteur",
                  value: student.parentName,
                },
                {
                  icon: <Phone size={13} />,
                  label: "Téléphone",
                  value: student.parentPhone,
                },
                {
                  icon: <UtensilsCrossed size={13} />,
                  label: "Cantine",
                  value: student.canteenSubscribed
                    ? "Abonnée"
                    : "Non inscrit·e",
                },
              ].map((field) => (
                <div key={field.label}>
                  <div
                    className="flex items-center gap-1 text-xs mb-0.5"
                    style={{ color: "#9B9589" }}
                  >
                    {field.icon} {field.label}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#1A1A1A" }}
                  >
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Scolarité annuelle
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: "#1A1A1A" }}
          >
            {fmt(totalDue)}
          </div>
        </div>
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Total versé
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: "#166534" }}
          >
            {fmt(totalPaid)}
          </div>
          <div
            className="mt-2 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#F0EDE6" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pctPaid}%`,
                background: pctPaid === 100 ? "#22C55E" : AMBER,
              }}
            />
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "#9B9589" }}
          >
            {pctPaid}% réglé
          </div>
        </div>
        <div
          className="bg-white rounded-xl p-4 border"
          style={{
            borderColor: balance > 0 ? "#FEE2E2" : "#E8E2D6",
          }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Solde restant
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{
              color: balance > 0 ? "#991B1B" : "#166534",
            }}
          >
            {balance > 0 ? fmt(balance) : "Soldé ✓"}
          </div>
        </div>
      </div>

      {/* Payment schedule table */}
      <div
        className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "#EAE5D9" }}
        >
          <div>
            <div
              className="font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              Échéancier de paiement
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "#9B9589" }}
            >
              Année scolaire 2025–2026
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn
              variant="secondary"
              small
              icon={<Printer size={12} />}
            >
              Imprimer
            </Btn>
            <Btn
              variant="amber"
              small
              icon={<Plus size={12} />}
            >
              Enregistrer versement
            </Btn>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F7F4EE" }}>
              {[
                "Échéance",
                "Date limite",
                "Montant dû",
                "Versé",
                "Solde",
                "Date versement",
                "Statut",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#9B9589" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {student.payments.map((p) => (
              <tr
                key={p.id}
                style={{ borderTop: "1px solid #F5F0E8" }}
              >
                <td className="px-5 py-3.5">
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#1A1A1A" }}
                  >
                    {p.label}
                  </div>
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm"
                  style={{ color: "#6B6557" }}
                >
                  {p.dueDate}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm font-semibold"
                  style={{ color: "#1A1A1A" }}
                >
                  {new Intl.NumberFormat("fr-FR").format(
                    p.dueAmount,
                  )}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm"
                  style={{
                    color:
                      p.paidAmount > 0 ? "#166534" : "#9B9589",
                  }}
                >
                  {p.paidAmount > 0
                    ? new Intl.NumberFormat("fr-FR").format(
                        p.paidAmount,
                      )
                    : "—"}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm"
                  style={{
                    color:
                      p.dueAmount - p.paidAmount > 0
                        ? "#991B1B"
                        : "#166534",
                  }}
                >
                  {p.dueAmount - p.paidAmount > 0
                    ? new Intl.NumberFormat("fr-FR").format(
                        p.dueAmount - p.paidAmount,
                      )
                    : "0"}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm"
                  style={{ color: "#6B6557" }}
                >
                  {p.paidDate ?? "—"}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr
              style={{
                background: "#F7F4EE",
                borderTop: "2px solid #EAE5D9",
              }}
            >
              <td
                className="px-5 py-3 text-sm font-bold"
                style={{ color: "#1A1A1A" }}
                colSpan={2}
              >
                Total
              </td>
              <td
                className="px-5 py-3 font-mono text-sm font-bold"
                style={{ color: "#1A1A1A" }}
              >
                {new Intl.NumberFormat("fr-FR").format(
                  totalDue,
                )}
              </td>
              <td
                className="px-5 py-3 font-mono text-sm font-bold"
                style={{ color: "#166534" }}
              >
                {new Intl.NumberFormat("fr-FR").format(
                  totalPaid,
                )}
              </td>
              <td
                className="px-5 py-3 font-mono text-sm font-bold"
                style={{
                  color: balance > 0 ? "#991B1B" : "#166534",
                }}
              >
                {new Intl.NumberFormat("fr-FR").format(balance)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Canteen status */}
      {student.canteenSubscribed && (
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="font-semibold mb-3"
            style={{ color: "#1A1A1A" }}
          >
            Cantine scolaire
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: student.canteenPaid
                    ? "#22C55E"
                    : "#EF4444",
                }}
              />
              <span
                className="text-sm"
                style={{ color: "#1A1A1A" }}
              >
                Janvier 2026 —{" "}
                <strong>
                  {student.canteenPaid ? "Réglé" : "Non réglé"}
                </strong>
              </span>
            </div>
            <span
              className="font-mono text-sm"
              style={{ color: "#6B6557" }}
            >
              15 000 FCFA / mois
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Finance View ─────────────────────────────────────────────────

function FinanceView({
  setScreen,
}: {
  setScreen: (s: Screen) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "schedule" | "transactions" | "summary"
  >("schedule");
  const [catFilter, setCatFilter] = useState("Tous");
  const categories = [
    "Tous",
    "Scolarité",
    "Cantine",
    "Inscription",
    "Uniformes",
    "Examens",
    "Activités",
    "Charges",
  ];
  const filteredTx =
    catFilter === "Tous"
      ? TRANSACTIONS
      : TRANSACTIONS.filter((t) => t.category === catFilter);

  const totalIn = TRANSACTIONS.filter(
    (t) => t.direction === "in",
  ).reduce((a, t) => a + t.amount, 0);
  const totalOut = TRANSACTIONS.filter(
    (t) => t.direction === "out",
  ).reduce((a, t) => a + t.amount, 0);

  return (
    <div className="p-6 space-y-5">
      <SectionHeader
        title="Finance & Comptabilité"
        subtitle="Gestion des paiements et des flux financiers"
      >
        <Btn
          variant="ghost"
          icon={<Shield size={14} />}
          onClick={() => setScreen("accountant")}
        >
          Vue comptable
        </Btn>
        <Btn variant="secondary" icon={<Download size={14} />}>
          Exporter
        </Btn>
        <Btn variant="primary" icon={<Plus size={14} />}>
          Enregistrer paiement
        </Btn>
      </SectionHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Total encaissé (Jan)
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: "#166534" }}
          >
            +{fmt(totalIn)}
          </div>
        </div>
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Total décaissé (Jan)
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: "#991B1B" }}
          >
            −{fmt(totalOut)}
          </div>
        </div>
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Solde net (Jan)
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: SIDEBAR_GREEN }}
          >
            {fmt(totalIn - totalOut)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "#EAE5D9" }}
      >
        {(
          [
            ["schedule", "Barème des frais"],
            ["transactions", "Journal des transactions"],
            ["summary", "Bilan"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-fast"
            style={{
              background:
                activeTab === id ? "#fff" : "transparent",
              color: activeTab === id ? "#1A1A1A" : "#6B6557",
              boxShadow:
                activeTab === id
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Fee schedule */}
      {activeTab === "schedule" && (
        <div
          className="bg-white rounded-2xl shadow-sm border overflow-hidden"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "#EAE5D9" }}
          >
            <div
              className="font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              Barème des frais de scolarité 2025–2026
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "#9B9589" }}
            >
              Paiements échelonnés · Échéances : 5 de chaque
              mois
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F7F4EE" }}>
                {[
                  "Niveau",
                  "Frais annuels",
                  "Dépôt (juin)",
                  "Octobre",
                  "Novembre",
                  "Décembre",
                  "Janvier",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#9B9589" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEE_SCHEDULE.map((row, i) => (
                <tr
                  key={row.level}
                  style={{
                    borderTop: "1px solid #F5F0E8",
                    background:
                      i % 2 === 0 ? "white" : "#FAFAF7",
                  }}
                >
                  <td
                    className="px-5 py-3.5 text-sm font-semibold"
                    style={{ color: "#1A1A1A" }}
                  >
                    {row.level}
                  </td>
                  {[
                    row.annual,
                    row.deposit,
                    row.oct,
                    row.nov,
                    row.dec,
                    row.jan,
                  ].map((v, j) => (
                    <td
                      key={j}
                      className="px-5 py-3.5 font-mono text-sm"
                      style={{
                        color:
                          j === 0 ? SIDEBAR_GREEN : "#6B6557",
                        fontWeight: j === 0 ? 700 : 400,
                      }}
                    >
                      {new Intl.NumberFormat("fr-FR").format(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="px-5 py-3 border-t"
            style={{
              borderColor: "#EAE5D9",
              background: "#F7F4EE",
            }}
          >
            <span
              className="text-xs"
              style={{ color: "#9B9589" }}
            >
              Cantine scolaire :{" "}
              <strong>15 000 FCFA / mois</strong> · Uniformes :{" "}
              <strong>35 000 FCFA</strong> · Manuels scolaires :{" "}
              <strong>25 000–40 000 FCFA</strong>
            </span>
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === "transactions" && (
        <div className="space-y-3">
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-fast"
                style={{
                  background:
                    catFilter === cat ? SIDEBAR_GREEN : "#fff",
                  color: catFilter === cat ? "#fff" : "#6B6557",
                  borderColor:
                    catFilter === cat
                      ? SIDEBAR_GREEN
                      : "#E8E2D6",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div
            className="bg-white rounded-2xl shadow-sm border overflow-hidden"
            style={{ borderColor: "#E8E2D6" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F7F4EE" }}>
                  {[
                    "Date",
                    "Description",
                    "Élève / Niveau",
                    "Catégorie",
                    "Montant",
                    "Type",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#9B9589" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{ borderTop: "1px solid #F5F0E8" }}
                  >
                    <td
                      className="px-5 py-3 font-mono text-xs"
                      style={{ color: "#9B9589" }}
                    >
                      {tx.date}
                    </td>
                    <td
                      className="px-5 py-3 text-sm"
                      style={{ color: "#1A1A1A" }}
                    >
                      {tx.description}
                    </td>
                    <td
                      className="px-5 py-3 text-sm"
                      style={{ color: "#6B6557" }}
                    >
                      {tx.studentName ? (
                        <span>
                          {tx.studentName}{" "}
                          <span style={{ color: "#9B9589" }}>
                            ({tx.studentLevel})
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "#F5F0E8",
                          color: "#6B6557",
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3 font-mono text-sm font-semibold"
                      style={{
                        color:
                          tx.direction === "in"
                            ? "#166534"
                            : "#991B1B",
                      }}
                    >
                      {tx.direction === "in" ? "+" : "−"}
                      {new Intl.NumberFormat("fr-FR").format(
                        tx.amount,
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            tx.direction === "in"
                              ? "#DCFCE7"
                              : "#FEE2E2",
                          color:
                            tx.direction === "in"
                              ? "#166534"
                              : "#991B1B",
                        }}
                      >
                        {tx.direction === "in"
                          ? "Recette"
                          : "Dépense"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {activeTab === "summary" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div
            className="bg-white rounded-2xl p-5 shadow-sm border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div
              className="font-semibold mb-4"
              style={{ color: "#1A1A1A" }}
            >
              Revenus par catégorie
            </div>
            <div className="space-y-3">
              {revenueByCategory.map((cat) => {
                const total = revenueByCategory.reduce(
                  (a, c) => a + c.montant,
                  0,
                );
                const pct = Math.round(
                  (cat.montant / total) * 100,
                );
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: "#1A1A1A" }}>
                        {cat.name}
                      </span>
                      <span
                        className="font-mono font-medium"
                        style={{ color: SIDEBAR_GREEN }}
                      >
                        {fmtShort(cat.montant)}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ background: "#F0EDE6" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: SIDEBAR_GREEN,
                        }}
                      />
                    </div>
                    <div
                      className="text-xs text-right mt-0.5"
                      style={{ color: "#9B9589" }}
                    >
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="bg-white rounded-2xl p-5 shadow-sm border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div
              className="font-semibold mb-4"
              style={{ color: "#1A1A1A" }}
            >
              Résumé annuel projeté
            </div>
            {[
              {
                label: "Revenus totaux collectés",
                value: 18850000,
                color: "#166534",
              },
              {
                label: "Dépenses totales",
                value: 11710000,
                color: "#991B1B",
              },
              {
                label: "Résultat net",
                value: 7140000,
                color: SIDEBAR_GREEN,
              },
              {
                label: "Créances en attente",
                value: outstanding,
                color: AMBER,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: "#F5F0E8" }}
              >
                <span
                  className="text-sm"
                  style={{ color: "#6B6557" }}
                >
                  {row.label}
                </span>
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: row.color }}
                >
                  {fmt(row.value)}
                </span>
              </div>
            ))}
            <div className="mt-4">
              <Btn
                variant="primary"
                icon={<Download size={14} />}
              >
                Télécharger le rapport
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const outstanding = STUDENTS.reduce((acc, s) => {
  return (
    acc +
    s.payments.reduce(
      (a, p) => a + (p.dueAmount - p.paidAmount),
      0,
    )
  );
}, 0);

// ── Accountant View ──────────────────────────────────────────────

function AccountantView() {
  return (
    <div className="p-6 space-y-5">
      {/* Read-only banner */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl border"
        style={{
          background: "#FEF5E4",
          borderColor: "#FDE68A",
        }}
      >
        <Lock size={16} style={{ color: AMBER }} />
        <div>
          <div
            className="text-sm font-semibold"
            style={{ color: "#92400E" }}
          >
            Mode lecture seule — Vue Comptable
          </div>
          <div className="text-xs" style={{ color: "#B45309" }}>
            Accès restreint. Vous pouvez consulter et exporter
            les données financières uniquement.
          </div>
        </div>
        <div className="ml-auto">
          <Btn variant="amber" icon={<Download size={14} />}>
            Exporter PDF
          </Btn>
        </div>
      </div>

      <SectionHeader
        title="Vue Comptable"
        subtitle="Données financières consolidées — Année 2025–2026"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Revenus totaux",
            value: "18 850 000",
            suffix: "FCFA",
            color: "#166534",
            bg: "#DCFCE7",
          },
          {
            label: "Dépenses totales",
            value: "11 710 000",
            suffix: "FCFA",
            color: "#991B1B",
            bg: "#FEE2E2",
          },
          {
            label: "Résultat net",
            value: "7 140 000",
            suffix: "FCFA",
            color: SIDEBAR_GREEN,
            bg: "#EEF4F1",
          },
          {
            label: "Créances ouvertes",
            value: fmtShort(outstanding),
            suffix: "",
            color: AMBER,
            bg: AMBER_FAINT,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl p-4 border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div
              className="text-xs mb-2"
              style={{ color: "#9B9589" }}
            >
              {kpi.label}
            </div>
            <div
              className="font-mono text-lg font-bold"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </div>
            {kpi.suffix && (
              <div
                className="text-xs"
                style={{ color: "#9B9589" }}
              >
                {kpi.suffix}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue breakdown table */}
      <div
        className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#EAE5D9" }}
        >
          <div
            className="font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            Détail des recettes par rubrique
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F7F4EE" }}>
              {[
                "Rubrique",
                "Montant collecté",
                "% du total",
                "Statut",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#9B9589" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenueByCategory.map((cat, i) => {
              const total = revenueByCategory.reduce(
                (a, c) => a + c.montant,
                0,
              );
              const pct = Math.round(
                (cat.montant / total) * 100,
              );
              return (
                <tr
                  key={cat.name}
                  style={{
                    borderTop: "1px solid #F5F0E8",
                    background:
                      i % 2 === 0 ? "white" : "#FAFAF7",
                  }}
                >
                  <td
                    className="px-5 py-3.5 text-sm font-semibold"
                    style={{ color: "#1A1A1A" }}
                  >
                    {cat.name}
                  </td>
                  <td
                    className="px-5 py-3.5 font-mono text-sm font-semibold"
                    style={{ color: SIDEBAR_GREEN }}
                  >
                    {fmt(cat.montant)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full"
                        style={{
                          background: "#F0EDE6",
                          maxWidth: 80,
                        }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: SIDEBAR_GREEN,
                          }}
                        />
                      </div>
                      <span
                        className="font-mono text-xs"
                        style={{ color: "#6B6557" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "#DCFCE7",
                        color: "#166534",
                      }}
                    >
                      Validé
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              style={{
                background: "#F7F4EE",
                borderTop: "2px solid #EAE5D9",
              }}
            >
              <td
                className="px-5 py-3 text-sm font-bold"
                style={{ color: "#1A1A1A" }}
              >
                Total recettes
              </td>
              <td
                className="px-5 py-3 font-mono text-sm font-bold"
                style={{ color: SIDEBAR_GREEN }}
              >
                {fmt(
                  revenueByCategory.reduce(
                    (a, c) => a + c.montant,
                    0,
                  ),
                )}
              </td>
              <td
                className="px-5 py-3 font-mono text-xs font-bold"
                style={{ color: SIDEBAR_GREEN }}
              >
                100%
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Expenses summary */}
      <div
        className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#EAE5D9" }}
        >
          <div
            className="font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            Détail des charges
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F7F4EE" }}>
              {[
                "Rubrique",
                "Mensuel",
                "Annuel estimé",
                "Nature",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#9B9589" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Masse salariale",
                monthly: 1820000,
                nature: "Fixe",
              },
              {
                label: "Eau & Électricité",
                monthly: 85000,
                nature: "Variable",
              },
              {
                label: "Fournitures & Entretien",
                monthly: 45000,
                nature: "Variable",
              },
              {
                label: "Assurance scolaire",
                monthly: 20000,
                nature: "Fixe",
              },
              {
                label: "Frais divers",
                monthly: 25000,
                nature: "Variable",
              },
            ].map((row, i) => (
              <tr
                key={row.label}
                style={{
                  borderTop: "1px solid #F5F0E8",
                  background: i % 2 === 0 ? "white" : "#FAFAF7",
                }}
              >
                <td
                  className="px-5 py-3.5 text-sm font-semibold"
                  style={{ color: "#1A1A1A" }}
                >
                  {row.label}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm"
                  style={{ color: "#991B1B" }}
                >
                  {fmt(row.monthly)}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm font-semibold"
                  style={{ color: "#991B1B" }}
                >
                  {fmt(row.monthly * 10)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        row.nature === "Fixe"
                          ? "#EEF4F1"
                          : "#FEF3C7",
                      color:
                        row.nature === "Fixe"
                          ? SIDEBAR_GREEN
                          : "#92400E",
                    }}
                  >
                    {row.nature}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Cafeteria View ───────────────────────────────────────────────

function CafeteriaView() {
  const subscribed = STUDENTS.filter(
    (s) => s.canteenSubscribed,
  );
  const paidThisMonth = subscribed.filter((s) => s.canteenPaid);
  const monthlyRevenue = subscribed.length * 15000;
  const collectedRevenue = paidThisMonth.length * 15000;

  return (
    <div className="p-6 space-y-5">
      <SectionHeader
        title="Cantine Scolaire"
        subtitle="Suivi des abonnements et paiements mensuels — Janvier 2026"
      >
        <Btn variant="secondary" icon={<Download size={14} />}>
          Exporter
        </Btn>
        <Btn variant="primary" icon={<Plus size={14} />}>
          Enregistrer paiement
        </Btn>
      </SectionHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Élèves abonnés",
            value: subscribed.length,
            color: SIDEBAR_GREEN,
          },
          {
            label: "Payés ce mois",
            value: paidThisMonth.length,
            color: "#166534",
          },
          {
            label: "En attente",
            value: subscribed.length - paidThisMonth.length,
            color: "#991B1B",
          },
          {
            label: "Revenus Jan",
            value:
              fmtShort(collectedRevenue) +
              " / " +
              fmtShort(monthlyRevenue),
            color: AMBER,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div
              className="text-xs mb-2"
              style={{ color: "#9B9589" }}
            >
              {s.label}
            </div>
            <div
              className="font-mono text-xl font-bold"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="bg-white rounded-2xl p-5 shadow-sm border"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            Collecte Janvier 2026
          </span>
          <span
            className="font-mono text-sm font-bold"
            style={{ color: SIDEBAR_GREEN }}
          >
            {fmt(collectedRevenue)} / {fmt(monthlyRevenue)}
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "#F0EDE6" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.round((collectedRevenue / monthlyRevenue) * 100)}%`,
              background: SIDEBAR_GREEN,
            }}
          />
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "#9B9589" }}
        >
          {Math.round(
            (collectedRevenue / monthlyRevenue) * 100,
          )}
          % collecté — Tarif mensuel : 15 000 FCFA / élève
        </div>
      </div>

      {/* Student canteen table */}
      <div
        className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#EAE5D9" }}
        >
          <div
            className="font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            Suivi par élève — Abonnés cantine
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F7F4EE" }}>
              {[
                "Élève",
                "Niveau",
                "Abonnement",
                "Janvier",
                "Tarif mensuel",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#9B9589" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s, i) => (
              <tr
                key={s.id}
                style={{
                  borderTop: "1px solid #F5F0E8",
                  background: i % 2 === 0 ? "white" : "#FAFAF7",
                }}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "#EEF4F1",
                        color: SIDEBAR_GREEN,
                      }}
                    >
                      {s.firstName[0]}
                      {s.lastName[0]}
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#1A1A1A" }}
                    >
                      {s.firstName} {s.lastName}
                    </span>
                  </div>
                </td>
                <td
                  className="px-5 py-3.5 text-sm"
                  style={{ color: "#6B6557" }}
                >
                  {s.level}
                </td>
                <td className="px-5 py-3.5">
                  {s.canteenSubscribed ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "#DCFCE7",
                        color: "#166534",
                      }}
                    >
                      Abonné·e
                    </span>
                  ) : (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "#F5F5F4",
                        color: "#78716C",
                      }}
                    >
                      Non abonné·e
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {s.canteenSubscribed ? (
                    s.canteenPaid ? (
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "#166534" }}
                      >
                        <CheckCircle2 size={13} /> Réglé
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "#991B1B" }}
                      >
                        <CircleX size={13} /> Non réglé
                      </span>
                    )
                  ) : (
                    <span
                      className="text-xs"
                      style={{ color: "#9B9589" }}
                    >
                      —
                    </span>
                  )}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm"
                  style={{
                    color: s.canteenSubscribed
                      ? "#1A1A1A"
                      : "#9B9589",
                  }}
                >
                  {s.canteenSubscribed ? "15 000" : "—"}
                </td>
                <td className="px-5 py-3.5">
                  {s.canteenSubscribed && !s.canteenPaid && (
                    <Btn variant="amber" small>
                      Encaisser
                    </Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Staff View ───────────────────────────────────────────────────

function StaffView() {
  const totalSalaries = STAFF.reduce((a, s) => a + s.salary, 0);
  const paidCount = STAFF.filter((s) => s.paidThisMonth).length;

  return (
    <div className="p-6 space-y-5">
      <SectionHeader
        title="Personnel & Paie"
        subtitle="Gestion des ressources humaines — Janvier 2026"
      >
        <Btn variant="secondary" icon={<RefreshCw size={14} />}>
          Actualiser
        </Btn>
        <Btn variant="primary" icon={<Plus size={14} />}>
          Ajouter membre
        </Btn>
      </SectionHeader>

      {/* Payroll summary */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Masse salariale mensuelle
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: "#1A1A1A" }}
          >
            {fmt(totalSalaries)}
          </div>
        </div>
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            Salaires versés (Jan)
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: "#166534" }}
          >
            {paidCount} / {STAFF.length}
          </div>
          <div
            className="mt-2 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#F0EDE6" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((paidCount / STAFF.length) * 100)}%`,
                background: "#22C55E",
              }}
            />
          </div>
        </div>
        <div
          className="bg-white rounded-xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="text-xs mb-2"
            style={{ color: "#9B9589" }}
          >
            En attente de paiement
          </div>
          <div
            className="font-mono text-xl font-bold"
            style={{ color: AMBER }}
          >
            {fmt(
              STAFF.filter((s) => !s.paidThisMonth).reduce(
                (a, s) => a + s.salary,
                0,
              ),
            )}
          </div>
        </div>
      </div>

      {/* Staff table */}
      <div
        className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#EAE5D9" }}
        >
          <div
            className="font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            Liste du personnel
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F7F4EE" }}>
              {[
                "Nom",
                "Poste",
                "Niveau / Classe",
                "Date d'entrée",
                "Salaire mensuel",
                "Janvier",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#9B9589" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAFF.map((member, i) => (
              <tr
                key={member.id}
                style={{
                  borderTop: "1px solid #F5F0E8",
                  background: i % 2 === 0 ? "white" : "#FAFAF7",
                }}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: "#EEF4F1",
                        color: SIDEBAR_GREEN,
                      }}
                    >
                      {member.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(1, 3)
                        .join("")}
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#1A1A1A" }}
                    >
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "#EEF4F1",
                      color: SIDEBAR_GREEN,
                    }}
                  >
                    {member.role}
                  </span>
                </td>
                <td
                  className="px-5 py-3.5 text-sm"
                  style={{ color: "#6B6557" }}
                >
                  {member.level ?? "—"}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-xs"
                  style={{ color: "#9B9589" }}
                >
                  {member.joinDate}
                </td>
                <td
                  className="px-5 py-3.5 font-mono text-sm font-semibold"
                  style={{ color: "#1A1A1A" }}
                >
                  {fmt(member.salary)}
                </td>
                <td className="px-5 py-3.5">
                  {member.paidThisMonth ? (
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "#166534" }}
                    >
                      <CheckCircle2 size={13} /> Versé
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "#991B1B" }}
                    >
                      <Clock size={13} /> En attente
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {!member.paidThisMonth && (
                    <Btn variant="amber" small>
                      Payer
                    </Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr
              style={{
                background: "#F7F4EE",
                borderTop: "2px solid #EAE5D9",
              }}
            >
              <td
                className="px-5 py-3 text-sm font-bold"
                style={{ color: "#1A1A1A" }}
                colSpan={4}
              >
                Total mensuel
              </td>
              <td
                className="px-5 py-3 font-mono text-sm font-bold"
                style={{ color: SIDEBAR_GREEN }}
              >
                {fmt(totalSalaries)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────

type AppMode = "admin" | "parent-login" | "parent-portal";

export default function App() {
  const [mode, setMode] = useState<AppMode>("admin");
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | null
  >(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pageTitle: Record<Screen, string> = {
    dashboard: "Tableau de bord",
    students: "Élèves",
    ledger: "Fiche élève",
    finance: "Finance",
    accountant: "Vue Comptable",
    cafeteria: "Cantine",
    staff: "Personnel",
  };

  // ── Parent portal modes ──────────────────────────────────────
  if (mode === "parent-login") {
    return (
      <ParentLoginScreen
        onLogin={() => setMode("parent-portal")}
        onBack={() => setMode("admin")}
      />
    );
  }

  if (mode === "parent-portal") {
    return (
      <ParentPortalApp onLogout={() => setMode("parent-login")} />
    );
  }

  // ── Admin mode ───────────────────────────────────────────────
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        background: CREAM,
      }}
    >
      <Sidebar
        screen={screen}
        setScreen={(s) => { setScreen(s); }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onOpenParentPortal={() => setMode("parent-login")}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 bg-white border-b flex items-center px-6 gap-4 flex-shrink-0"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "#9B9589" }}
          >
            <span style={{ color: "#9B9589" }}>SGE</span>
            <ChevronRight size={12} />
            <span style={{ color: "#1A1A1A", fontWeight: 600 }}>
              {pageTitle[screen]}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: "#EEF4F1", color: SIDEBAR_GREEN }}
            >
              Année scolaire 2025–2026
            </div>
            <div className="text-xs" style={{ color: "#9B9589" }}>
              Directrice : Mme Kouassi B.
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {screen === "dashboard" && (
            <DashboardView
              setScreen={setScreen}
              setSelectedStudent={(id) => {
                setSelectedStudentId(id);
                setScreen("ledger");
              }}
            />
          )}
          {screen === "students" && (
            <StudentsView
              setScreen={setScreen}
              setSelectedStudent={(id) => {
                setSelectedStudentId(id);
                setScreen("ledger");
              }}
            />
          )}
          {screen === "ledger" && selectedStudentId && (
            <StudentLedgerView
              studentId={selectedStudentId}
              setScreen={setScreen}
            />
          )}
          {screen === "finance" && (
            <FinanceView setScreen={setScreen} />
          )}
          {screen === "accountant" && <AccountantView />}
          {screen === "cafeteria" && <CafeteriaView />}
          {screen === "staff" && <StaffView />}
        </main>
      </div>
    </div>
  );
}