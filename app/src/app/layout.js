import "./globals.css";
import { getLocale, useTranslations } from "./lib/i18n";

export function generateMetadata() {
  const t = useTranslations("metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang={getLocale()} className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
