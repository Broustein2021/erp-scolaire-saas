"use client";
import { useState } from "react";
import {
  BookOpen,
  Home,
  GraduationCap,
  Wallet,
  ChevronDown,
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  UtensilsCrossed,
  Trophy,
  CircleCheck,
  CircleX,
  CircleMinus,
  Star,
  Dumbbell,
  Music,
  Monitor,
  X,
  ArrowRight,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

// ── Shared brand tokens ─────────────────────────────────────────
const GRN = "#1C3D2F";
const GRN_FAINT = "#EEF4F1";
const AMB = "#D9820C";
const AMB_FAINT = "#FEF5E4";
const CREAM = "#F3EFE6";

// ── Types ───────────────────────────────────────────────────────
type ParentScreen = "home" | "academics" | "payments" | "life";

interface SubjectGrade {
  subject: string;
  icon: string;
  t1: number;
  t2?: number;
  classAvg: number;
  rank: number;
  remark?: string;
}

interface PortalActivity {
  id: string;
  name: string;
  category: "sport" | "music" | "tech" | "arts";
  schedule: string;
  coach: string;
  monthlyFee: number;
  feePaid: boolean;
  sessionsTotal: number;
  sessionsAttended: number;
}

interface AdditionalFee {
  id: string;
  label: string;
  amount: number;
  status: "paid" | "due" | "overdue";
  paidDate?: string;
  dueDate?: string;
  type: "uniforme" | "livres" | "examen" | "activites" | "sortie";
}

interface PaymentInstallment {
  id: string;
  label: string;
  dueDate: string;
  amount: number;
  paid: number;
  paidDate?: string;
  status: "paid" | "partial" | "overdue" | "pending";
}

interface ChildPortalData {
  studentId: string;
  firstName: string;
  lastName: string;
  level: string;
  initials: string;
  colorSeed: string;
  annualFee: number;
  canteenSubscribed: boolean;
  canteenPaidMonth: boolean;
  grades: SubjectGrade[];
  termAverage: number;
  classRank: number;
  classTotal: number;
  teacherRemark: string;
  reportCards: { term: string; available: boolean; publishedDate?: string }[];
  payments: PaymentInstallment[];
  additionalFees: AdditionalFee[];
  activities: PortalActivity[];
  mealDaysThisMonth: string[];
  totalMealDaysMonth: number;
  activityFeed: { date: string; icon: string; message: string; type: "success" | "info" | "alert" }[];
}

// ── Mock data ────────────────────────────────────────────────────

const CHILD_MARIAM: ChildPortalData = {
  studentId: "s4",
  firstName: "Mariam",
  lastName: "Traoré",
  level: "CP1",
  initials: "MT",
  colorSeed: GRN,
  annualFee: 300000,
  canteenSubscribed: true,
  canteenPaidMonth: true,
  termAverage: 15.9,
  classRank: 3,
  classTotal: 28,
  teacherRemark:
    "Mariam est une élève sérieuse et très appliquée. Ses résultats en mathématiques sont remarquables. Elle participe activement et fait preuve d'une belle curiosité. Continuez ainsi !",
  grades: [
    { subject: "Lecture & Compréhension", icon: "📖", t1: 15.5, t2: 16, classAvg: 13.2, rank: 4 },
    { subject: "Expression écrite", icon: "✏️", t1: 14, t2: 14.5, classAvg: 12.8, rank: 5 },
    { subject: "Mathématiques", icon: "🔢", t1: 17, t2: 18, classAvg: 14.1, rank: 2 },
    { subject: "Découverte du monde", icon: "🌍", t1: 16, classAvg: 13.5, rank: 3 },
    { subject: "Arts & Expression", icon: "🎨", t1: 18, classAvg: 15.0, rank: 1 },
    { subject: "Éducation physique", icon: "⚽", t1: 15, classAvg: 14.5, rank: 8 },
  ],
  reportCards: [
    { term: "Trimestre 1", available: true, publishedDate: "15 janvier 2026" },
    { term: "Trimestre 2", available: false },
    { term: "Trimestre 3", available: false },
  ],
  payments: [
    { id: "p1", label: "Inscription (dépôt)", dueDate: "2025-06-01", amount: 60000, paid: 60000, paidDate: "2025-05-28", status: "paid" },
    { id: "p2", label: "Scolarité — Octobre", dueDate: "2025-10-05", amount: 60000, paid: 60000, paidDate: "2025-10-03", status: "paid" },
    { id: "p3", label: "Scolarité — Novembre", dueDate: "2025-11-05", amount: 60000, paid: 60000, paidDate: "2025-11-05", status: "paid" },
    { id: "p4", label: "Scolarité — Décembre", dueDate: "2025-12-05", amount: 60000, paid: 60000, paidDate: "2025-12-02", status: "paid" },
    { id: "p5", label: "Scolarité — Janvier", dueDate: "2026-01-05", amount: 60000, paid: 60000, paidDate: "2026-01-04", status: "paid" },
  ],
  additionalFees: [
    { id: "f1", label: "Uniforme scolaire", amount: 35000, status: "paid", paidDate: "2025-09-15", type: "uniforme" },
    { id: "f2", label: "Manuels CP1", amount: 28000, status: "paid", paidDate: "2025-09-20", type: "livres" },
    { id: "f3", label: "Frais d'examen T1", amount: 5000, status: "paid", paidDate: "2025-12-01", type: "examen" },
  ],
  activities: [
    { id: "a1", name: "Chorale scolaire", category: "music", schedule: "Mercredi 15h–16h", coach: "Mme Akissi", monthlyFee: 5000, feePaid: true, sessionsTotal: 4, sessionsAttended: 4 },
    { id: "a2", name: "Arts plastiques", category: "arts", schedule: "Vendredi 14h–15h", coach: "Mme Brou", monthlyFee: 3000, feePaid: true, sessionsTotal: 4, sessionsAttended: 3 },
  ],
  mealDaysThisMonth: ["Lun 06", "Mar 07", "Mer 08", "Jeu 09", "Ven 10", "Lun 13", "Mar 14", "Mer 15"],
  totalMealDaysMonth: 20,
  activityFeed: [
    { date: "15 jan 2026", icon: "📋", message: "Bulletin du Trimestre 1 disponible en téléchargement.", type: "success" },
    { date: "04 jan 2026", icon: "✅", message: "Paiement reçu — Scolarité Janvier (60 000 FCFA).", type: "success" },
    { date: "05 jan 2026", icon: "🍽️", message: "Abonnement cantine Janvier confirmé.", type: "info" },
    { date: "01 déc 2025", icon: "✅", message: "Paiement reçu — Frais d'examen T1 (5 000 FCFA).", type: "success" },
    { date: "02 déc 2025", icon: "✅", message: "Paiement reçu — Scolarité Décembre (60 000 FCFA).", type: "success" },
    { date: "20 déc 2025", icon: "🏆", message: "Résultats T1 publiés. Moyenne : 15,9/20 — Rang : 3/28.", type: "success" },
  ],
};

const CHILD_IBRAHIM: ChildPortalData = {
  studentId: "s_ibrahim",
  firstName: "Ibrahim",
  lastName: "Traoré",
  level: "CM1",
  initials: "IT",
  colorSeed: "#5B4FCF",
  annualFee: 340000,
  canteenSubscribed: true,
  canteenPaidMonth: false,
  termAverage: 13.7,
  classRank: 14,
  classTotal: 31,
  teacherRemark:
    "Ibrahim fait preuve de bonnes dispositions mais doit fournir davantage d'efforts en expression écrite. Sa participation orale reste timide. Il excelle en sport et en anglais — un vrai atout. Des progrès sont attendus au Trimestre 2.",
  grades: [
    { subject: "Lecture & Compréhension", icon: "📖", t1: 12, classAvg: 13.8, rank: 18 },
    { subject: "Expression écrite", icon: "✏️", t1: 11.5, classAvg: 12.5, rank: 21 },
    { subject: "Mathématiques", icon: "🔢", t1: 14, classAvg: 14.5, rank: 15 },
    { subject: "Histoire-Géographie", icon: "🗺️", t1: 13, classAvg: 13.0, rank: 14 },
    { subject: "Sciences de la nature", icon: "🌿", t1: 12.5, classAvg: 13.5, rank: 17 },
    { subject: "Anglais", icon: "🇬🇧", t1: 16, classAvg: 14.0, rank: 5 },
    { subject: "Éducation physique", icon: "⚽", t1: 17, classAvg: 14.5, rank: 3 },
  ],
  reportCards: [
    { term: "Trimestre 1", available: true, publishedDate: "15 janvier 2026" },
    { term: "Trimestre 2", available: false },
    { term: "Trimestre 3", available: false },
  ],
  payments: [
    { id: "p1", label: "Inscription (dépôt)", dueDate: "2025-06-01", amount: 68000, paid: 68000, paidDate: "2025-06-05", status: "paid" },
    { id: "p2", label: "Scolarité — Octobre", dueDate: "2025-10-05", amount: 68000, paid: 68000, paidDate: "2025-10-07", status: "paid" },
    { id: "p3", label: "Scolarité — Novembre", dueDate: "2025-11-05", amount: 68000, paid: 34000, paidDate: "2025-11-12", status: "partial" },
    { id: "p4", label: "Scolarité — Décembre", dueDate: "2025-12-05", amount: 68000, paid: 0, status: "overdue" },
    { id: "p5", label: "Scolarité — Janvier", dueDate: "2026-01-05", amount: 68000, paid: 0, status: "overdue" },
  ],
  additionalFees: [
    { id: "f1", label: "Uniforme scolaire", amount: 35000, status: "paid", paidDate: "2025-09-18", type: "uniforme" },
    { id: "f2", label: "Manuels CM1", amount: 35000, status: "paid", paidDate: "2025-09-22", type: "livres" },
    { id: "f3", label: "Frais d'examen T1", amount: 5000, status: "overdue", dueDate: "2025-12-05", type: "examen" },
    { id: "f4", label: "Sortie pédagogique T2", amount: 10000, status: "due", dueDate: "2026-01-31", type: "sortie" },
  ],
  activities: [
    { id: "a1", name: "Football", category: "sport", schedule: "Mercredi 15h–17h", coach: "M. Boka", monthlyFee: 8000, feePaid: true, sessionsTotal: 4, sessionsAttended: 3 },
    { id: "a2", name: "Informatique", category: "tech", schedule: "Vendredi 14h–15h", coach: "M. Dia", monthlyFee: 6000, feePaid: false, sessionsTotal: 4, sessionsAttended: 4 },
  ],
  mealDaysThisMonth: ["Lun 06", "Mer 08", "Jeu 09", "Ven 10", "Lun 13", "Mer 15"],
  totalMealDaysMonth: 20,
  activityFeed: [
    { date: "15 jan 2026", icon: "⚠️", message: "Paiement cantine Janvier non reçu — 15 000 FCFA en attente.", type: "alert" },
    { date: "15 jan 2026", icon: "📋", message: "Bulletin du Trimestre 1 disponible.", type: "info" },
    { date: "05 jan 2026", icon: "⚠️", message: "Échéance Scolarité Janvier non réglée (68 000 FCFA).", type: "alert" },
    { date: "05 déc 2025", icon: "⚠️", message: "Échéance Scolarité Décembre non réglée (68 000 FCFA).", type: "alert" },
    { date: "12 nov 2025", icon: "🔔", message: "Paiement partiel reçu — Scolarité Novembre (34 000 FCFA / 68 000).", type: "info" },
  ],
};

const PARENT_CHILDREN = [CHILD_MARIAM, CHILD_IBRAHIM];

// ── Helpers ─────────────────────────────────────────────────────
const fmtFCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function gradeColor(score: number): string {
  if (score >= 16) return "#166534";
  if (score >= 14) return "#15803D";
  if (score >= 12) return "#D9820C";
  if (score >= 10) return "#C05621";
  return "#991B1B";
}

function gradeBg(score: number): string {
  if (score >= 16) return "#DCFCE7";
  if (score >= 14) return "#D1FAE5";
  if (score >= 12) return "#FEF5E4";
  if (score >= 10) return "#FFEDD5";
  return "#FEE2E2";
}

function activityIcon(category: PortalActivity["category"]) {
  const map = {
    sport: <Dumbbell size={16} />,
    music: <Music size={16} />,
    tech: <Monitor size={16} />,
    arts: <Star size={16} />,
  };
  return map[category];
}

// ── Sub-components ───────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: PaymentInstallment["status"] | "due" | "overdue" }) {
  const map = {
    paid: { label: "Réglé", bg: "#DCFCE7", color: "#166534", icon: <CircleCheck size={12} /> },
    partial: { label: "Partiel", bg: "#FEF5E4", color: "#92400E", icon: <CircleMinus size={12} /> },
    overdue: { label: "En retard", bg: "#FEE2E2", color: "#991B1B", icon: <CircleX size={12} /> },
    pending: { label: "À venir", bg: "#F5F5F4", color: "#57534E", icon: <Clock size={12} /> },
    due: { label: "À payer", bg: "#FEF3C7", color: "#92400E", icon: <Clock size={12} /> },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon} {s.label}
    </span>
  );
}

