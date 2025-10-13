'use client'
import Section from "@components/ui/Section";
import Text from "@components/ui/Text";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const FAQs = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    { q: 'What are modern teeth aligners?', a: 'Modern teeth aligners are clear, removable trays designed to gradually straighten teeth without the need for metal braces.' },
    { q: 'How long does aligner treatment take?', a: 'Treatment time varies depending on the case, but most people complete it in 6–18 months.' },
    { q: 'Are teeth aligners painful?', a: 'You may feel mild pressure for the first few days after switching to a new set of aligners, but it’s generally much more comfortable than braces.' },
    { q: 'How often should I wear my aligners?', a: 'You should wear your aligners for 20–22 hours a day, removing them only for eating, drinking (except water), brushing, and flossing.' },
    { q: 'Can I eat with my aligners on?', a: 'No. You should remove your aligners before eating or drinking anything other than water to avoid staining or damaging them.' },
    { q: 'Will aligners affect my speech?', a: 'You may experience a slight lisp at first, but most people adapt within a few days.' },
    { q: 'How do I clean my aligners?', a: 'Rinse them with lukewarm water and brush gently with a soft toothbrush. Avoid using hot water, as it can warp the material.' },
    { q: 'Are aligners suitable for everyone?', a: 'Aligners can treat many cases of crowding, gaps, and mild bite issues, but complex cases may still require traditional orthodontics.' }
  ];

  return (
    <Section>
      <div className="text-center mb-12">
        <Text weight="bold" size="3xl" align="center"  color="gradientSleek" gradient={true}  className="mb-6">FREQUENTLY ASKED QUESTIONS</Text>
        <Text color="secondary" size="sm" className="text-gray-400 max-w-4xl mx-auto leading-relaxed" align="center" >
          Find answers to the most common questions about modern teeth aligners.
        </Text>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="text-white font-medium">{faq.q}</span>
              {openFAQ === index ? 
                <ChevronUp className="text-[#8abcb9]" size={20} /> : 
                <ChevronDown className="text-gray-400" size={20} />
              }
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${
              openFAQ === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-8 pb-6">
                <p className="text-gray-300 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default FAQs;
