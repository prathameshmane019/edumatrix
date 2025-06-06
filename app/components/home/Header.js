'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, Sparkles, Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Check if window scrolled beyond threshold
      setScrolled(window.scrollY > 50);
      
      // Determine active section based on scroll position
      const sections = ['home', 'features', 'roles', 'modules', 'pricing', 'testimonials'];
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 150) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Roles', href: '#roles' },
    { name: 'Modules', href: '#modules' },
    { name: 'Pricing', href: '#pricing' }, 
    { name: 'Features', href: '#features' },

  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120, // Increased offset for better visibility
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <div className="relative h-10 w-10 mr-3">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-indigo-600"
                  animate={{ 
                    rotate: scrolled ? [0, 360] : 0
                  }}
                  transition={{ 
                    duration: 1,
                    ease: "easeInOut",
                    times: [0, 1],
                    repeat: 0
                  }}
                ></motion.div>
                <div className="absolute inset-0.5 rounded-full bg-white flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 1.5,
                      ease: "easeInOut",
                      times: [0, 0.5, 1],
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
              </div>
              <div className="space-y-0">
                <motion.h1 
                  className="text-2xl font-outfit font-bold text-gray-900 leading-tight tracking-tight flex items-center"
                  animate={{ 
                    scale: scrolled ? 0.9 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  EduMatrix Pro
                  <motion.span 
                    className="ml-2 px-2 py-0.5 bg-gradient-to-r from-primary/10 to-indigo-500/10 text-xs font-semibold text-primary rounded-full"
                    animate={{ 
                      opacity: scrolled ? 0.8 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    v2.5
                  </motion.span>
                </motion.h1>
                <motion.span 
                  className="block text-primary/80 text-sm font-medium"
                  animate={{ 
                    opacity: scrolled ? 0 : 1,
                    height: scrolled ? 0 : 'auto',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  Complete Educational Management System
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex gap-8"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="relative font-medium text-gray-700 hover:text-primary transition-colors group py-2"
              >
                {item.name}
                <motion.span 
                  className="absolute left-0 bottom-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: activeSection === item.href.replace('#', '') ? '100%' : '0%'
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.span>
              </Link>
            ))}
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden md:flex gap-4"
          >
            <Button
              as={Link}
              href="/demo"
              variant="bordered"
              className="font-medium"
            >
              Request Demo
            </Button>
            <Button
              as={Link}
              href="/login"
              variant="shadow"
              endContent={<ArrowRight className="h-4 w-4" />}
              className="font-medium bg-gradient-to-r from-primary to-indigo-600 text-white"
            >
              Login
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={`py-2 px-4 rounded-md font-medium ${
                      activeSection === item.href.replace('#', '') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Button
                    as={Link}
                    href="/demo"
                    variant="bordered"
                    className="font-medium w-full"
                  >
                    Request Demo
                  </Button>
                  <Button
                    as={Link}
                    href="/login"
                    variant="shadow"
                    endContent={<ArrowRight className="h-4 w-4" />}
                    className="font-medium bg-gradient-to-r from-primary to-indigo-600 text-white w-full"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Removed horizontal progress bar */}
    </header>
  );
}