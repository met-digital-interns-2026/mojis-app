import "./globals.css";

export const metadata = {
  title: "Moji Museum",
  description: "React to art with emojis at The Met",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
