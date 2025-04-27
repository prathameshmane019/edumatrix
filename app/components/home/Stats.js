'use client';

import { motion } from 'framer-motion';
import { Building2, ClapperboardIcon as ChalkboardTeacher, GraduationCap, Award } from 'lucide-react';

export default function Stats() {
  const stats = [
    { value: "500", label: "Institutions", icon: Building2 },
    { value: "12,000", label: "Faculty Members", icon: ChalkboardTeacher },
    { value: "250,000", label: "Students", icon: GraduationCap },
    { value: "98", label: "Satisfaction Rate", icon: Award, suffix: "%" },
  ];

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="py-12 md:py-24"
    >
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50/50 rounded-3xl p-12 shadow-inner">
        <div className="text-center mb-12">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-outfit font-bold text-gray-900 mb-4"
          >
            Trusted by Educational Institutions Worldwide
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Empowering education through technology adoption and digital transformation
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white shadow-sm mb-4">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 font-outfit mb-2">
                {stat.value}
                {stat.suffix || ''}
              </h3>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}