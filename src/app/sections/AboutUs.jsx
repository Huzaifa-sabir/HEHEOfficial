import Button from "@components/ui/Button";
import Section from "@components/ui/Section";
import StatsBadge from "@components/ui/StatsBadge";
import Text from "@components/ui/Text";
import { CircleCheckBig, Flame, Heart, UserRound } from "lucide-react";

const AboutUs = () => {
  return (
    <Section className="px-2 sm:px-6 w-full md:-ml-8">
      <div className="grid grid-cols-1 lg:grid-cols-2  items-center">
        <div className="flex justify-center items-center">
        <div className="relative w-48 sm:w-56 md:w-72 h-80 sm:h-96 mx-auto mt-10  lg:mt-0 lg:mx-0 order-2 lg:order-1">
          {/* Album 3 - Bottom layer */}
          <div className="group absolute inset-0 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl transform -rotate-12 sm:-rotate-15 -translate-y-3 sm:-translate-y-5 hover:rotate-0 hover:-translate-y-6 sm:hover:-translate-y-8 hover:scale-105 hover:z-50 transition-all duration-300 cursor-pointer border border-white/10 backdrop-blur-sm z-10">
            <div className="absolute inset-0  rounded-2xl sm:rounded-3xl pointer-events-none"></div>
            <div className="relative z-10 h-full overflow-hidden rounded-2xl sm:rounded-3xl">
              <img
                src="/images/about-grid-3.webp"
                alt="Dental Equipment"
                className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
              />
            </div>
          </div>

          {/* Album 2 - Middle layer */}
          <div className="group absolute inset-0 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl transform rotate-3 sm:rotate-5 -translate-y-2 sm:-translate-y-3 hover:rotate-0 hover:-translate-y-6 sm:hover:-translate-y-8 hover:scale-105 hover:z-50 transition-all duration-300 cursor-pointer border border-white/10 backdrop-blur-sm z-20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-2xl sm:rounded-3xl pointer-events-none"></div>
            <div className="relative z-10 h-full overflow-hidden rounded-2xl sm:rounded-3xl">
              <img
                src="/images/about-grid-2.webp"
                alt="Dental Office"
                className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
              />
            </div>
          </div>

          {/* Album 1 - Top layer */}
          <div className="group absolute inset-0 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl transform rotate-15 sm:rotate-20 hover:rotate-0 hover:-translate-y-6 sm:hover:-translate-y-8 hover:scale-105 hover:z-50 transition-all duration-300 cursor-pointer border border-white/10 backdrop-blur-sm z-30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-2xl sm:rounded-3xl pointer-events-none"></div>
            <div className="relative z-10 h-full overflow-hidden rounded-2xl sm:rounded-3xl">
              <img
                src="/images/about-grid-1.webp"
                alt="Happy Patient"
                className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
              />
            </div>
          </div>
        </div></div>

        <div className="order-1 lg:order-2 text-center lg:text-left ">
          <Text
            weight="bold"
            size="3xl"
            align="left"
            color="gradientSleek" gradient={true}
            className="mb-4 sm:mb-6 text-center lg:text-left"
          >
            About Us
          </Text>

          <div className="flex flex-wrap justify-start font-bold gap-2 sm:gap-4 mb-6 sm:mb-8">
            <StatsBadge label="FAVOURITES">
              <Heart size={17} color="#8abcb9" />
            </StatsBadge>
            <StatsBadge label="NEW IN">
              <Flame size={17} color="#8abcb9" />
            </StatsBadge>
            <StatsBadge label="TRENDING">
              <CircleCheckBig size={17} color="#8abcb9"/>
            </StatsBadge>
            <StatsBadge label="FOLLOWING">
              <UserRound size={17} color="#8abcb9"/>
            </StatsBadge>
          </div>

          <div className="space-y-4 sm:space-y-6 text-gray-300 leading-relaxed">
            <Text size="sm" align="justify">
              A high-resolution, cinematic-style approach to modern dental care.
              Our clinic combines state-of-the-art technology with personalized
              treatment plans to ensure every patient receives the highest
              quality care.
            </Text>

            <Text size="sm" align="justify">
              With over 15 years of experience, our team of expert dental
              surgeons specializes in cosmetic dentistry, orthodontics, and
              advanced surgical procedures. We pride ourselves on creating
              beautiful, healthy smiles that last a lifetime.
            </Text>

            <Text size="sm" align="justify">
              Our modern facility features the latest in dental technology, from
              3D imaging to laser treatments, ensuring comfortable and efficient
              procedures for all our patients.
            </Text>
          </div>

          <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
            <a href="/#contact">
            <Button variant="primary" size="lg" className="w-fit sm:w-auto">
              Learn More About Us
            </Button></a>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default AboutUs;
