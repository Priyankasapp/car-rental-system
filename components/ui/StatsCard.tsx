import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  label: string;
  value: string;
  sub: string;
  icon: string;
  subIcon?: string;
  subColor?: string;
  className?: string;
  index?: number;
  animated?: boolean;
  onHoverScale?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  sub,
  icon,
  subIcon,
  subColor = 'text-gray-500',
  className,
  index = 0,
  animated = true,
  onHoverScale = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  // Entrance Animation
  useEffect(() => {
    if (!animated || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 25,
        scale: 0.96,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'power3.out',
      }
    );

    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        {
          opacity: 0,
          scale: 0.6,
          rotation: -15,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.4,
          delay: index * 0.1 + 0.2,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, [animated, index]);

  // Hover Animation
  const handleMouseEnter = () => {
    if (!cardRef.current || !onHoverScale) return;

    gsap.to(cardRef.current, {
      scale: 1.02,
      duration: 0.25,
      ease: 'power2.out',
      boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
    });

    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1.15,
        rotation: 10,
        duration: 0.25,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
      boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
    });

    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.25,
      });
    }
  };

  // Counter Animation
  useEffect(() => {
    if (!animated || !cardRef.current) return;

    const valueElement = cardRef.current.querySelector('.stat-value');

    if (!valueElement) return;

    const numericValue = parseFloat(value);

    if (isNaN(numericValue)) return;

    const obj = { count: 0 };

    gsap.to(obj, {
      count: numericValue,
      duration: 1,
      delay: index * 0.1 + 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        valueElement.textContent = Math.round(obj.count).toString();
      },
      onComplete: () => {
        valueElement.textContent = value;
      },
    });
  }, [value, animated, index]);

  return (
    <div
      ref={cardRef}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300',
        onHoverScale && 'cursor-pointer',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </p>

        <span
          ref={iconRef}
          className="material-symbols-outlined text-xl text-gray-400"
        >
          {icon}
        </span>
      </div>

      {/* Value */}
      <h2 className="stat-value text-3xl font-bold text-black">
        {value}
      </h2>

      {/* Footer */}
      <div className={cn('mt-3 flex items-center gap-2', subColor)}>
        {subIcon && (
          <span className="material-symbols-outlined text-sm">
            {subIcon}
          </span>
        )}

        <span className="text-xs leading-4">
          {sub}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;