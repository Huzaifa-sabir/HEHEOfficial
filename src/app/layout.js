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
      <head>
        <link rel="icon" href="/images/favicon-96x96.png" type="image/png" />
        <link rel="shortcut icon" href="/images/favicon-96x96.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/favicon-96x96.png" />
      </head>
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
