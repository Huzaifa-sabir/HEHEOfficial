// components/Contact.js
'use client'
import React, { useState, useEffect } from 'react';
import Text from "@components/ui/Text";
import { useAuth } from '@hooks/useAuth'; // Adjust import path as needed

const { default: Button } = require("@components/ui/Button");
const { default: Input } = require("@components/ui/Input");
const { default: Section } = require("@components/ui/Section");
const { default: StatsBadge } = require("@components/ui/StatsBadge");
const { default: Textarea } = require("@components/ui/Textarea");
const { Mail, ArrowRight, Phone, Send, MapPin, CheckCircle } = require("lucide-react");

const Contact = () => {
  const { getProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Auto-fill form if user is logged in
  useEffect(() => {
    const fillUserData = async () => {
      try {
        const profile = await getProfile();
        if (profile.payload?.email) {
          setFormData(prev => ({
            ...prev,
            name: profile.payload.fullName || profile.payload.name || '',
            email: profile.payload.email || ''
          }));
        }
      } catch (error) {
        console.log('No user profile found');
      }
    };

    fillUserData();
  }, [getProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData(prev => ({ 
          ...prev, 
          phone: '', 
          message: '' 
        })); // Keep name and email if user is logged in
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" className="relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-[18rem] font-bold text-gray-800/10 select-none">CONTACT</h2>
      </div>

      <div className="relative z-10">
        <div className="flex justify-center mb-8">
          <StatsBadge label="ALWAYS OPEN CONTACT" />
        </div>

        <Text weight="bold" size="3xl" align="center" className="mb-6"  color="gradientSleek" gradient={true} >GET IN TOUCH</Text>
        <Text color="secondary" size="sm" className="text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed" align="center">
          Ready to transform your smile? Contact us today to schedule your consultation 
          and begin your journey to perfect dental health.
        </Text>

        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-[#8abcb9]/20 rounded-full flex items-center justify-center">
                <Mail className="text-[#8abcb9]" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Email</h3>
                <p className="text-gray-400">info@hehe-aligners.com</p>
              </div>
              <a href="mailto:info@hehe-aligners.com" className="ml-auto">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  <ArrowRight size={16} />
                </Button>
              </a>
            </div> 
                       
            <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-[#8abcb9]/20 rounded-full flex items-center justify-center">
                <Mail className="text-[#8abcb9]" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Alt Email</h3>
                <p className="text-gray-400">finance@hehe-aligners.com</p>
              </div>
              <a href="mailto:finance@hehe-aligners.com" className="ml-auto cursor-pointer">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  <ArrowRight size={16} />
                </Button>
              </a>
            </div> 

            <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-[#8abcb9]/20 rounded-full flex items-center justify-center">
                <Phone className="text-[#8abcb9]" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Call us</h3>
                <p className="text-gray-400">+1 978-570-8428</p>
              </div>
              <a href="tel:+19785708428" className="ml-auto">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  <ArrowRight size={16} />
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Name" 
                name="name"
                placeholder="Your full name" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input 
                label="Email" 
                name="email"
                type="email" 
                placeholder="your@email.com" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input 
                label="Phone" 
                name="phone"
                type="tel" 
                placeholder="Your phone number" 
                value={formData.phone}
                onChange={handleInputChange}
              />
              <Textarea 
                label="Message" 
                name="message"
                placeholder="Tell us about your dental needs..." 
                rows={6} 
                value={formData.message}
                onChange={handleInputChange}
                required
              />
              
              {submitStatus === 'success' && (
                <div className="flex items-center gap-2 text-[#8abcb9] text-sm">
                  <CheckCircle size={16} />
                  Thank you! Your message has been sent successfully.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="text-red-400 text-sm">
                  Something went wrong. Please try again or contact us directly.
                </div>
              )}

              <Button 
                type="submit"
                variant="primary" 
                size="lg" 
                className="w-fit" 
                icon={<Send size={20} />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Contact;