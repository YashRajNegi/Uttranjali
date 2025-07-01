import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const banners = [
  {
    image: "/banner1.jpg",
    alt: "Organic Millets Collection",
    title: "Premium Organic Millets",
    description: "Special offer on Ragi, Jowar, Bajra and other nutritious millets. Starting from ₹80/kg",
    buttonText: "Shop Millets",
    buttonLink: "/products"
  },
  {
    image: "/banner2.jpg",
    alt: "Traditional Rice Varieties",
    title: "Traditional Rice Collection",
    description: "Discover our range of traditional red rice, phadi rice, and hand-pounded rice varieties. From ₹120/kg",
    buttonText: "Explore Rice",
    buttonLink: "/products"
  },
  {
    image: "/banner3.jpg",
    alt: "Organic Pulses Range",
    title: "Pure Organic Pulses",
    description: "Farm-fresh organic pulses sourced directly from local farmers. Special prices starting at ₹90/kg",
    buttonText: "Buy Now",
    buttonLink: "/products"
  }
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <section
      {...swipeHandlers}
      className="relative h-[400px] md:h-[500px] overflow-hidden touch-pan-y"
    >
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="relative w-full h-full">
            <img
              src={banner.image}
              alt={banner.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error(`Error loading image: ${banner.image}`);
                console.error(e);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              <span className="inline-block px-4 py-1 bg-organic-primary text-white rounded-full text-sm font-medium mb-4">
                UTTRANJALI Special
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {banner.title}
              </h2>
              <p className="text-lg md:text-xl max-w-2xl mb-8">
                {banner.description}
              </p>
              <Link to={banner.buttonLink}>
                <Button 
                  className="bg-organic-primary hover:bg-organic-dark text-white px-8 py-6 text-lg"
                >
                  {banner.buttonText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Banner;
