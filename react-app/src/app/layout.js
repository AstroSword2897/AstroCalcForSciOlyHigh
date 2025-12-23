import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MathProvider from "../components/MathProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AstroCalc React",
  description: "AstroCalc for SciOly rewritten with Next.js and npm packages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} body`}>
        <MathProvider>{children}</MathProvider>
      </body>
    </html>
  );
}
