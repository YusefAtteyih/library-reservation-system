import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Library</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Your gateway to knowledge and learning resources.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Resources</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/books" className="text-sm text-muted-foreground hover:text-foreground">
                  Books
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-sm text-muted-foreground hover:text-foreground">
                  Study Rooms
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Support</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact Us</h4>
            <address className="mt-4 not-italic text-muted-foreground">
              <p className="text-sm">123 Library Street</p>
              <p className="mt-1 text-sm">Istanbul, 34000</p>
              <p className="mt-1 text-sm">Turkey</p>
              <p className="mt-1 text-sm">
                <a href="mailto:info@library.com" className="hover:text-foreground">
                  info@library.com
                </a>
              </p>
              <p className="mt-1 text-sm">
                <a href="tel:+901234567890" className="hover:text-foreground">
                  +90 123 456 7890
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} Library. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
