import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/solid';

const footerLinks = {
  Platform: [
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Charities', to: '/charities' },
  ],
  Company: [
    { label: 'About Us', to: '#' },
    { label: 'Contact', to: '#' },
    { label: 'Blog', to: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Cookie Policy', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-warm-500 bg-clip-text text-transparent">
              BirdieBounty
            </span>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Where every round counts. Play golf, enter your scores, and help
              make a difference for charities you care about.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} BirdieBounty. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-400">
            Made with <HeartIcon className="h-3 w-3 text-primary-400" /> for charity
          </p>
        </div>
      </div>
    </footer>
  );
}
