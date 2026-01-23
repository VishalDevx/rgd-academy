"use client";

import { GraduationCap, MapPin, Phone, Mail, ArrowUp } from "lucide-react";

const quickLinks = [
  { name: "About Us", href: "#about" },
  { name: "Activities", href: "#activities" },
  { name: "Gallery", href: "#gallery" },
  { name: "News & Events", href: "#news" },
  { name: "Contact", href: "#contact" },
];

const portalLinks = [
  { name: "Student Portal", href: "#" },
  { name: "Staff Portal", href: "#" },
  { name: "Admin Portal", href: "#" },
  { name: "Parent Portal", href: "#" },
];

const academicLinks = [
  { name: "Admissions", href: "#" },
  { name: "Academics", href: "#" },
  { name: "Facilities", href: "#" },
  { name: "Fee Structure", href: "#" },
  { name: "Calendar", href: "#" },
];

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background relative">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* School Info */}
          <div className="lg:col-span-1">
            <a href="#home" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-school flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-background">RGD School</span>
                <span className="block text-xs text-background/60">
                  Empowering Minds, Shaping Futures
                </span>
              </div>
            </a>
            <p className="text-background/70 text-sm mb-6">
              Providing quality education since 1999. We are committed to nurturing
              young minds and helping them achieve their full potential.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-background/70">
                <MapPin className="w-4 h-4 text-primary" />
                123 Education Street, City
              </p>
              <p className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4 text-primary" />
                +91 98765 43210
              </p>
              <p className="flex items-center gap-2 text-background/70">
                <Mail className="w-4 h-4 text-primary" />
                info@rgdschool.edu
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Academic</h4>
            <ul className="space-y-3">
              {academicLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Portals</h4>
            <ul className="space-y-3">
              {portalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm inline-flex items-center gap-2"
                  >
                    {link.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Soon
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} RGD School. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-background/60">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-school text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};