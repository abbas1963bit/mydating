"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Eye, Heart, House, LogOut, Mail, Settings, Shield, UserRound, Users } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { LanguagePicker } from "@/components/language-picker";
import { useLanguage } from "@/components/language-provider";
import type { PageTranslationKey } from "@/lib/i18n-pages";

const navigation = [
  { href: "/app", label: "navHome", icon: House },
  { href: "/discover", label: "navDiscover", icon: Compass },
  { href: "/likes", label: "navLikes", icon: Heart },
  { href: "/messages", label: "navMessages", icon: Mail },
  { href: "/visitors", label: "navVisitors", icon: Eye },
  { href: "/notifications", label: "navNotifications", icon: Bell },
  { href: "/profile", label: "navProfile", icon: UserRound },
  { href: "/settings", label: "navSettings", icon: Settings },
];

type MemberShellProps = {
  children: React.ReactNode;
  displayName: string;
  role: string;
};

export function MemberShell({ children, displayName, role }: MemberShellProps) {
  const pathname = usePathname();
  const { pageT, t } = useLanguage();
  const initials = displayName.trim().slice(0, 1).toUpperCase() || "W";

  return (
    <div className="member-app">
      <header className="member-topbar">
        <Link href="/app" className="wordmark"><span className="brand-mark"><Heart size={16} fill="currentColor" /></span><span>WeDating</span></Link>
        <div className="member-top-actions"><LanguagePicker /><Link className="profile-mini" href="/profile"><span className="avatar-fallback avatar-small">{initials}</span><span>{displayName}</span></Link><form action={signOut}><button className="icon-button" type="submit" aria-label={pageT("logout")} title={pageT("logout")}><LogOut size={17} /></button></form></div>
      </header>
      <div className="member-layout">
        <aside className="member-sidebar">
          <div className="sidebar-profile"><span className="avatar-fallback">{initials}</span><span><strong>{displayName}</strong><small>{pageT("personalSpace")}</small></span></div>
          <nav aria-label={t("memberNavigation")}>
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
              return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={17} /><span>{pageT(label as PageTranslationKey)}</span></Link>;
            })}
            {role !== "member" && <Link href="/admin" className={pathname.startsWith("/admin") ? "active" : ""}><Shield size={17} /><span>{pageT("navAdmin")}</span></Link>}
          </nav>
          <div className="sidebar-bottom"><span className="sidebar-online"><i />{pageT("accountActive")}</span><Link href="/community-guidelines"><Users size={15} />{pageT("navCommunity")}</Link></div>
        </aside>
        <main className="member-main">{children}</main>
      </div>
      <nav className="mobile-tabbar" aria-label={t("memberNavigation")}>
        {navigation.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={19} /><span>{pageT(label as PageTranslationKey)}</span></Link>;
        })}
      </nav>
    </div>
  );
}