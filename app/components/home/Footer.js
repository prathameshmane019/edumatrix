'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-white backdrop-blur-sm">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="relative h-10 w-10 mr-3">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-indigo-600"></div>
                <div className="absolute inset-0.5 rounded-full bg-white flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-outfit font-bold text-gray-900">
                EduMatrix Pro
              </h3>
            </div>

            <p className="text-gray-600">
              Transforming educational institutions through comprehensive digital solutions designed for the modern era.
            </p>

            <div className="flex gap-4">
              {['facebook', 'twitter', 'linkedin', 'youtube'].map((social) => (
                <Link
                  key={social}
                  href={`https://${social}.com`}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  {/* Placeholder for social icons */}
                  <svg className="w-5 h-5" fill="currentColor">
                    <use href={`#icon-${social}`} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {[
            {
              title: "Product",
              links: ["Features", "Modules", "Pricing"  ],
            },
            {
              title: "Company",
              links: ["About Us",   , "Contact" ],
            },
            {
              title: "Resources",
              links: ["Documentation", "Tutorials", "Blog" ],
            },
          ].map((column, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-lg font-outfit font-semibold text-gray-900">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">
            © 2024 EduMatrix Pro. All rights reserved.
          </p>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'Security', 'Cookies'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm text-gray-500 hover:text-primary transition-colors font-medium"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}