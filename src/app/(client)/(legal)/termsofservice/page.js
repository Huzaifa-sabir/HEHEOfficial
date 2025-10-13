'use client';
import Head from 'next/head';

const page = () => {
  return (
    <>
      <Head>
        <title>Terms of Service - Hehe Aligners</title>
        <meta name="description" content="Terms of Service for Hehe Aligners" />
      </Head>
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-black p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-6 typewriter">Terms of Service</h1>
          <div className="space-y-4 text-gray-100 typewriter">
            <p>Last updated: August 14, 2025</p>
            <p>
              Welcome to Hehe Aligners. These Terms of Service govern your use of our website and the purchase of clear teeth aligners. By accessing our website or placing an order, you agree to these terms.
            </p>
            <h2 className="text-2xl font-semibold mt-4">1. Online Purchases</h2>
            <p>
              Hehe Aligners operates exclusively online with no physical office. All orders are placed and processed through our website, and payments are accepted only via online payment methods.
            </p>
            <h2 className="text-2xl font-semibold mt-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to purchase our products. By placing an order, you confirm that you meet this requirement.
            </p>
            <h2 className="text-2xl font-semibold mt-4">3. Order Process</h2>
            <div>
              <ul className="list-disc ml-6">
                <li>Orders are subject to availability and acceptance by Hehe Aligners.</li>
                <li>We reserve the right to refuse or cancel orders at our discretion.</li>
                <li>All prices are listed on our website and are subject to change without notice.</li>
              </ul>
            </div>
            <h2 className="text-2xl font-semibold mt-4">4. Payments</h2>
            <p>
              Payments are processed securely through our third-party payment processors. You agree to provide accurate billing information and authorize us to charge the provided payment method.
            </p>
            <h2 className="text-2xl font-semibold mt-4">5. Shipping and Delivery</h2>
            <p>
              We ship aligners to the address provided during checkout. Shipping times and costs vary based on location and are detailed at checkout.
            </p>
            <h2 className="text-2xl font-semibold mt-4">6. Returns and Refunds</h2>
            <p>
              Returns and refunds are subject to our return policy, available on our website. Contact info@hehe-aligners.com for assistance.
            </p>
            <h2 className="text-2xl font-semibold mt-4">7. Limitation of Liability</h2>
            <p>
              Hehe Aligners is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website.
            </p>
            
            <h2 className="text-2xl font-semibold mt-4">8. Contact Us</h2>
            <p>
              For questions about these Terms of Service, contact us at info@hehe-aligners.com.
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