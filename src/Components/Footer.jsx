import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-white text-gray-900">
      {/* Main Footer Content */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        {/* Desktop: 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* LEFT COLUMN: Brand & Company Info */}
          <div>
            {/* Brand Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-red-500 text-white p-2 rounded">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-0.16 0.28-0.25 0.61-0.25 0.96 0 1.1 0.9 2 2 2h12v-2H7.42c-0.14 0-0.25-0.11-0.25-0.25l0.03-0.12 0.9-1.63h7.45c0.75 0 1.41-0.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-0.94-2H1zm16 16c-1.1 0-1.99 0.9-1.99 2s0.89 2 1.99 2 2-0.9 2-2-0.9-2-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">EVENT PRO</h3>
              </div>
              <p className="text-gray-900 text-sm font-semibold">
                Book. Events. Enjoy
              </p>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              Kickstart your resolution to party hard and immerse yourself in a
              world of LIVE music, comedy, poetry, theater, sports, and more
              with our premier booking platform.
            </p>

            {/* Company Info */}
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <span className="font-semibold text-gray-900 block mb-1">
                  Product of:
                </span>
                <p className="text-gray-600">EVENT BOOKING PLATFORM</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900 block mb-1">
                  CIN:
                </span>
                <p className="text-gray-600">U62099TS2024PTC180666</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900 block mb-1">
                  GST:
                </span>
                <p className="text-gray-600">36AAHCE9506H1ZH</p>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Social Media Presence */}
          <div className="flex flex-col">
            <h4 className="text-lg font-bold text-gray-900 mb-6">
              Social Media Presence
            </h4>

            {/* Social Icons Grid */}
            <div className="flex gap-4 mb-8">
              <a
                href="#"
                className="bg-gray-200 text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition"
                title="Instagram"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 11v9h3v-9H7zm11.84-9c.3622 0 .5 .1378 .5 .5v21c0 .3622-.1378 .5-.5 .5H5.5c-.3622 0-.5-.1378-.5-.5v-21c0-.3622.1378-.5.5-.5z" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-gray-200 text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition"
                title="Facebook"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 12h-8v8h8v-8zm-1-7h-6v6h6V5z" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-gray-200 text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition"
                title="YouTube"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.175h-15.23c-2.432 0-4.385 1.953-4.385 4.385v9.28c0 2.432 1.953 4.385 4.385 4.385h15.23c2.432 0 4.385-1.953 4.385-4.385v-9.28c0-2.432-1.953-4.385-4.385-4.385zM9.5 16.5v-7l5.5 3.5-5.5 3.5z" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-gray-200 text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition"
                title="Twitter"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-1-4z" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-gray-200 text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition"
                title="LinkedIn"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                </svg>
              </a>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">
              Connect with us on our social media channels for the latest event
              updates, exclusive offers, and industry news.
            </p>
          </div>

          {/* RIGHT COLUMN: Newsletter */}
          <div className="flex flex-col">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Newsletter</h4>
            <p className="text-gray-700 text-sm mb-4">
              Subscribe to our Newsletter & get event industry updates directly
              to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-4 py-2 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              />
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-full transition"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-green-600 text-sm mt-2 font-semibold">
                ✓ Subscribed successfully!
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-300 my-8" />
      </div>

      {/* Copyright */}
      <div className="bg-gray-800 py-6 px-4 md:px-8 text-center text-white text-sm border-t border-gray-700">
        <p>Copyright © 2025 Event Pro. All rights reserved.</p>
      </div>
    </footer>
  );
}
