import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground flex items-center justify-center">
                <span className="text-primary font-bold text-lg">FT</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">FinTrust</span>
                <span className="text-[10px] text-primary-foreground/70 tracking-wider uppercase">NBFC</span>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your trusted partner for seamless digital lending solutions. RBI registered NBFC serving millions of Indians.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["About Us", "Our Products", "Apply for Loan", "EMI Calculator", "FAQs"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Loan Products */}
          <div>
            <h4 className="font-semibold mb-4">Loan Products</h4>
            <ul className="space-y-2">
              {["Personal Loan", "Home Loan", "Business Loan", "Education Loan", "Gold Loan"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>FinTrust Tower, Financial District, Mumbai - 400051</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="w-4 h-4 shrink-0" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4 shrink-0" />
                <span>support@fintrust.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
            <p>© {currentYear} FinTrust NBFC. All rights reserved. RBI Reg. No: XXXXX</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-primary-foreground transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
