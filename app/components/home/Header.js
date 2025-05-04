'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
export default function Header() {
  return (
    <header className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-indigo-600"></div>
                <div className="absolute inset-0.5 rounded-full bg-white flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                  {/* <Image
                    src="/logo.svg"
                    alt="EduMatrix Logo"
                    width={60}
                    height={60}
                    className="h-6 w-6"
                  /> */}
                </div>
              </div>
              <div className="space-y-0">
                <h1 className="text-2xl font-outfit font-bold text-gray-900 leading-tight tracking-tight flex items-center">
                  EduMatrix Pro
                  <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-primary/10 to-indigo-500/10 text-xs font-semibold text-primary rounded-full">
                    v2.5
                  </span>
                </h1>
                <span className="block text-primary/80 text-sm font-medium">
                  Complete Educational Management System
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex gap-8"
          >
            {['Features', 'Roles', 'Pricing', 'About Us', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="relative font-medium text-gray-700 hover:text-primary transition-colors group"
              >
                {item}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-4"
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
    </header>
  );
}