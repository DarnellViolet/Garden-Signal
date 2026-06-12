import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garden Signal",
  description: "A botanical sensor garden mini app on Base."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="6a2bc59b0cfd412b2ab2c318" />
        <meta
          name="talentapp:project_verification"
          content="c0e615235eb0aaf73859044615f3f2c66f19e8388f380e34858739a6c12307c2362c38bcac096cf0f8b3ce6be8d2fbfd9d3b6a8b00768067b8af6af6fca8e2c5"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
