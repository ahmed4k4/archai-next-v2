import "./styles/globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://archai-next-v2.vercel.app"),
  title: { default: "Archai Integrated Systems | Software, AI & Digital Product Engineering", template: "%s | Archai Integrated Systems" },
  description: "Archai Integrated Systems designs and builds digital products, web platforms, AI-powered workflows, and embedded/IoT systems.",
  applicationName: "Archai Integrated Systems",
  category: "technology",
  keywords: ["Archai Integrated Systems", "Archai Solutions", "software development company", "web development", "AI integration", "digital product engineering", "embedded systems", "IoT solutions", "تطوير البرمجيات", "تصميم وتطوير المواقع", "حلول الذكاء الاصطناعي", "الأنظمة المدمجة", "إنترنت الأشياء"],
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: "Archai Integrated Systems", title: "Archai Integrated Systems | Software, AI & Digital Product Engineering", description: "Digital products, web platforms, AI integrations, embedded systems, and IoT solutions.", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Archai Integrated Systems" }] },
  twitter: { card: "summary_large_image", title: "Archai Integrated Systems | Software, AI & Digital Product Engineering", description: "Digital products, web platforms, AI integrations, embedded systems, and IoT solutions.", images: ["/opengraph-image"] },
};

export const viewport = {
  themeColor: "#071015",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.theme||'dark';var en=location.pathname.startsWith('/en');document.documentElement.lang=en?'en':'ar';document.documentElement.dir=en?'ltr':'rtl'}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
