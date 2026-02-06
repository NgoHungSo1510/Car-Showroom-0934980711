import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface Car {
    _id: string;
    slug: string;
    name: string;
    thumbnail?: string;
    brand?: { name: string };
    model3D?: { hasModel?: boolean };
}

interface FeaturedCarouselProps {
    cars: Car[];
    carsLoading?: boolean;
    autoPlayInterval?: number; // ms
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
    cars,
    autoPlayInterval = 4000, // 4 seconds
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const totalSlides = cars.length;

    // Go to next slide (with loop)
    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    // Go to previous slide (with loop)
    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    // Auto-play
    useEffect(() => {
        if (isPaused || totalSlides <= 1) return;

        const interval = setInterval(() => {
            nextSlide();
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isPaused, nextSlide, autoPlayInterval, totalSlides]);

    if (totalSlides === 0) return null;

    return (
        <div
            className="relative group/carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Carousel Container */}
            <div className="overflow-hidden rounded-xl">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {cars.map((car) => (
                        <Link
                            key={car._id}
                            to={`/cars/${car.slug}`}
                            className="flex-shrink-0 w-full"
                        >
                            <div
                                className="h-44 bg-cover bg-center relative rounded-xl overflow-hidden mx-1"
                                style={{ backgroundImage: `url("${car.thumbnail}")` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* 3D Badge */}
                                {car.model3D?.hasModel && (
                                    <span className="absolute top-3 right-3 px-2 py-1 bg-primary text-text-primary text-xs font-bold rounded animate-glow">
                                        3D
                                    </span>
                                )}

                                {/* Hot Badge */}
                                <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">
                                    🔥 HOT
                                </span>

                                {/* Car Info */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-xs text-gray-300">{car.brand?.name}</p>
                                    <h3 className="text-lg font-bold text-white">{car.name}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons - Always visible on mobile, show on hover on desktop */}
            {totalSlides > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:bg-black/70 z-10 md:opacity-0 md:group-hover/carousel:opacity-100"
                        aria-label="Previous"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:bg-black/70 z-10 md:opacity-0 md:group-hover/carousel:opacity-100"
                        aria-label="Next"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Indicator Dots */}
            {totalSlides > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                    {cars.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'w-6 bg-primary'
                                    : 'w-2 bg-gray-500 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Auto-play indicator */}
            {!isPaused && totalSlides > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-white/60">
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                </div>
            )}
        </div>
    );
};

export default FeaturedCarousel;
