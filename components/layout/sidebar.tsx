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
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/students", label: "Élèves", icon: Users },
  { href: "/classes", label: "Classes", icon: GraduationCap },
  { href: "/teachers", label: "Enseignants", icon: UserCog },
  { href: "/grades", label: "Notes", icon: BookOpen },
  { href: "/invoices", label: "Finance", icon: Wallet },
];

export function Sidebar({ schoolName }: { schoolName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen flex-shrink-0 flex-col bg-forest transition-all duration-300"
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
    </aside>
  );
}
