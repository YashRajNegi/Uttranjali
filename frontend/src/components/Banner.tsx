import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const navButtonVariants = {
    rest: { scale: 1, opacity: 0 },
    hover: { 
      scale: 1.1, 
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <section
      {...swipeHandlers}
      className="relative h-[400px] md:h-[500px] overflow-hidden touch-pan-y"
    >
      <AnimatePresence initial={false} custom={currentSlide}>
        {banners.map((banner, index) => (
          index === currentSlide && (
            <motion.div
              key={index}
              custom={currentSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <div className="relative w-full h-full">
                <motion.img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  onError={(e) => {
                    console.error(`Error loading image: ${banner.image}`);
                    console.error(e);
                  }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4"
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.span 
                    className="inline-block px-4 py-1 bg-organic-primary text-white rounded-full text-sm font-medium mb-4"
                    variants={itemVariants}
                  >
                    UTTRANJALI Special
                  </motion.span>
                  <motion.h2 
                    className="text-4xl md:text-5xl font-bold mb-4"
                    variants={itemVariants}
                  >
                    {banner.title}
                  </motion.h2>
                  <motion.p 
                    className="text-lg md:text-xl max-w-2xl mb-8"
                    variants={itemVariants}
                  >
                    {banner.description}
                  </motion.p>
                  <motion.div variants={itemVariants}>
                    <Link to={banner.buttonLink}>
                      <motion.div
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button 
                          className="bg-organic-primary hover:bg-organic-dark text-white px-8 py-6 text-lg"
                        >
                          {banner.buttonText}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      <motion.button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm rounded-full p-3"
        aria-label="Previous slide"
        variants={navButtonVariants}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </motion.button>
      
      <motion.button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm rounded-full p-3"
        aria-label="Next slide"
        variants={navButtonVariants}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </motion.button>

      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {banners.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default Banner;
