import Link from "next/link";
import {
  Instagram,
  Youtube,
  Search,
  Sparkles,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import type { Settings } from "@/types";
import { Media } from "@/components/media";
export function Brand({ settings }: { settings: Settings }) {
  return (
    <Link href="/" className="brand" aria-label={`${settings.site_name} 홈`}>
      {settings.logo_url ? (
        <span className="logo-image">
          <Media src={settings.logo_url} alt="" sizes="44px" />
        </span>
      ) : (
        <Sparkles className="brand-spark" size={25} />
      )}
      <span>
        <strong>{settings.site_name}</strong>
        <small>HOT ITEM LOG</small>
      </span>
    </Link>
  );
}
export function Header({ settings }: { settings: Settings }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand settings={settings} />
        <nav className="desktop-nav" aria-label="주 메뉴">
          <Link href="/videos">영상 속 핫템</Link>
          <Link href="/products">전체 추천템</Link>
        </nav>
        <div className="header-icons">
          <Link href="/search" aria-label="검색">
            <Search size={21} />
          </Link>
          {settings.instagram_url && (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={21} />
            </a>
          )}
          {settings.youtube_url && (
            <a
              href={settings.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <Youtube size={23} />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand settings={settings} />
            <p>{settings.site_description}</p>
          </div>
          <div className="footer-links">
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <ArrowUpRight size={14} />
            </a>
            <a
              href={settings.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube <ArrowUpRight size={14} />
            </a>
            <Link href="/contact">문의</Link>
          </div>
        </div>
        <p className="disclosure">{settings.affiliate_disclosure}</p>
        <div className="footer-bottom">
          <span>{settings.footer_text}</span>
          <div>
            <Link href="/privacy">개인정보처리방침</Link>
            <Link href="/terms">이용약관</Link>
          </div>
          <Heart size={15} />
        </div>
      </div>
    </footer>
  );
}
