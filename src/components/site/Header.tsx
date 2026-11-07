import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Logo } from "./Logo";
import { AuthNav } from "./AuthNav";
import { SiteSearch } from "./SiteSearch";
import { ThemeToggle } from "./ThemeToggle";
import { CountrySwitcher } from "./CountrySwitcher";
import { HeaderNav } from "./HeaderNav";
import { switchCountries } from "./countries";
import type { Locale } from "@/lib/i18n/locales";
import { CDICTS } from "@/lib/i18n/cdict/all";

/** `loc`: the page's language version (the home link goes to that version's home). */
export function Header({ loc }: { loc: Locale }) {
  return (
    <header className="site-header">
      <div className="masthead">
        <div className="masthead-top">
          <HomeMark loc={loc} />
          <div className="masthead-tools">
            <AuthNav />
            <SiteSearch />
            <ThemeToggle />
          </div>
        </div>
        <div className="masthead-rail">
          <HeaderNav variant="main" />
          <div className="masthead-country"><CountrySwitcher countries={switchCountries()} /></div>
        </div>
      </div>
    </header>
  );
}

function HomeMark({ loc }: { loc: Locale }) {
  return (
    <Link href={loc.native ? `/${loc.id}` : "/"} className="brand-home" aria-label={CDICTS[loc.lang].chrome.nav.home}>
      <Logo compact />
    </Link>
  );
}
