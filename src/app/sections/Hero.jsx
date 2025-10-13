import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-[#0a0a0a]">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#8abcb9]/10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#8abcb9]/5 blur-3xl"></div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-0 items-center overflow-hidden min-h-[500px] sm:min-h-[600px] lg:h-[600px]">
          {/* Content */}
          <div className="space-y-8 flex flex-col justify-center h-full col-span-1 md:col-span-4 px-6 sm:px-10 lg:px-6 py-16 lg:py-0 relative z-10">
            <div className="space-y-6 flex flex-col justify-center lg:ml-6 items-center h-full w-full text-center lg:text-left lg:items-start lg:pl-8 xl:pl-12">
              <div className="flex items-center justify-center lg:justify-start">
                <span className="px-4 py-1.5 bg-[#8abcb9]/10 text-[#8abcb9] text-xs font-medium tracking-wider rounded-full border border-[#8abcb9]/20">
                  PREMIUM DENTAL SOLUTIONS
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-[#8abcb9]">HEHE ALIGNERS</span>
              </h1>
              <p className="text-white/85 font-medium max-w-lg leading-relaxed text-lg sm:text-xl px-4 sm:px-0 lg:px-0">
                Align Your Smile, Align Your Life. Transform your confidence
                with our invisible teeth aligners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href='/#plans'  className="bg-[#8abcb9] hover:bg-[#7dadaa] text-[#0a0a0a] font-medium py-3 px-8 rounded-md transition-all flex items-center justify-center gap-2 group">
                  Get Started
                  <ArrowRightIcon
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
                <a href='/#contact' className="border border-white/10 bg-white/5 hover:border-white/40 backdrop-blur-sm text-white font-medium py-3 px-8 rounded-md transition-all">
                  Learn More
                </a>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {["/images/avatars/avatar-1.webp", "/images/avatars/avatar-2.webp" , "/images/avatars/avatar-3.webp" ].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gray-300 border-2 border-[#0a0a0a] overflow-hidden"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-300">
                        <img src={i} alt="A person" />
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-white/70">
                  <span className="font-semibold text-white">2,000+</span> happy
                  customers
                </span>
              </div>
            </div>
          </div>
          {/* Image */}
          <div className="w-full h-full col-span-1 md:col-span-3 min-h-[350px] sm:min-h-[400px] lg:min-h-full relative">
            {/* Image container */}
            <div className="relative h-full flex justify-center items-end lg:items-center">
              {/* Decorative circle behind image */}
              <div className="absolute w-[650px] h-[650px] lg:w-[750px] lg:h-[750px] hidden md:visible rounded-full bg-gradient-to-br from-neutral-800/25 to-neutral-800/10 border-l border-white/10 shadow shadow-white/20"></div>
              {/* Image */}
              <img
                src="/images/hero-aligner-teeth.png"
                className="object-cover object-top h-[300px] sm:h-[400px] md:h-[450px] lg:h-[600px] w-auto max-w-full relative z-10 transform "
                alt="Clear teeth aligners"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Feature highlights */}
      <div className="bg-white/5 border-t border-white/10 shadow-b shadow-black backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: 'Invisible',
                desc: 'Nearly undetectable',
              },
              {
                title: 'Comfortable',
                desc: 'Custom-fitted design',
              },
              {
                title: 'Effective',
                desc: 'Proven results',
              },
              {
                title: 'Convenient',
                desc: 'Easy to maintain',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <h3 className="text-[#8abcb9] font-semibold">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero