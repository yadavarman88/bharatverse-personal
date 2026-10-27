import React from "react";

const Footer = ({ onPageChange }) => {
  const links = [
    { label: "Heritage Sites", page: "heritage" },
    { label: "Festivals", page: "festivals" },
    { label: "Traditional Arts", page: "arts" },
    { label: "Hidden Gems", page: "gems" },
  ];
  const features = [
    { label: "360° Tours", page: "360tour" },
    { label: "AI Guide", page: "chat" },
    { label: "Interactive Quiz", page: "quiz" },
    { label: "Trip Planner", page: "planner" },
  ];
  return (
    <footer className="bg-heritage-gradient text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🕌</span>
              </div>
              <div>
                <h3 className="text-2xl font-heritage font-bold">
                  BharatVerse
                </h3>
                <p className="text-white/80">Discover India's Heritage</p>
              </div>
            </div>
            <p className="text-white/90 mb-6">
              Explore India's incredible cultural heritage through immersive
              experiences, AI-powered guides, and interactive storytelling.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.page}>
                  <button
                    onClick={() => onPageChange?.(l.page)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              {features.map((l) => (
                <li key={l.page}>
                  <button
                    onClick={() => onPageChange?.(l.page)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/80 text-sm">
            © 2025 BharatVerse. Made with ❤️ for Indian Heritage.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