// ── Login Screen ─────────────────────────────────────────────────

export function ParentLoginScreen({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = () => {
    if (phone === "07 45 67 89" && password === "1234") {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: CREAM, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Back to admin */}
      <div className="p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: "#9B9589" }}
        >
          <X size={14} /> Retour à l'administration
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        {/* School logo */}
        <div className="mb-8 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: GRN }}
          >
            <BookOpen size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
            Portail Parents
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B6557" }}>
            École Sainte-Marie d'Abidjan
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
            Année scolaire 2025–2026
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-sm border"
          style={{ borderColor: "#E8E2D6" }}
        >
          {!showForgot ? (
            <>
              <h2 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>
                Connexion
              </h2>
              <p className="text-sm mb-5" style={{ color: "#9B9589" }}>
                Accédez au suivi scolaire de votre enfant
              </p>

              {error && (
                <div
                  className="mb-4 p-3.5 rounded-xl text-sm flex items-start gap-2"
                  style={{ background: "#FEE2E2", color: "#991B1B" }}
                >
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Numéro ou mot de passe incorrect. Réessayez.</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: "#6B6557" }}>
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="07 00 00 00"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(false); }}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
                    style={{ borderColor: error ? "#FCA5A5" : "#E8E2D6", color: "#1A1A1A" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: "#6B6557" }}>
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ borderColor: error ? "#FCA5A5" : "#E8E2D6", color: "#1A1A1A" }}
                  />
                </div>

                <div className="text-right -mt-1">
                  <button
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-medium"
                    style={{ color: AMB }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: GRN }}
                >
                  Se connecter
                </button>
              </div>

              {/* Demo hint */}
              <div
                className="mt-5 p-4 rounded-2xl text-xs space-y-1"
                style={{ background: "#F7F4EE", color: "#9B9589" }}
              >
                <div className="font-semibold" style={{ color: "#6B6557" }}>
                  Compte de démonstration
                </div>
                <div>
                  Numéro :{" "}
                  <span className="font-mono font-bold" style={{ color: GRN }}>
                    07 45 67 89
                  </span>
                </div>
                <div>
                  Mot de passe :{" "}
                  <span className="font-mono font-bold" style={{ color: GRN }}>
                    1234
                  </span>
                </div>
                <div className="pt-1" style={{ color: "#B8B0A6" }}>
                  Famille Traoré — 2 enfants inscrits
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowForgot(false)}
                className="flex items-center gap-1.5 text-sm mb-5"
                style={{ color: "#9B9589" }}
              >
                <X size={14} /> Retour
              </button>
              <h2 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>
                Mot de passe oublié
              </h2>
              <p className="text-sm mb-5" style={{ color: "#9B9589" }}>
                Contactez la direction de l'école pour réinitialiser votre accès.
              </p>
              <div
                className="p-4 rounded-2xl text-sm"
                style={{ background: GRN_FAINT, color: GRN }}
              >
                <div className="font-bold mb-1">École Sainte-Marie d'Abidjan</div>
                <div>📞 27 22 47 85</div>
                <div>📧 direction@ste-marie-abidjan.ci</div>
                <div className="text-xs mt-2" style={{ color: "#5A8A70" }}>
                  Lundi–Vendredi, 8h–17h
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-xs mt-6 text-center" style={{ color: "#B8B0A6" }}>
          Ce portail est destiné aux parents et tuteurs légaux uniquement.
        </p>
      </div>
    </div>
  );
}

