"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Eye, Heart, House, LogOut, Mail, Settings, Shield, UserRound, Users } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { LanguagePicker } from "@/components/language-picker";

const navigation = [
  { href: "/app", label: "Home", icon: House },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/likes", label: "Likes", icon: Heart },
  { href: "/messages", label: "Messages", icon: Mail },
  { href: "/visitors", label: "Visitors", icon: Eye },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "My profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

type MemberShellProps = {
  children: React.ReactNode;
  displayName: string;
  role: string;
};

export function MemberShell({ children, displayName, role }: MemberShellProps) {
  const pathname = usePathname();
  const initials = displayName.trim().slice(0, 1).toUpperCase() || "W";

  return (
    <div className="member-app">
      <header className="member-topbar">
        <Link href="/app" className="wordmark"><span className="brand-mark"><Heart size={16} fill="currentColor" /></span><span>WeDating</span></Link>
        <div className="member-top-actions"><LanguagePicker /><Link className="profile-mini" href="/profile"><span className="avatar-fallback avatar-small">{initials}</span><span>{displayName}</span></Link><form action={signOut}><button className="icon-button" type="submit" aria-label="Log out" title="Log out"><LogOut size={17} /></button></form></div>
      </header>
      <div className="member-layout">
        <aside className="member-sidebar">
          <div className="sidebar-profile"><span className="avatar-fallback">{initials}</span><span><strong>{displayName}</strong><small>Personal space</small></span></div>
          <nav aria-label="Member navigation">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
              return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={17} /><span>{label}</span></Link>;
            })}
            {role !== "member" && <Link href="/admin" className={pathname.startsWith("/admin") ? "active" : ""}><Shield size={17} /><span>Admin</span></Link>}
          </nav>
          <div className="sidebar-bottom"><span className="sidebar-online"><i />Your account is active</span><Link href="/community-guidelines"><Users size={15} />Community guidelines</Link></div>
        </aside>
        <main className="member-main">{children}</main>
      </div>
      <nav className="mobile-tabbar" aria-label="Member navigation">
        {navigation.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={19} /><span>{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}