'use client'
import Head from 'next/head';

const page = () => {
  return (
    <>
      <Head>
        <title>Cookie Policy - Hehe Aligners</title>
        <meta name="description" content="Cookie Policy for Hehe Aligners" />
      </Head>
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-black p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-6 typewriter">Cookie Policy</h1>
          <div className="space-y-4 text-gray-100 typewriter">
            <p>Last updated: August 14, 2025</p>
            <p>
              Hehe Aligners uses cookies to enhance your experience on our website. This Cookie Policy explains what cookies are, how we use them, and how you can manage them.
            </p>
            <h2 className="text-2xl font-semibold mt-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and understand how our website is used.
            </p>
            <h2 className="text-2xl font-semibold mt-4">2. Types of Cookies We Use</h2>
            <div>
              <ul className="list-disc ml-6">
                <li><strong>Essential Cookies:</strong> Necessary for the website to function, such as processing online payments and managing your shopping cart.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website, such as which pages are visited most often.</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver personalized advertisements based on your browsing behavior.</li>
              </ul>
            </div>
            <h2 className="text-2xl font-semibold mt-4">3. How We Use Cookies</h2>
            <div>
              We use cookies to:
              <ul className="list-disc ml-6">
                <li>Facilitate secure online transactions for purchasing clear teeth aligners.</li>
                <li>Analyze website performance and user behavior to improve our services.</li>
                <li>Provide tailored content and advertisements.</li>
              </ul>
            </div>
            <h2 className="text-2xl font-semibold mt-4">4. Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. You may choose to block or delete cookies, but this may affect the functionality of our website, such as the ability to process orders.
            </p>
            <h2 className="text-2xl font-semibold mt-4">5. Third-Party Cookies</h2>
            <p>
              We may use third-party services (e.g., analytics or payment processors) that set their own cookies. These are subject to the third parties, respective cookie policies.
            </p>
            <h2 className="text-2xl font-semibold mt-4">6. Contact Us</h2>
            <p>
              For questions about our Cookie Policy, contact us at info@hehe-aligners.com.
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