// ── Child Selector Dropdown ──────────────────────────────────────

function ChildSelector({
  children,
  selected,
  onSelect,
}: {
  children: ChildPortalData[];
  selected: ChildPortalData;
  onSelect: (c: ChildPortalData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl border"
        style={{ background: "#fff", borderColor: "#E8E2D6" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: selected.colorSeed }}
        >
          {selected.initials}
        </div>
        <div className="text-left">
          <div className="text-sm font-bold leading-none" style={{ color: "#1A1A1A" }}>
            {selected.firstName} {selected.lastName}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
            {selected.level}
          </div>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: "#9B9589",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border z-20 min-w-52 overflow-hidden"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div className="px-3 py-2.5 border-b" style={{ borderColor: "#F0EDE6" }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9B9589" }}>
                Mes enfants
              </span>
            </div>
            {children.map((c) => (
              <button
                key={c.studentId}
                onClick={() => { onSelect(c); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 text-left"
                style={{
                  background: c.studentId === selected.studentId ? GRN_FAINT : "white",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: c.colorSeed }}
                >
                  {c.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-xs" style={{ color: "#9B9589" }}>
                    {c.level}
                  </div>
                </div>
                {c.studentId === selected.studentId && (
                  <CheckCircle2 size={14} className="ml-auto" style={{ color: GRN }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Bottom Tab Bar ───────────────────────────────────────────────

function BottomNav({
  screen,
  setScreen,
  hasAlert,
}: {
  screen: ParentScreen;
  setScreen: (s: ParentScreen) => void;
  hasAlert: boolean;
}) {
  const tabs = [
    { id: "home" as const, label: "Accueil", icon: Home },
    { id: "academics" as const, label: "Bulletins", icon: GraduationCap },
    { id: "payments" as const, label: "Paiements", icon: Wallet },
    { id: "life" as const, label: "Vie scolaire", icon: UtensilsCrossed },
  ];

  return (
    <nav
      className="flex-shrink-0 border-t bg-white"
      style={{ borderColor: "#E8E2D6" }}
    >
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = screen === tab.id;
          const showDot = tab.id === "payments" && hasAlert;
          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative"
            >
              <div className="relative">
                <tab.icon
                  size={22}
                  style={{ color: active ? GRN : "#9B9589" }}
                />
                {showDot && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{ background: "#C0392B" }}
                  />
                )}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: active ? GRN : "#9B9589" }}
              >
                {tab.label}
              </span>
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: GRN }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── Parent Home ──────────────────────────────────────────────────

function ParentHome({
  child,
  setScreen,
}: {
  child: ChildPortalData;
  setScreen: (s: ParentScreen) => void;
}) {
  const totalDue = child.payments.reduce((a, p) => a + p.amount, 0);
  const totalPaid = child.payments.reduce((a, p) => a + p.paid, 0);
  const balance = totalDue - totalPaid;
  const hasOverdue = child.payments.some((p) => p.status === "overdue");
  const hasAdditionalOverdue = child.additionalFees.some((f) => f.status === "overdue");
  const anyAlert = hasOverdue || hasAdditionalOverdue || !child.canteenPaidMonth;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-8">
        {/* Welcome */}
        <div>
          <p className="text-sm" style={{ color: "#9B9589" }}>
            Bonjour, M. Traoré
          </p>
          <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
            Suivi de {child.firstName}
          </h2>
        </div>

        {/* Alert banner */}
        {anyAlert && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "#FEF5E4", border: `1px solid #FDE68A` }}
          >
            <AlertTriangle size={18} style={{ color: AMB, flexShrink: 0 }} className="mt-0.5" />
            <div>
              <div className="text-sm font-bold" style={{ color: "#92400E" }}>
                Action requise
              </div>
              <ul className="text-xs mt-1 space-y-0.5" style={{ color: "#B45309" }}>
                {hasOverdue && <li>• Paiements de scolarité en retard — régularisation nécessaire.</li>}
                {hasAdditionalOverdue && <li>• Frais supplémentaires impayés (examen, activité…).</li>}
                {!child.canteenPaidMonth && <li>• Cantine Janvier non réglée (15 000 FCFA).</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Snapshot cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Average */}
          <div
            className="bg-white rounded-2xl p-4 border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div className="text-xs mb-2" style={{ color: "#9B9589" }}>
              Moyenne T1
            </div>
            <div
              className="text-3xl font-bold font-mono"
              style={{ color: gradeColor(child.termAverage) }}
            >
              {child.termAverage.toFixed(1)}
            </div>
            <div className="text-xs mt-1" style={{ color: "#9B9589" }}>
              /20 · Rang {child.classRank}/{child.classTotal}
            </div>
          </div>

          {/* Payment status */}
          <div
            className="bg-white rounded-2xl p-4 border"
            style={{ borderColor: balance > 0 ? "#FEE2E2" : "#E8E2D6" }}
          >
            <div className="text-xs mb-2" style={{ color: "#9B9589" }}>
              Scolarité 2025–26
            </div>
            {balance === 0 ? (
              <>
                <div
                  className="text-sm font-bold flex items-center gap-1.5"
                  style={{ color: "#166534" }}
                >
                  <CheckCircle2 size={16} /> À jour
                </div>
                <div className="text-xs mt-1" style={{ color: "#9B9589" }}>
                  {fmtFCFA(totalPaid)} versé
                </div>
              </>
            ) : (
              <>
                <div
                  className="font-mono text-lg font-bold"
                  style={{ color: "#991B1B" }}
                >
                  {fmtFCFA(balance)}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#991B1B" }}>
                  solde restant
                </div>
              </>
            )}
          </div>

          {/* Canteen */}
          <div
            className="bg-white rounded-2xl p-4 border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div className="text-xs mb-2" style={{ color: "#9B9589" }}>
              Cantine — Janvier
            </div>
            {child.canteenSubscribed ? (
              <div
                className="text-sm font-bold flex items-center gap-1.5"
                style={{ color: child.canteenPaidMonth ? "#166534" : "#991B1B" }}
              >
                {child.canteenPaidMonth ? <CheckCircle2 size={16} /> : <CircleX size={16} />}
                {child.canteenPaidMonth ? "Réglée" : "Non réglée"}
              </div>
            ) : (
              <div className="text-sm font-medium" style={{ color: "#9B9589" }}>
                Non abonné·e
              </div>
            )}
            {child.canteenSubscribed && (
              <div className="text-xs mt-1" style={{ color: "#9B9589" }}>
                {child.mealDaysThisMonth.length} repas ce mois
              </div>
            )}
          </div>

          {/* Report card */}
          <div
            className="bg-white rounded-2xl p-4 border"
            style={{ borderColor: "#E8E2D6" }}
          >
            <div className="text-xs mb-2" style={{ color: "#9B9589" }}>
              Bulletin T1
            </div>
            {child.reportCards[0].available ? (
              <>
                <div
                  className="text-sm font-bold flex items-center gap-1.5"
                  style={{ color: GRN }}
                >
                  <CheckCircle2 size={16} /> Disponible
                </div>
                <button
                  onClick={() => setScreen("academics")}
                  className="text-xs mt-1.5 flex items-center gap-1"
                  style={{ color: AMB }}
                >
                  Télécharger <ArrowRight size={10} />
                </button>
              </>
            ) : (
              <div className="text-sm font-medium" style={{ color: "#9B9589" }}>
                Pas encore publié
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Voir les notes", screen: "academics" as const, icon: <GraduationCap size={16} />, color: GRN },
            { label: "Mes paiements", screen: "payments" as const, icon: <Wallet size={16} />, color: balance > 0 ? "#991B1B" : GRN },
          ].map((link) => (
            <button
              key={link.label}
              onClick={() => setScreen(link.screen)}
              className="flex items-center justify-between bg-white rounded-2xl p-4 border text-sm font-semibold"
              style={{ borderColor: "#E8E2D6", color: link.color }}
            >
              <span className="flex items-center gap-2">
                {link.icon} {link.label}
              </span>
              <ChevronRight size={14} style={{ color: "#C4BDB5" }} />
            </button>
          ))}
        </div>

        {/* Activity feed */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="px-4 py-3.5 border-b"
            style={{ borderColor: "#F0EDE6" }}
          >
            <h3 className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Activité récente
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: "#F5F0E8" }}>
            {child.activityFeed.slice(0, 5).map((event, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    background:
                      event.type === "alert"
                        ? "#FEE2E2"
                        : event.type === "success"
                          ? "#DCFCE7"
                          : "#EEF4F1",
                  }}
                >
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug" style={{ color: "#1A1A1A" }}>
                    {event.message}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
                    {event.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Parent Academics ─────────────────────────────────────────────

function ParentAcademics({ child }: { child: ChildPortalData }) {
  const [activeTab, setActiveTab] = useState<"grades" | "trend">("grades");

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-8">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
            Résultats scolaires
          </h2>
          <p className="text-sm" style={{ color: "#9B9589" }}>
            {child.firstName} · {child.level} · Année 2025–2026
          </p>
        </div>

        {/* Overall average card */}
        <div
          className="rounded-2xl p-5 flex items-center gap-5"
          style={{ background: GRN }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <span className="font-mono text-2xl font-bold text-white">
              {child.termAverage.toFixed(1)}
            </span>
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">
              Trimestre 1
            </div>
            <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              Moyenne générale / 20
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                Rang {child.classRank} / {child.classTotal}
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                {child.level}
              </span>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "#EAE5D9" }}
        >
          {(["grades", "trend"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={{
                background: activeTab === t ? "#fff" : "transparent",
                color: activeTab === t ? "#1A1A1A" : "#6B6557",
                boxShadow: activeTab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {t === "grades" ? "Notes par matière" : "Évolution"}
            </button>
          ))}
        </div>

        {/* Grades per subject */}
        {activeTab === "grades" && (
          <div className="space-y-3">
            {child.grades.map((g) => (
              <div
                key={g.subject}
                className="bg-white rounded-2xl p-4 border flex items-center gap-4"
                style={{ borderColor: "#E8E2D6" }}
              >
                <div className="text-2xl flex-shrink-0">{g.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>
                    {g.subject}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-2 rounded-full flex-1"
                      style={{ background: "#F0EDE6", maxWidth: 120 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(g.t1 / 20) * 100}%`,
                          background: gradeColor(g.t1),
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: "#9B9589" }}>
                      Classe : {g.classAvg.toFixed(1)}/20
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-xl font-bold font-mono px-3 py-1.5 rounded-xl"
                    style={{
                      color: gradeColor(g.t1),
                      background: gradeBg(g.t1),
                    }}
                  >
                    {g.t1.toFixed(1)}
                  </div>
                  {g.t1 > g.classAvg ? (
                    <div className="flex items-center justify-end gap-0.5 mt-0.5 text-xs" style={{ color: "#166534" }}>
                      <TrendingUp size={10} /> Au-dessus
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-0.5 mt-0.5 text-xs" style={{ color: "#991B1B" }}>
                      <TrendingDown size={10} /> En dessous
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trend view */}
        {activeTab === "trend" && (
          <div className="space-y-3">
            <div
              className="bg-white rounded-2xl p-5 border"
              style={{ borderColor: "#E8E2D6" }}
            >
              <div className="text-sm font-semibold mb-4" style={{ color: "#1A1A1A" }}>
                Évolution par trimestre
              </div>
              <div className="grid grid-cols-3 gap-3">
                {child.reportCards.map((rc, i) => (
                  <div
                    key={rc.term}
                    className="rounded-xl p-3 text-center"
                    style={{ background: rc.available ? GRN_FAINT : "#F5F5F4" }}
                  >
                    <div className="text-xs font-semibold mb-2" style={{ color: rc.available ? GRN : "#9B9589" }}>
                      T{i + 1}
                    </div>
                    {rc.available ? (
                      <div
                        className="text-2xl font-bold font-mono"
                        style={{ color: GRN }}
                      >
                        {i === 0 ? child.termAverage.toFixed(1) : "—"}
                      </div>
                    ) : (
                      <div className="text-lg font-bold" style={{ color: "#C4BDB5" }}>—</div>
                    )}
                    <div className="text-xs mt-1" style={{ color: "#9B9589" }}>
                      /20
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-subject trend table */}
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: "#E8E2D6" }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: "#F0EDE6" }}>
                <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                  Comparaison T1 / T2 par matière
                </span>
              </div>
              {child.grades.map((g, i) => (
                <div
                  key={g.subject}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid #F5F0E8" : undefined }}
                >
                  <span className="text-lg">{g.icon}</span>
                  <span className="flex-1 text-sm" style={{ color: "#1A1A1A" }}>
                    {g.subject}
                  </span>
                  <span
                    className="font-mono text-sm font-bold w-10 text-center rounded-lg py-0.5"
                    style={{ color: gradeColor(g.t1), background: gradeBg(g.t1) }}
                  >
                    {g.t1.toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: "#C4BDB5" }}>→</span>
                  <span className="font-mono text-sm w-10 text-center" style={{ color: "#C4BDB5" }}>
                    —
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher remark */}
        <div
          className="bg-white rounded-2xl p-5 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="text-sm font-bold mb-3" style={{ color: "#1A1A1A" }}>
            Appréciation de l'enseignant·e
          </div>
          <blockquote
            className="text-sm leading-relaxed pl-3 border-l-2"
            style={{ color: "#6B6557", borderColor: GRN }}
          >
            "{child.teacherRemark}"
          </blockquote>
          <div className="text-xs mt-2" style={{ color: "#9B9589" }}>
            Mme Traoré Salimata · Maîtresse CP1
          </div>
        </div>

        {/* Report card downloads */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="px-4 py-3.5 border-b" style={{ borderColor: "#F0EDE6" }}>
            <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Bulletins scolaires
            </span>
          </div>
          {child.reportCards.map((rc, i) => (
            <div
              key={rc.term}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderTop: i > 0 ? "1px solid #F5F0E8" : undefined }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: rc.available ? GRN_FAINT : "#F5F5F4" }}
              >
                <GraduationCap
                  size={16}
                  style={{ color: rc.available ? GRN : "#C4BDB5" }}
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                  {rc.term}
                </div>
                {rc.publishedDate && (
                  <div className="text-xs" style={{ color: "#9B9589" }}>
                    Publié le {rc.publishedDate}
                  </div>
                )}
              </div>
              {rc.available ? (
                <button
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                  style={{ background: GRN_FAINT, color: GRN }}
                >
                  <Download size={12} /> Télécharger
                </button>
              ) : (
                <span className="text-xs px-3 py-2 rounded-xl" style={{ background: "#F5F5F4", color: "#9B9589" }}>
                  À venir
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Parent Payments ──────────────────────────────────────────────

function ParentPayments({ child }: { child: ChildPortalData }) {
  const totalDue = child.payments.reduce((a, p) => a + p.amount, 0);
  const totalPaid = child.payments.reduce((a, p) => a + p.paid, 0);
  const balance = totalDue - totalPaid;
  const pctPaid = Math.round((totalPaid / totalDue) * 100);

  const additionalTotal = child.additionalFees.reduce((a, f) => a + f.amount, 0);
  const additionalPaid = child.additionalFees
    .filter((f) => f.status === "paid")
    .reduce((a, f) => a + f.amount, 0);

  const typeLabel: Record<AdditionalFee["type"], string> = {
    uniforme: "Uniforme",
    livres: "Manuels",
    examen: "Examen",
    activites: "Activités",
    sortie: "Sortie pédagogique",
  };

  const typeIcon: Record<AdditionalFee["type"], string> = {
    uniforme: "👕",
    livres: "📚",
    examen: "📝",
    activites: "⭐",
    sortie: "🚌",
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-8">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
            Paiements & Frais
          </h2>
          <p className="text-sm" style={{ color: "#9B9589" }}>
            {child.firstName} · Vue synthétique · Lecture seule
          </p>
        </div>

        {/* Summary card */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: balance > 0 ? "#FEF2F2" : GRN_FAINT,
            border: `1px solid ${balance > 0 ? "#FEE2E2" : "#C6E2D3"}`,
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: balance > 0 ? "#991B1B" : GRN }}>
                {balance > 0 ? "Solde restant dû" : "Scolarité soldée ✓"}
              </div>
              <div
                className="font-mono text-3xl font-bold mt-1"
                style={{ color: balance > 0 ? "#991B1B" : GRN }}
              >
                {balance > 0 ? fmtFCFA(balance) : fmtFCFA(totalPaid)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: balance > 0 ? "#C0392B" : "#5A8A70" }}>
                {balance > 0 ? `${fmtFCFA(totalPaid)} versé sur ${fmtFCFA(totalDue)}` : "Intégralement réglée"}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-xl font-bold font-mono"
                style={{ color: balance > 0 ? "#991B1B" : GRN }}
              >
                {pctPaid}%
              </div>
              <div className="text-xs" style={{ color: "#9B9589" }}>réglé</div>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pctPaid}%`,
                background: balance > 0 ? "#EF4444" : GRN,
              }}
            />
          </div>
        </div>

        {/* Installment schedule */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="px-4 py-3.5 border-b" style={{ borderColor: "#F0EDE6" }}>
            <div className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Échéancier de scolarité
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
              Scolarité annuelle : {fmtFCFA(totalDue)} · {child.level}
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: "#F5F0E8" }}>
            {child.payments.map((p) => (
              <div key={p.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                      {p.label}
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs mt-0.5"
                      style={{ color: "#9B9589" }}
                    >
                      <CalendarDays size={11} />
                      Date limite : {p.dueDate}
                    </div>
                    {p.paidDate && (
                      <div
                        className="flex items-center gap-1 text-xs mt-0.5"
                        style={{ color: "#166534" }}
                      >
                        <CheckCircle2 size={11} />
                        Reçu le {p.paidDate}
                      </div>
                    )}
                    {p.status === "partial" && (
                      <div className="text-xs mt-0.5" style={{ color: "#92400E" }}>
                        Versé : {fmtFCFA(p.paid)} / Restant : {fmtFCFA(p.amount - p.paid)}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-sm font-bold mb-1.5" style={{ color: "#1A1A1A" }}>
                      {fmtFCFA(p.amount)}
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="px-4 py-3 flex items-center justify-between border-t"
            style={{ borderColor: "#EAE5D9", background: "#F7F4EE" }}
          >
            <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Total scolarité
            </span>
            <span className="font-mono text-sm font-bold" style={{ color: GRN }}>
              {fmtFCFA(totalDue)}
            </span>
          </div>
        </div>

        {/* Additional fees */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="px-4 py-3.5 border-b" style={{ borderColor: "#F0EDE6" }}>
            <div className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Frais annexes
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
              {fmtFCFA(additionalPaid)} réglé sur {fmtFCFA(additionalTotal)}
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: "#F5F0E8" }}>
            {child.additionalFees.map((f) => (
              <div key={f.id} className="px-4 py-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "#F7F4EE" }}
                >
                  {typeIcon[f.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                    {f.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
                    {typeLabel[f.type]}
                    {f.paidDate && ` · Réglé le ${f.paidDate}`}
                    {f.dueDate && ` · Échéance ${f.dueDate}`}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm font-bold mb-1" style={{ color: "#1A1A1A" }}>
                    {fmtFCFA(f.amount)}
                  </div>
                  <PaymentStatusBadge status={f.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canteen subscription */}
        <div
          className="bg-white rounded-2xl p-4 border"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                Abonnement cantine
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
                {child.canteenSubscribed ? "15 000 FCFA / mois" : "Non souscrit"}
              </div>
            </div>
            {child.canteenSubscribed && (
              <PaymentStatusBadge status={child.canteenPaidMonth ? "paid" : "overdue"} />
            )}
          </div>
          {child.canteenSubscribed && !child.canteenPaidMonth && (
            <div
              className="mt-3 p-3 rounded-xl text-xs"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              La cantine de Janvier n'est pas encore réglée. Veuillez contacter la direction.
            </div>
          )}
        </div>

        {/* Read-only note */}
        <div
          className="flex items-start gap-2 p-3 rounded-xl text-xs"
          style={{ background: "#F7F4EE", color: "#9B9589" }}
        >
          <Clock size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            Ce tableau de bord est en lecture seule. Pour effectuer un paiement ou corriger une information,
            contactez la secrétaire au <strong style={{ color: GRN }}>27 22 47 85</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Parent Life (Canteen + Activities) ───────────────────────────

function ParentLife({ child }: { child: ChildPortalData }) {
  const activityCategoryColors: Record<PortalActivity["category"], { bg: string; color: string }> = {
    sport: { bg: "#DBEAFE", color: "#1D4ED8" },
    music: { bg: "#F3E8FF", color: "#7C3AED" },
    tech: { bg: "#DCFCE7", color: "#166534" },
    arts: { bg: "#FEF3C7", color: "#92400E" },
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-8">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
            Vie scolaire
          </h2>
          <p className="text-sm" style={{ color: "#9B9589" }}>
            Cantine & activités parascolaires — {child.firstName}
          </p>
        </div>

        {/* Canteen section */}
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#E8E2D6" }}
        >
          <div
            className="px-4 py-3.5 border-b flex items-center gap-2"
            style={{ borderColor: "#F0EDE6" }}
          >
            <UtensilsCrossed size={16} style={{ color: GRN }} />
            <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Cantine scolaire
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Status + payment */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                  Abonnement Janvier 2026
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#9B9589" }}>
                  Tarif : 15 000 FCFA / mois
                </div>
              </div>
              <PaymentStatusBadge status={child.canteenPaidMonth ? "paid" : "overdue"} />
            </div>

            {/* Attendance progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: "#6B6557" }}>Repas consommés ce mois</span>
                <span className="font-mono font-bold" style={{ color: GRN }}>
                  {child.mealDaysThisMonth.length} / {child.totalMealDaysMonth} jours
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F0EDE6" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(child.mealDaysThisMonth.length / child.totalMealDaysMonth) * 100}%`,
                    background: GRN,
                  }}
                />
              </div>
              <div className="text-xs mt-1.5" style={{ color: "#9B9589" }}>
                Mois en cours — {child.totalMealDaysMonth - child.mealDaysThisMonth.length} jours ouvrés restants
              </div>
            </div>

            {/* Meal day badges */}
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: "#9B9589" }}>
                Présences — Janvier 2026
              </div>
              <div className="flex flex-wrap gap-1.5">
                {child.mealDaysThisMonth.map((day) => (
                  <span
                    key={day}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: GRN_FAINT, color: GRN }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activities section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} style={{ color: AMB }} />
            <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Activités parascolaires
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono font-bold"
              style={{ background: AMB_FAINT, color: AMB }}
            >
              {child.activities.length}
            </span>
          </div>

          {child.activities.length === 0 ? (
            <div
              className="bg-white rounded-2xl p-6 border text-center"
              style={{ borderColor: "#E8E2D6" }}
            >
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm" style={{ color: "#9B9589" }}>
                {child.firstName} n'est inscrit·e dans aucune activité pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {child.activities.map((act) => {
                const colors = activityCategoryColors[act.category];
                const attendancePct = Math.round(
                  (act.sessionsAttended / act.sessionsTotal) * 100
                );
                return (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl border overflow-hidden"
                    style={{ borderColor: "#E8E2D6" }}
                  >
                    {/* Header */}
                    <div className="px-4 py-4 flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: colors.bg, color: colors.color }}
                      >
                        {activityIcon(act.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                            {act.name}
                          </div>
                          <PaymentStatusBadge status={act.feePaid ? "paid" : "overdue"} />
                        </div>
                        <div className="text-xs mt-1 space-y-0.5">
                          <div className="flex items-center gap-1" style={{ color: "#9B9589" }}>
                            <Clock size={11} /> {act.schedule}
                          </div>
                          <div style={{ color: "#9B9589" }}>
                            Encadrant·e : {act.coach}
                          </div>
                          <div style={{ color: "#9B9589" }}>
                            Cotisation mensuelle : <span className="font-mono font-semibold" style={{ color: "#1A1A1A" }}>{fmtFCFA(act.monthlyFee)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance */}
                    <div
                      className="px-4 pb-4 border-t pt-3"
                      style={{ borderColor: "#F5F0E8" }}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span style={{ color: "#6B6557" }}>Présences ce mois</span>
                        <span className="font-mono font-bold" style={{ color: GRN }}>
                          {act.sessionsAttended} / {act.sessionsTotal} séances
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "#F0EDE6" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${attendancePct}%`,
                            background:
                              attendancePct === 100
                                ? GRN
                                : attendancePct >= 75
                                  ? AMB
                                  : "#EF4444",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs" style={{ color: "#9B9589" }}>
                          {attendancePct}% de présence
                        </span>
                        {attendancePct === 100 && (
                          <span className="text-xs flex items-center gap-0.5" style={{ color: GRN }}>
                            <Star size={10} fill={GRN} /> Assidu·e
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fee alert */}
                    {!act.feePaid && (
                      <div
                        className="px-4 py-3 border-t flex items-center gap-2"
                        style={{ borderColor: "#FEE2E2", background: "#FEF2F2" }}
                      >
                        <AlertTriangle size={13} style={{ color: "#991B1B" }} />
                        <span className="text-xs" style={{ color: "#991B1B" }}>
                          Cotisation de janvier non réglée — {fmtFCFA(act.monthlyFee)} dus
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact note */}
        <div
          className="flex items-start gap-2 p-3 rounded-xl text-xs"
          style={{ background: "#F7F4EE", color: "#9B9589" }}
        >
          <Bell size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            Pour inscrire {child.firstName} à une nouvelle activité ou signaler une absence,
            contactez la direction : <strong style={{ color: GRN }}>27 22 47 85</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Parent Portal App ────────────────────────────────────────────

export function ParentPortalApp({ onLogout }: { onLogout: () => void }) {
  const [screen, setScreen] = useState<ParentScreen>("home");
  const [selectedChild, setSelectedChild] = useState<ChildPortalData>(PARENT_CHILDREN[0]);

  const hasAlert =
    selectedChild.payments.some((p) => p.status === "overdue" || p.status === "partial") ||
    selectedChild.additionalFees.some((f) => f.status === "overdue") ||
    !selectedChild.canteenPaidMonth;

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: CREAM,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        maxWidth: "100%",
      }}
    >
      {/* Top bar */}
      <header
        className="flex-shrink-0 bg-white border-b"
        style={{ borderColor: "#E8E2D6" }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          {/* Logo */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: GRN }}
          >
            <BookOpen size={15} className="text-white" />
          </div>

          {/* Child selector */}
          <div className="flex-1">
            <ChildSelector
              children={PARENT_CHILDREN}
              selected={selectedChild}
              onSelect={(c) => { setSelectedChild(c); setScreen("home"); }}
            />
          </div>

          {/* Notification */}
          <div className="relative">
            <button
              className="w-9 h-9 rounded-xl border flex items-center justify-center"
              style={{ borderColor: "#E8E2D6" }}
            >
              <Bell size={16} style={{ color: "#6B6557" }} />
            </button>
            {hasAlert && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ background: "#C0392B" }}
              />
            )}
          </div>

          {/* Log out */}
          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-xl border flex items-center justify-center"
            style={{ borderColor: "#E8E2D6" }}
            title="Déconnexion"
          >
            <LogOut size={15} style={{ color: "#6B6557" }} />
          </button>
        </div>
      </header>

      {/* Screen content */}
      {screen === "home" && (
        <ParentHome child={selectedChild} setScreen={setScreen} />
      )}
      {screen === "academics" && <ParentAcademics child={selectedChild} />}
      {screen === "payments" && <ParentPayments child={selectedChild} />}
      {screen === "life" && <ParentLife child={selectedChild} />}

      {/* Bottom nav */}
      <BottomNav screen={screen} setScreen={setScreen} hasAlert={hasAlert} />
    </div>
  );
}
