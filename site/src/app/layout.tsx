import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/theme-toggle";
import MobileNav from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: "BestInSeattle",
  description:
    "Premium guide to Seattle + PNW events, restaurants, and things to do.",
};

const nav = [
  { href: "/events", label: "Events" },
  { href: "/near-me", label: "Near Me" },
  { href: "/best-of", label: "Eat" },
  { href: "/zones", label: "Zones" },
  { href: "/tonight", label: "Tonight" },
  { href: "/plans", label: "Plans" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="anonymous" />
        <meta name="impact-site-verification" content="285eac6f-8d74-49eb-8c16-443fcc23e373" />
      </head>
      <body>
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-[15px] font-bold tracking-tighter">
              best<span className="text-accent">Seattle</span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-muted transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <MobileNav links={nav} />
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-border pb-16 md:pb-0">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-muted md:grid-cols-3">
            <div>
              <p className="font-semibold text-foreground">BestInSeattle</p>
              <p className="mt-2">Premium local curation for Seattle + PNW.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Explore</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/zones">Zones</Link></li>
                <li><Link href="/best-of">Best Of</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">Newsletter</p>
              <p className="mt-2">Weekly, curated, no fluff.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
