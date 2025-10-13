import Section from "@components/ui/Section";
import Text from "@components/ui/Text";
import { Star } from "lucide-react";

const Reviews = () => {
  const reviews = [
    { 
      name: 'Louise', 
      rating: 5, 
      text: 'HeHe Aligners have been amazing from start to finish. Helpful, polite and so prompt to respond to all email.',
      date: '13 Jul 2023'
    },
    { 
      name: 'Jim Chattaway', 
      rating: 5, 
      text: 'I am impressed with the service and quality of the HeHe aligners. Highly recommended.',
      date: '19 Jul 2025'
    },
    { 
      name: 'Danny', 
      rating: 4, 
      text: 'The results are amazing. Excellent service from start to finish!',
      date: '5 Jul 2026'
    },
    { 
      name: 'Jane Boyle', 
      rating: 4, 
      text: 'WOW experience, so professional. Second to none! work Second to none!',
      date: '7 Jul 2025'
    },
    { 
      name: 'Lorraine', 
      rating: 3, 
      text: 'Can\'t recommend enough. It\'s a great work with a fantastic product with great results!',
      date: '24 Jul 2023'
    },
    { 
      name: 'D H', 
      rating: 4, 
      text: 'No issues overall been great. Top quality and really good communical. Happy with the ending results.',
      date: '9 Jul 2025'
    },
    { 
      name: 'Julie Kennedy', 
      rating: 5, 
      text: 'Great service and would thoroughly recommend! HeHe Aligners have been brilliant and provided a top class service throughout my entire treatment journey.',
      date: '4 Jul 2025'
    },
    { 
      name: 'Costas', 
      rating: 5, 
      text: 'Smooth process, highly recommended. Easy to interact with the team from beginning to end. Great results as wl.',
      date: '6 Jul 2028'
    }
  ];

  return (
    <Section id="reviews">
      <div className="text-center mb-12">
        <Text weight="bold" size="3xl" align="center"  className="mb-2" color="gradientSleek" gradient={true}>Patient Reviews</Text>
        <Text size="sm" weight="normal" className=" max-w-4xl mx-auto "color="muted"  align="center">
          Don't just take our word for it. Here's what our patients have to say about their experience.
        </Text>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300 flex flex-col justify-between max-w-sm mx-auto">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-500"} 
                />
              ))}
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">"{review.text}"</p>
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-bold text-base mb-1">{review.name}</h4>
              <div className="flex items-center justify-between ">
                <div className="flex items-center">
                  <Star size={14} className="text-green-600 fill-current mr-1" />
                  <span className="text-neutral-100 text-xs font-semibold">Trustpilot</span>
                </div>
                <p className="text-gray-400 text-xs">{review.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Reviews;