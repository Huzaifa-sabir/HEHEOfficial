import Navbar from "@components/layout/Navbar";
import "./globals.css";
import { ReduxProvider } from "providers/ReduxProvider";
import { PayPalProvider } from "providers/PayPalProvider";

export const metadata = {
  title: "Hehe Aligners - Smile with Confidence",
  description: "Professional invisible aligners for a perfect smile. Transform your teeth with our custom-made aligners.",
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
