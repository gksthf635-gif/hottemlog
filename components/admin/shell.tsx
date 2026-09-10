"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clapperboard,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/admin/actions";
const menus = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/contents", label: "콘텐츠 관리", icon: Clapperboard },
  { href: "/admin/analytics", label: "통계", icon: ChartNoAxesCombined },
  { href: "/admin/settings", label: "설정", icon: Settings },
];
export function AdminShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand">
          <Sparkles size={23} />
          <span>
            <strong>핫템로그</strong>
            <small>CREATOR STUDIO</small>
          </span>
        </Link>
        <nav aria-label="관리자 메뉴">
          {menus.map((m) => (
            <Link
              href={m.href}
              key={m.href}
              className={
                (
                  m.href === "/admin"
                    ? pathname === m.href
                    : pathname.startsWith(m.href)
                )
                  ? "active"
                  : ""
              }
            >
              <m.icon size={19} />
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" target="_blank">
            홈페이지 보기 <ArrowUpRight size={16} />
          </Link>
          <form action={logout}>
            <button>
              <LogOut size={17} />
              로그아웃
            </button>
          </form>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>한솔의 작은 편집실</span>
          <div>
            <span className="avatar">{name.slice(0, 1)}</span>
            {name} 님
          </div>
        </header>
        <main id="main-content" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
