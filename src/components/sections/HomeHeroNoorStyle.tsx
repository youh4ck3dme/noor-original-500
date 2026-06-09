import React from 'react';
import { LiquidButton } from '../ui/LiquidButton';
export const HomeHeroNoorStyle = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1615397323283-316b2707248b?q=80&w=2000&auto=format&fit=crop"
          alt="Organic Skincare"
          className="w-full h-full object-cover object-center" />
        
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 gm-container flex flex-col items-center text-center mt-16">
        <span className="text-white/90 uppercase tracking-[0.2em] text-sm font-medium mb-6 animate-fade-in">
          Predstavujeme Lipozomálny Vitamín C
        </span>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading text-white mb-6 max-w-4xl drop-shadow-sm leading-tight">
          Prémiová výživa pre{' '}
          <span className="italic font-light">Vaše zdravie</span>
        </h1>

        <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-10 font-light">
          Posilnite svoju imunitu a vitalitu s našimi prémiovými prírodnými doplnkami.
        </p>

        <LiquidButton variant="primary" className="px-10">
          Objavte kolekciu
        </LiquidButton>
      </div>
    </section>);

};