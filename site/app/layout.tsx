import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Artificially Informed",
  description: "A daily brief on what's worth knowing in AI — for Applicative AI, workshops, learning, and India's AI ecosystem.",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={newsreader.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <Nav />
        <main className="container" style={{ padding: "32px 20px 80px" }}>
          {children}
        </main>
        <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 20px", textAlign: "center" }}>
          <p className="meta" style={{ margin: 0 }}>
            Artificially Informed — curated by Manasi Kabra
          </p>
        </footer>
      </body>
    </html>
  );
}
