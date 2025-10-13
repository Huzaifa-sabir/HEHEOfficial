import Hero from "./sections/Hero";
import AboutUs from "./sections/AboutUs";
import BeforeAfter from "./sections/BeforeAfter";
import Reviews from "./sections/Reviews";
import FAQs from "./sections/FAQs";
import PaymentPlans from "./sections/PaymentPlans";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen max-w-[100rem] mx-auto bg-[#0D0D0D] font-sans">
      <Hero />
      <div id="about">
        <AboutUs />
      </div>
      <BeforeAfter />
      <div id="reviews">
        <Reviews />
      </div>
      <div id="plans">
        <PaymentPlans />
      </div>
      <div id="faq">
        <FAQs />
      </div>
      <div id="contact">
        <Contact />
      </div>
      <Footer />
    </div>
  );
}
