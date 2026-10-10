import "./styles/app.css";
import "./styles/light.css";
import "./styles/next.css";
import "./styles/brand.css";
import "./styles/admin.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Archai — Projects", template: "%s — Archai" },
  description: "Archai Integrated Systems — engineered software, embedded, and mobile projects.",
  icons: { icon: "/icon.svg" },
};

export const viewport = {
  themeColor: "#08060d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.theme||'dark'}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
