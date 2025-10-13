"use client";

import Button from "@components/ui/Button";
import Section from "@components/ui/Section";
import Text from "@components/ui/Text";
import { Card, CardContent, CardHeader, CardTitle, CardImage } from "@components/ui/Cards.jsx";
import { ArrowRight, ArrowRightIcon } from "lucide-react";

const BeforeAfter = () => {
  const cases = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    beforeImage: `/images/before-after/before-${index + 1}.webp`,
    afterImage: `/images/before-after/after-${index + 1}.webp`,
    treatment: "Teeth Alignment",
  }));

  const duplicatedCases = [...cases, ...cases];

  return (
    <Section
      padding="tight"
      maxWidth="7xl"
      backgroundColor="bg-gray-950"
      className="relative"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8abcb9]/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8abcb9]/30 to-transparent"></div>
      {/* Header Section with animated gradient underline */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-block relative">
          <Text
            as="h2"
            weight="bold"
            size="3xl"
            align="center"
            className="mb-1"
            color="gradientSleek" gradient={true} 
          >
            Teeth Alignment Results
          </Text>
          <div className="h-1 w-1/2 bg-[#8abcb9] mx-auto rounded-full animate-pulse"></div>
        </div>
        <Text
          color="secondary"
          size="sm"
          className="max-w-xl px-4 mx-auto mt-6"
          align="center"
        >
          Witness the remarkable transformation of our patients' smiles through
          advanced teeth alignment technology.
        </Text>
      </div>
      {/* MOBILE / SMALL SCREEN — Interactive Cards with Fade-in */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
        {cases.map((caseItem) => (
          <Card
            key={caseItem.id}
            variant="elevated"
            size="xs"
            className="max-w-xs mx-auto transform transition-all duration-500 hover:scale-105"
            hover
          >
            <CardContent spacing="normal">
              <div className="space-y-4">
                {/* Before Image Card */}
                <div className="relative group">
                  <CardImage
                    src={caseItem.beforeImage}
                    alt={`Before teeth alignment case ${caseItem.id}`}
                    aspectRatio="video"
                    className="rounded-lg transition-all duration-500 group-hover:brightness-110"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-white/95 text-black px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      Before
                    </span>
                  </div>
                </div>
                {/* After Image Card */}
                <div className="relative group">
                  <CardImage
                    src={caseItem.afterImage}
                    alt={`After teeth alignment case ${caseItem.id}`}
                    aspectRatio="video"
                    className="rounded-lg transition-all duration-500 group-hover:brightness-110"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-[#8abcb9] text-black px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      After
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* DESKTOP / TABLET — Enhanced Scrolling Cards with Hover Effect */}
      <div className="overflow-hidden relative hidden md:block py-3">
        <div className="flex gap-6 animate-scroll">
          {duplicatedCases.map((caseItem, index) => (
            <Card
              key={`${caseItem.id}-${index}`}
              variant="elevated"
              size="xs"
              className="flex-shrink-0 max-w-[18rem] w-80 xl:w-96 transition-all duration-300 hover:shadow-xl hover:shadow-[#8abcb9]/20"
              hover
            >
              <CardContent spacing="tight">
                <div className="space-y-4">
                  {/* Before Image with hover effect */}
                  <div className="relative group overflow-hidden rounded-xl">
                    <CardImage
                      src={caseItem.beforeImage}
                      alt={`Before teeth alignment case ${caseItem.id}`}
                      aspectRatio="video"
                      className="rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/95 text-black px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                        Before
                      </span>
                    </div>
                  </div>
                  {/* After Image with hover effect */}
                  <div className="relative group overflow-hidden rounded-xl">
                    <CardImage
                      src={caseItem.afterImage}
                      alt={`After teeth alignment case ${caseItem.id}`}
                      aspectRatio="video"
                      className="rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-[#8abcb9] text-black px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                        After
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Gradient overlays for smoother scroll appearance */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10"></div>
      </div>
      {/* CTA Section with animated button */}
      <div className="text-center mt-16">
        <a href="/#plans">
        <Button
          variant="primary"
          size="lg"
          className="mx-auto relative overflow-hidden group"
          icon={
            <ArrowRightIcon
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          }
          iconPosition="right"
        >
          Start Your Alignment Journey
        </Button></a>
      </div>
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </Section>
  )
};

export default BeforeAfter;