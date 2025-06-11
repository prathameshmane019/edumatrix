'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

export default function Comparison() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="text-center max-w-3xl mx-auto space-y-6 mb-16"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl font-outfit font-bold text-gray-900"
        >
          Why Choose EduMatrix Pro?
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-xl text-gray-600"
        >
          See how our comprehensive solution compares to traditional systems and other competitors
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="relative overflow-x-auto rounded-xl shadow-lg border border-gray-200"
      >
        <table className="w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-700 font-semibold">Features</th>
              <th className="px-6 py-4 text-center text-primary font-semibold">
                <div className="flex flex-col items-center">
                  <Sparkles className="h-5 w-5 mb-1" />
                  EduMatrix Pro
                </div>
              </th>
              <th className="px-6 py-4 text-center text-gray-700 font-semibold">Traditional ERP</th>
              <th className="px-6 py-4 text-center text-gray-700 font-semibold">Competitors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { feature: "Integrated Multi-Role System", eduMatrix: true, traditional: false, competitor: "Partial" },
              { feature: "AI-Powered Analytics", eduMatrix: true, traditional: false, competitor: "Limited" },
              { feature: "Mobile-First Interface", eduMatrix: true, traditional: false, competitor: true },
              { feature: "Outcome-Based Education", eduMatrix: true, traditional: false, competitor: "Limited" },
              { feature: "Real-time Performance Tracking", eduMatrix: true, traditional: "Limited", competitor: "Partial" },
              { feature: "Cloud-Based Infrastructure", eduMatrix: true, traditional: "Optional", competitor: true },
              { feature: "Biometric Attendance Integration", eduMatrix: true, traditional: "Optional", competitor: "Limited" },
            ].map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{row.feature}</td>
                <td className="px-6 py-4 text-center">
                  {row.eduMatrix === true ? (
                    <div className="mx-auto rounded-full bg-green-100 p-1 w-8 h-8 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : row.eduMatrix}
                </td>
                <td className="px-6 py-4 text-center text-gray-600">
                  {row.traditional === true ? (
                    <div className="mx-auto rounded-full bg-green-100 p-1 w-8 h-8 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : row.traditional === false ? (
                    <div className="mx-auto rounded-full bg-red-100 p-1 w-8 h-8 flex items-center justify-center">
                      <span className="block h-0.5 w-4 bg-red-500 rounded-full transform rotate-45"></span>
                      <span className="block h-0.5 w-4 bg-red-500 rounded-full transform -rotate-45 absolute"></span>
                    </div>
                  ) : row.traditional}
                </td>
                <td className="px-6 py-4 text-center text-gray-600">
                  {row.competitor === true ? (
                    <div className="mx-auto rounded-full bg-green-100 p-1 w-8 h-8 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : row.competitor === false ? (
                    <div className="mx-auto rounded-full bg-red-100 p-1 w-8 h-8 flex items-center justify-center">
                      <span className="block h-0.5 w-4 bg-red-500 rounded-full transform rotate-45"></span>
                      <span className="block h-0.5 w-4 bg-red-500 rounded-full transform -rotate-45 absolute"></span>
                    </div>
                  ) : row.competitor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* <div className="mt-6 text-center">
        <Button
          as={Link}
          href="/compare"
          variant="light"
          className="text-primary font-medium"
          endContent={<ArrowRight className="h-4 w-4" />}
        >
          View Full Comparison
        </Button>
      </div> */}
    </section>
  );
}