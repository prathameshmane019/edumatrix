'use client';

import { useEffect } from 'react';
import Header from './components/home/Header';
import Hero from './components/home/Hero';
import Stats from './components/home/Stats';
import RoleBased from './components/home/RoleBased';
import Modules from './components/home/Modules';
import CTA from './components/home/CTA';
import Comparison from './components/home/Comparison';
import Testimonials from './components/home/Testimonials'; 
import Footer from './components/home/Footer';

export default function Home() {
  // Optional: Add scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Animated gradient shapes in background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-40 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
      </div>
      <Header />
      <main className="container mx-auto px-4">
        {/* Add section IDs for smooth scrolling */}
        <section id="home" className=" animate-on-scroll">
          <Hero />
        </section>
        
        <section id="features" className=" animate-on-scroll">
          <Stats />
        </section>
        
        <section id="roles" className="  animate-on-scroll">
          <RoleBased />
        </section>
        
        <section id="modules" className="  animate-on-scroll">
          <Modules />
        </section>
        
        <section id="pricing" className=" animate-on-scroll">
          <CTA />
          <Comparison />
        </section>
        
        <section id="testimonials" className=" animate-on-scroll">
          <Testimonials /> 
        </section>
        
        <section id="about" className="  animate-on-scroll">
          {/* About section content can be added here */}
        </section>
      </main>
      <Footer />
    </div>
  );
}