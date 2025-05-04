'use client';

import Link from 'next/link';
import { motion, useScroll, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { ArrowRight, MessageSquare, Layers, Zap, RefreshCw, Database, Brain, Check, Calendar } from 'lucide-react'; 
import { DashboardIllustration } from '@/public/illustrations/home/DashboardIllustration';


export default function Hero() {
  const controls = useAnimation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });

  useEffect(() => {
    scrollYProgress.on("change", (latest) => {
      if (latest > 0) {
        controls.start("visible");
      }
    });
  }, [controls, scrollYProgress]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const heroStagger = {
    visible: {
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="py-20 md:py-32" ref={ref}>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroStagger}
          className="space-y-8"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm"
          >
            <Zap className="h-4 w-4" />
            Next-Generation Education Management
          </motion.span>

          <motion.h2
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-outfit font-bold text-gray-900 tracking-tight"
          >
            Transform Your
            <span className="block py-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-purple-600">
              Institution Digitally
            </span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 leading-relaxed"
          >
            A comprehensive ERP solution designed for modern educational institutions.
            Streamline operations, enhance communication, and drive better outcomes with
            our AI-powered platform.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              as={Link}
              href="/grievance"
              variant="bordered"
              size="lg"
              className="font-medium border-2 border-gray-200 hover:border-primary/50 transition-all duration-300"
              startContent={<MessageSquare className="h-5 w-5" />}
            >
              Submit Grievance
            </Button>
            <Button
              as={Link}
              href="/demo"
              color="primary"
              size="lg"
              className="font-medium bg-gradient-to-r from-primary to-indigo-600 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              endContent={<ArrowRight className="h-5 w-5" />}
            >
              Schedule Demo
            </Button>
            <Button
              as={Link}
              href="/features"
              variant="flat"
              size="lg"
              className="font-medium bg-gray-50 hover:bg-gray-100 transition-all duration-300"
              startContent={<Layers className="h-5 w-5" />}
            >
              Explore Features
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8"
          >
            {[
              { icon: RefreshCw, text: "Real-time Sync", desc: "Instant updates across all devices" },
              { icon: Database, text: "Secure Data", desc: "End-to-end encryption" },
              { icon: Brain, text: "AI-Powered", desc: "Smart analytics & insights" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card
                  className="border-none bg-white/70 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <CardBody className="p-6">
                    <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-outfit font-semibold text-lg mb-1">{feature.text}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-indigo-500/10 rounded-3xl transform rotate-3"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute -bottom-12 -left-12 bg-white p-4 rounded-xl shadow-lg z-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-green-100 p-2">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <p className="font-medium text-gray-700">Attendance Updated</p>
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="text-primary font-medium">98%</span> students marked present today
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute -top-12 -right-8 bg-white p-4 rounded-xl shadow-lg z-10 max-w-xs"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <p className="font-medium text-gray-700">Exam Schedule Updated</p>
            </div>
            <div className="text-xs text-gray-500">
              Final semester exams start from May 15th
            </div>
          </motion.div>
          <div className="relative rounded-3xl shadow-xl hover:shadow-2xl transition-shadow overflow-hidden">
            <DashboardIllustration />
          </div>

        </motion.div>
      </div>
    </section>
  );
}