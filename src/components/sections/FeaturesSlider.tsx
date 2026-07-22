import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import './FeaturesSlider.css';

export interface Feature {
  icon?: React.ReactNode;
  title: string;
  description: string;
  image?: string;
}

interface FeaturesSliderProps {
  features: Feature[];
}

export const FeaturesSlider: React.FC<FeaturesSliderProps> = ({ features }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % features.length);
  }, [features.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + features.length) % features.length);
  }, [features.length]);

  useEffect(() => {
    if (isFullscreen) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, next, prev]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const feature = features[current];

  const slideContent = (
    <>
      {feature.image && (
        <div className="features-slider-image-wrapper">
          <img
            src={feature.image}
            alt={feature.title}
            className="features-slider-image"
          />
        </div>
      )}
      {!feature.image && feature.icon && (
        <div className="features-slider-icon">
          {feature.icon}
        </div>
      )}
      <h3 className="features-slider-title">{feature.title}</h3>
      <p className="features-slider-description">{feature.description}</p>
    </>
  );

  const navButtons = (
    <>
      <button className="features-slider-btn features-slider-btn-prev" onClick={prev}>
        <ChevronLeft size={24} />
      </button>
      <button className="features-slider-btn features-slider-btn-next" onClick={next}>
        <ChevronRight size={24} />
      </button>
    </>
  );

  const dots = (
    <div className="features-slider-dots">
      {features.map((_, index) => (
        <button
          key={index}
          className={`features-slider-dot ${index === current ? 'active' : ''}`}
          onClick={() => {
            setDirection(index > current ? 1 : -1);
            setCurrent(index);
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="features-slider">
        <div className="features-slider-viewport">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="features-slider-slide"
            >
              {slideContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {navButtons}
        {dots}

        <button
          className="features-slider-fullscreen-btn"
          onClick={() => setIsFullscreen(true)}
          aria-label="Enter fullscreen"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="features-slider-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              className="features-slider-fullscreen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                className="features-slider-fullscreen-close"
                onClick={() => setIsFullscreen(false)}
                aria-label="Exit fullscreen"
              >
                <Minimize2 size={20} />
              </button>

              <div className="features-slider-fullscreen-viewport">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={current}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="features-slider-fullscreen-slide"
                  >
                    {feature.image && (
                      <div className="features-slider-fullscreen-image-wrapper">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="features-slider-fullscreen-image"
                        />
                      </div>
                    )}
                    <div className="features-slider-fullscreen-caption">
                      <h3 className="features-slider-fullscreen-title">{feature.title}</h3>
                      <p className="features-slider-fullscreen-description">{feature.description}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button className="features-slider-btn features-slider-btn-prev" onClick={prev}>
                <ChevronLeft size={24} />
              </button>
              <button className="features-slider-btn features-slider-btn-next" onClick={next}>
                <ChevronRight size={24} />
              </button>

              {dots}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
