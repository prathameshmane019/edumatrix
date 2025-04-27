'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import { ArrowRight } from 'lucide-react';
import { Avatar1, Avatar2, Avatar3 } from '@/public/home/home';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "EduMatrix Pro has revolutionized how we manage our academic processes. The outcome-based education module has been particularly valuable for our accreditation requirements.",
      author: "Dr. Sarah Johnson",
      position: "Academic Dean, Tech University",
      avatar: Avatar1,
    },
    {
      quote: "The integration of all modules into a single platform has eliminated data silos and significantly improved our decision-making process. The analytics provided are invaluable.",
      author: "Prof. Michael Chen",
      position: "Head of Department, Global College",
      avatar: Avatar2,
    },
    {
      quote: "As a faculty member, I appreciate how the system simplifies attendance tracking and student performance monitoring. It's user-friendly and saves me hours each week.",
      author: "Prof. Amelia Rodriguez",
      position: "Senior Faculty, Innovation Institute",
      avatar: Avatar3,
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
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
          What Our Users Say
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-xl text-gray-600"
        >
          Hear from the educational institutions that have transformed their operations with EduMatrix Pro
        </motion.p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, idx) => (
          <motion.div
            key={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ delay: idx * 0.2 }}
          >
            <Card className="border border-gray-100 h-full">
              <CardBody className="p-8">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className="text-yellow-400 inline-block">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6 flex-grow">"{testimonial.quote}"</p>
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 48 48" aria-label={testimonial.author}>
                        <use href={`#${testimonial.avatar}`} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-outfit font-semibold text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-600">{testimonial.position}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Button
          as={Link}
          href="/testimonials"
          variant="flat"
          className="bg-gray-100 text-gray-800 font-medium"
          endContent={<ArrowRight className="h-4 w-4" />}
        >
          View All Success Stories
        </Button>
      </div>
    </section>
  );
}