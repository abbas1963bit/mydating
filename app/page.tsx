import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Globe2, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocalizedText } from "@/components/language-provider";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow"><LocalizedText translationKey="heroEyebrow" /></span>
              <h1><LocalizedText translationKey="heroTitle" /></h1>
              <p><LocalizedText translationKey="heroBody" /></p>
              <div className="hero-actions">
                <Link className="button button-rose" href="/sign-up"><LocalizedText translationKey="findPeople" /><ArrowUpRight size={16} /></Link>
                <Link className="button button-outline" href="/discover"><LocalizedText translationKey="meetSomeone" /><ArrowDown size={15} /></Link>
              </div>
              <div className="hero-note">
                <span className="avatar-stack" aria-hidden="true">
                  <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80" alt="" width={25} height={25} />
                  <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&h=64&q=80" alt="" width={25} height={25} />
                  <Image src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=64&h=64&q=80" alt="" width={25} height={25} />
                </span>
                A thoughtful community, from anywhere
              </div>
            </div>
            <div className="hero-visual" aria-label="Member profile preview">
              <div className="hero-orbit" />
              <div className="portrait-main">
                <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&h=1200&q=88" alt="A smiling person enjoying a sunny afternoon" fill priority sizes="(max-width: 700px) 68vw, 33vw" />
                <div className="portrait-caption"><strong>Amara, 29</strong><span><MapPin size={13} /><LocalizedText translationKey="memberLocation" /></span></div>
              </div>
              <div className="floating-note match-note"><span className="note-icon"><Heart size={16} fill="currentColor" /></span><span><strong><LocalizedText translationKey="compatibility" /></strong><small>Shared love of slow mornings</small></span></div>
              <div className="floating-note spark-note"><span className="note-icon"><Sparkles size={18} /></span><span><strong><LocalizedText translationKey="profileLabel" /></strong><small><LocalizedText translationKey="memberBio" /></small></span></div>
            </div>
          </div>
        </section>

        <section className="section how-section" id="how-it-works">
          <div className="section-inner">
            <p className="section-kicker">A little more intention</p>
            <h2 className="section-heading"><LocalizedText translationKey="members" /></h2>
            <p className="section-lead"><LocalizedText translationKey="membersBody" /></p>
            <div className="steps-grid">
              <article className="step"><span className="step-number">01</span><h3>Show up as yourself</h3><p>Build a profile with the things you care about, the places you love, and what you hope to find.</p></article>
              <article className="step"><span className="step-number">02</span><h3>Find a natural fit</h3><p>Search by what matters to you and discover people with something real in common.</p></article>
              <article className="step"><span className="step-number">03</span><h3>Start with a hello</h3><p>Send a thoughtful note, take your time, and let a good conversation find its own rhythm.</p></article>
            </div>
          </div>
        </section>

        <section className="section safety-section" id="safety">
          <div className="section-inner safety-row">
            <div><p className="section-kicker">Care comes first</p><h2 className="section-heading">Meet with more peace of mind.</h2><p className="section-lead">Your comfort matters at every step. Choose what you share and who can reach you.</p></div>
            <div className="safety-points">
              <div className="safety-point"><ShieldCheck size={19} /><div><strong>Privacy on your terms</strong><span>Control profile visibility and photo access.</span></div></div>
              <div className="safety-point"><UserRoundCheck size={19} /><div><strong>Tools that put you in control</strong><span>Block or report accounts from their profiles.</span></div></div>
              <div className="safety-point"><MessageCircle size={19} /><div><strong>Keep conversations simple</strong><span>Private text and emoji messaging, no file attachments.</span></div></div>
              <div className="safety-point"><Globe2 size={19} /><div><strong>A world of perspectives</strong><span>Find connections across borders and cultures.</span></div></div>
            </div>
          </div>
        </section>

        <section className="join-strip"><div className="join-strip-inner"><h2>Someone out there is glad you said hello.</h2><Link className="button button-rose" href="/sign-up">Create your free account <ArrowUpRight size={16} /></Link></div></section>
      </main>
      <footer className="site-footer"><Link href="/" className="wordmark"><span className="brand-mark"><Heart size={16} fill="currentColor" /></span><span>WeDating</span></Link><span>© {new Date().getFullYear()} WeDating · <LocalizedText translationKey="footerTagline" /></span><nav className="footer-links"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/community-guidelines">Community guidelines</Link></nav></footer>
    </>
  );
}