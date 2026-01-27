import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../services/api';
import { motion } from 'framer-motion';

interface CarCardProps {
  car: Car;
  index?: number;
}

const CarCard: React.FC<CarCardProps> = ({ car, index = 0 }) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(price / 1000000).toFixed(0)} triệu`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card group"
    >
      <Link to={`/cars/${car.slug}`} className="block">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-b from-surface-hover to-surface">
          {car.thumbnail ? (
            <img
              src={car.thumbnail}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="size-16 text-text-secondary opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
          )}

          {/* 3D Badge */}
          {car.model3D?.hasModel && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-primary text-text-primary text-xs font-bold rounded animate-glow">
              3D
            </div>
          )}

          {/* Featured Badge */}
          {car.isFeatured && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded">
              HOT
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-2">
            {car.brand?.logo && (
              <img src={car.brand.logo} alt={car.brand.name} className="size-5 object-contain" />
            )}
            <span className="text-xs text-text-secondary uppercase tracking-wider">
              {car.brand?.name}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors mb-2">
            {car.name}
          </h3>

          {/* Specs preview */}
          <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
            {car.specs?.seats && (
              <span className="flex items-center gap-1">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {car.specs.seats} chỗ
              </span>
            )}
            {car.specs?.engine && (
              <span className="flex items-center gap-1">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {car.specs.engine}
              </span>
            )}
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-xs text-text-secondary">Giá từ</p>
              <p className="text-lg font-bold text-primary">{formatPrice(car.price)}</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              Xem chi tiết
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default CarCard;
