import type { Metadata } from "next";
import Link from "next/link";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "BestInSeattle",
  description:
    "Premium guide to Seattle + PNW events, restaurants, and things to do.",
};

const nav = [
  { href: "/events", label: "Events" },
  { href: "/eat", label: "Going Out" },
  { href: "/near-me", label: "Near Me" },
  { href: "/zones", label: "Zones" },
  { href: "/tonight", label: "Tonight" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
        <meta name="impact-site-verification" content="285eac6f-8d74-49eb-8c16-443fcc23e373" />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-white/20 selection:text-white">
        <header className="pointer-events-none fixed left-0 right-0 top-4 z-50 flex justify-center px-4 animate-fade-up">
          <div className="app-shell pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-3">
            <Link href="/" className="flex items-center gap-2 pl-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_8px_24px_rgba(255,255,255,0.14)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">bestseattle</span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-white/6 bg-white/[0.03] p-1 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-white/50 transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/events" className="button-secondary flex h-10 w-10 items-center justify-center rounded-full">
                <svg className="h-4 w-4 text-white/75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </Link>
              <Link href="/newsletter" className="button-primary flex h-10 w-10 items-center justify-center rounded-full">
                <svg className="h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow pt-32">
          {children}
        </main>

        <section className="relative mt-16 overflow-hidden rounded-t-[3rem] border-t border-white/10 bg-[#050608] py-24 sm:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_34%)]" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-full max-w-3xl -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="mb-6 text-5xl font-bold tracking-tighter text-white sm:text-7xl">
              THE WEEKEND.<br />
              <span className="text-white/35">CURATED.</span>
            </h2>
            <p className="mx-auto mb-10 mt-4 max-w-2xl text-xl font-medium tracking-tight text-white/60">
              Join 50,000+ locals. One email every Thursday. Zero spam.
            </p>
            <form className="mx-auto flex max-w-lg flex-col justify-center gap-3 sm:flex-row">
              <input
                type="email"
                required
                className="w-full rounded-full border border-white/10 bg-white/[0.06] px-6 py-4 text-lg text-white outline-none backdrop-blur-md transition-all placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.1]"
                placeholder="name@example.com"
              />
              <button
                type="submit"
                className="button-primary flex shrink-0 items-center justify-center rounded-full px-8 py-4 text-lg font-bold"
              >
                Subscribe
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          </div>
        </section>

        <MobileBottomNav />

        <footer className="bg-[#050608] pb-24 pt-8 text-white/50 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-white/75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <span className="text-xl font-bold tracking-tight text-white">bestseattle</span>
              </div>
              <div className="flex gap-6 text-sm font-medium">
                <Link href="/about" className="transition-colors hover:text-white">About</Link>
                <Link href="/sponsored" className="transition-colors hover:text-white">Partner</Link>
                <Link href="/newsletter" className="transition-colors hover:text-white">Newsletter</Link>
              </div>
              <p className="text-sm">
                &copy; {new Date().getFullYear()} BestSeattle. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
