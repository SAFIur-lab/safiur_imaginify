import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
// import { Variable } from "lucide-react";

const IbmPlex = IBM_Plex_Sans({
   subsets: ["latin"],
   weight: ['400', '500', '600', '700'], 
   variable: "--font-imb-plex"

});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Imaginify",
  description: "AI- powered image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
       variables: {colorPrimary: '#624cf5'}
    }
     
    }>
    <html lang="en">
      <body
        className={cn("font-ibm-plex antialiased", IbmPlex.variable)}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
