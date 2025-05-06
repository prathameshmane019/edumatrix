'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, Award, Users } from 'lucide-react'; 
import EducationDashboard3D from '@/public/illustrations/home/EducationDashboard3D';

export default function CTA() {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="  "
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-indigo-600 p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>

        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-outfit font-bold">Ready to Transform Your Institution?</h2>
            <p className="text-xl text-white/90">
              Join hundreds of educational institutions that are already benefiting from our comprehensive management solution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                size="lg"
                className="bg-white text-primary font-medium hover:bg-white/90"
                endContent={<ArrowRight className="h-5 w-5" />}
              >
                Schedule Demo
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-white/30 text-white font-medium hover:bg-white/10"
              >
                View Pricing
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <svg
              className="rounded-lg shadow-xl w-full h-auto"
              viewBox="0 0 500 400"
              aria-label="EduMatrix Pro Dashboard"
            >
              <EducationDashboard3D />
            </svg>

            <motion.div
              initial={{ y: 10 }}
              animate={{ y: -10 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
              className="absolute -top-10 -left-10 bg-white rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-gray-800 font-medium">Top-rated solution</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.5, delay: 0.5 }}
              className="absolute -bottom-8 right-10 bg-white rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                <span className="text-gray-800 font-medium">250K+ Students</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}