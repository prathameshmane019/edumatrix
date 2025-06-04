import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./Providers"; 
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EduMatrix ERP Systems",
  description: "Developed by UnityTech Solutions",
  "google-site-verification": "l-CJbpjrlOdD6U4iPILiHGFWafJ8XASM46ACf704nj8",
  icons:{
    icon:"/icon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <meta name="google-site-verification" content="l-CJbpjrlOdD6U4iPILiHGFWafJ8XASM46ACf704nj8" /> */}
      <body className={inter.className}>
      <AuthProvider> 
        {children}</AuthProvider></body>
    </html>
  );
}
