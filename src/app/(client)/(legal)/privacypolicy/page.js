'use client'
import Head from 'next/head';

const page = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Hehe Aligners</title>
        <meta name="description" content="Privacy Policy for Hehe Aligners" />
      </Head>
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-black p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-6 typewriter">Privacy Policy</h1>
          <div className="space-y-4 text-gray-100 typewriter">
            <p>Last updated: August 14, 2025</p>
            <p>
              At Hehe Aligners, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website to purchase clear teeth aligners. As an online-only business with no physical office, we process all transactions and interactions through our website.
            </p>
            <h2 className="text-2xl font-semibold mt-4">1. Information We Collect</h2>
            <div>
              We collect the following types of information:
              <ul className="list-disc ml-6">
                <li><strong>Personal Information:</strong> Name, email address, billing information, and shipping address provided during the purchase process.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our website, such as IP address, browser type, and pages visited.</li>
                <li><strong>Cookies:</strong> See our Cookie Policy for details on how we use cookies to enhance your experience.</li>
              </ul>
            </div>
            <h2 className="text-2xl font-semibold mt-4">2. How We Use Your Information</h2>
            <div>
              We use your information to:
              <ul className="list-disc ml-6">
                <li>Process and fulfill your orders for clear teeth aligners.</li>
                <li>Communicate with you about your order, including shipping updates and customer support.</li>
                <li>Improve our website and services based on usage data.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </div>
            <h2 className="text-2xl font-semibold mt-4">3. Sharing Your Information</h2>
            <div>
              We do not sell your personal information. We may share your information with:
              <ul className="list-disc ml-6">
                <li>Payment processors to handle online transactions securely.</li>
                <li>Shipping partners to deliver your aligners.</li>
                <li>Legal authorities, if required by law.</li>
              </ul>
            </div>
            <h2 className="text-2xl font-semibold mt-4">4. Data Security</h2>
            <p>
              We use industry-standard encryption and security measures to protect your data during online transactions. However, no method of transmission over the internet is 100% secure.
            </p>
            <h2 className="text-2xl font-semibold mt-4">5. Your Rights</h2>
            <div>
              You may:
              <ul className="list-disc ml-6">
                <li>Request access to your personal information.</li>
                <li>Request correction or deletion of your data.</li>
                <li>Opt out of marketing communications.</li>
              </ul>
              To exercise these rights, contact us at info@hehe-aligners.com.
            </div>
            <h2 className="text-2xl font-semibold mt-4">6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
            </p>
            <h2 className="text-2xl font-semibold mt-4">7. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, contact us at info@hehe-aligners.com.
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .typewriter {
          font-family: 'Courier New', Courier, monospace;
          animation: typing 0.5s steps(40, end);
        }
        @keyframes typing {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default page;