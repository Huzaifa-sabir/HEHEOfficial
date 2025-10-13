import Button from "@components/ui/Button";
import Text from "@components/ui/Text";
import { Instagram, Linkedin, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/[0.025] border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-48 items-start">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-6">
              <Image
                height={50}
                width={50}
                src="/images/navbar-logo.png"
                alt="navbar logo"
              />
            </div>
            <Text
              size="sm"
              className="text-gray-400 mx-auto mb-12 leading-relaxed max-w-sm"
              align="left"
            >
                Align Your Smile, Align Your Life. Transform your <br />confidence
                with our invisible teeth aligners.
            </Text>

            <div className="mt-8">
              <h5 className="text-white font-medium mb-4">Quick Links</h5>
              <div className="space-y-2">
                <a
                  href="#about"
                  className="block text-gray-400 text-sm hover:text-[#8abcb9] transition-colors"
                >
                  About Us
                </a>
                <a
                  href="#contact"
                  className="block text-gray-400 text-sm hover:text-[#8abcb9] transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#reviews"
                  className="block text-gray-400 text-sm hover:text-[#8abcb9] transition-colors"
                >
                  Reviews
                </a>
                <a
                  href="#faq"
                  className="block text-gray-400 text-sm hover:text-[#8abcb9] transition-colors"
                >
                  FAQs
                </a>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">
              Contact Info
            </h4>
            <div className="space-y-4">
              <a href="tel:+14722631223" className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#8abcb9]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={16} className="text-[#8abcb9]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">Phone</p>
                  <p className="text-gray-400 text-sm">+1 472-263-1223</p>
                </div>
              </a>

              <a
                href="mailto:info@hehe-aligners.com"
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 bg-[#8abcb9]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={16} className="text-[#8abcb9]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">
                    General Inquiries
                  </p>
                  <p className="text-gray-400 text-sm">
                    Info@hehe-aligners.com
                  </p>
                </div>
              </a>

              <a
                href="mailto:finance@hehe-aligners.com"
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 bg-[#8abcb9]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={16} className="text-[#8abcb9]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">Finance</p>
                  <p className="text-gray-400 text-sm">
                    Finance@hehe-aligners.com
                  </p>
                </div>
              </a>
            </div>

            <div className="flex mt-14 gap-3">
              <a href="https://www.instagram.com/hehe.aligners" target="_blank">
                <Button variant="ghost" size="sm" className="rounded-lg bg-[#8abcb9]/10">
                  <Instagram size={18} color="#8abcb9" />
                </Button>
              </a>
              <a
                href="https://www.linkedin.com/company/hehe-aligners/"
                target="_blank"
              >
                <Button variant="ghost" size="sm" className="rounded-lg bg-[#8abcb9]/10">
                  <Linkedin size={18} color="#8abcb9" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-neutral-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} HEHE Aligners. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link
                href="/privacypolicy"
                className="hover:text-white transition-colors hover:underline"
              >
                Privacy Policy
              </Link>
              <span className="text-white/20">•</span>
              <Link
                href="/termsofservice"
                className="hover:text-white transition-colors hover:underline"
              >
                Terms of Service
              </Link>
              <span className="text-white/20">•</span>
              <Link
                href="/cookiepolicy"
                className="hover:text-white transition-colors hover:underline"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
