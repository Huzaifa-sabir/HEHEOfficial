import Navbar from "@components/layout/Navbar";
import "./globals.css";
import { ReduxProvider } from "providers/ReduxProvider";
import { PayPalProvider } from "providers/PayPalProvider";

export const metadata = {
  title: "Hehe Aligners - Smile with Confidence",
  description: "Professional invisible aligners for a perfect smile. Transform your teeth with our custom-made aligners.",
  icons: {
    icon: "/images/favicon-96x96.png?v=1",
    shortcut: "/images/favicon-96x96.png?v=1",
    apple: "/images/favicon-96x96.png?v=1",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950">
        <ReduxProvider>
          <PayPalProvider>
            <Navbar />
            {children}
          </PayPalProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
