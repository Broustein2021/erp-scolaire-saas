"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  Wallet,
  BookOpen,
  Shield,
  UserRound,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/login/actions";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", shortLabel: "Accueil", icon: LayoutDashboard },
  { href: "/students", label: "Élèves", shortLabel: "Élèves", icon: Users },
  { href: "/classes", label: "Classes", shortLabel: "Classes", icon: GraduationCap },
  { href: "/teachers", label: "Enseignants", shortLabel: "Profs", icon: UserCog },
  { href: "/grades", label: "Notes", shortLabel: "Notes", icon: BookOpen },
  { href: "/invoices", label: "Finance", shortLabel: "Finance", icon: Wallet },
  { href: "/comptable", label: "Comptable", shortLabel: "Compta", icon: Shield },
  { href: "/parent", label: "Portail parent", shortLabel: "Parent", icon: UserRound },
];

export function Sidebar({ schoolName }: { schoolName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className="hidden h-screen flex-shrink-0 flex-col bg-forest transition-all duration-300 md:flex"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber">
          <BookOpen size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold leading-none text-white">SGE</div>
            <div className="mt-0.5 truncate text-xs text-white/45">{schoolName}</div>
          </div>
        )}
        <button
          className="ml-auto text-white/40 transition-colors hover:text-white/70"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                collapsed ? "justify-center py-2.5" : "justify-start px-3 py-2.5"
              } ${active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5"}`}
              style={{ borderLeft: active ? "3px solid #D9820C" : "3px solid transparent" }}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <form action={logout}>
          <button
            type="submit"
            className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white ${
              collapsed ? "justify-center" : "justify-start px-3"
            }`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Se déconnecter</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch overflow-x-auto border-t border-black/10 bg-forest md:hidden">
      {navItems.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1"
          >
            <item.icon size={20} className={active ? "text-amber" : "text-white/50"} />
            <span className={`text-[10px] font-medium ${active ? "text-amber" : "text-white/50"}`}>
              {item.shortLabel}
            </span>
          </Link>
        );
      })}
      <form action={logout} className="flex min-w-[64px] flex-1">
        <button type="submit" className="flex flex-1 flex-col items-center justify-center gap-1">
          <LogOut size={20} className="text-white/50" />
          <span className="text-[10px] font-medium text-white/50">Sortir</span>
        </button>
      </form>
    </nav>
  );
}
