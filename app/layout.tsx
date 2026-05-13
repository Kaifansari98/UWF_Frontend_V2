import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import InitAuth from "./initAuth";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "United Welfare Foundation - Portal",
  description: "Student aid form system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <InitAuth /> {/* ✅ Rehydrate auth on every page load */}
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
