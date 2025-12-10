import React from "react";
import { NavLink } from "react-router-dom";

function BrandLogo() {
  return (
    <span className="footer-brand-logo">
      Cyber <b>Sentinel</b>
    </span>
  );
}

function Footer() {
  return (
    <footer className="footer-pro">
      <div className="footer-main-row">

        {/* BRAND + SOCIAL */}
        <div className="footer-brand-col">
          <BrandLogo />

          <div className="footer-social-row">

            {/* Twitter */}
            <a
              href="#"
              aria-label="Twitter"
              className="footer-social-icon"
              dangerouslySetInnerHTML={{
                __html: `
                <svg width='20' height='20' fill='none' stroke='currentColor' stroke-width='2'>
                  <path d='M20 3.5a8.38 8.38 0 0 1-2.36.65A4.13 4.13 0 0 0 19.45 2a8.16 8.16 0 0 1-2.61.99A4.1 4.1 0 0 0 9.86 7a11.65 11.65 0 0 1-8.47-4.29A4.12 4.12 0 0 0 3.19 9.72a4.1 4.1 0 0 1-1.86-.51v.05a4.11 4.11 0 0 0 3.29 4.02 4.09 4.09 0 0 1-1.85.07 4.13 4.13 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18c7.88 0 12.2-6.53 12.2-12.2q0-.28-.01-.55A8.72 8.72 0 0 0 20 3.5Z'/>
                </svg>
              `,
              }}
            ></a>

            {/* GitHub */}
            <a
              href="#"
              aria-label="GitHub"
              className="footer-social-icon"
              dangerouslySetInnerHTML={{
                __html: `
                <svg width='20' height='20' fill='currentColor'>
                  <path d='M10 .4a10 10 0 0 0-3.16 19.5c.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.76.6-3.35-1.33-3.35-1.33-.45-1.15-1.11-1.45-1.11-1.45-.9-.62.07-.6.07-.6 1 .07 1.53 1.05 1.53 1.05.89 1.52 2.35 1.08 2.92.83.09-.64.35-1.08.63-1.33-2.21-.25-4.55-1.1-4.55-4.89 0-1.08.39-1.97 1.04-2.67-.11-.25-.45-1.26.10-2.63 0 0 .83-.27 2.73 1.02A9.52 9.52 0 0 1 10 4.85a9.5 9.5 0 0 1 2.48.33c1.89-1.29 2.72-1.02 2.72-1.02.55 1.37.21 2.38.10 2.63.65.7 1.04 1.59 1.04 2.67 0 3.79-2.34 4.63-4.58 4.88.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.17.58.69.48A10 10 0 0 0 10 .4Z' />
                </svg>
              `,
              }}
            ></a>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="footer-nav-col">
          <NavLink to="/" className="footer-link">
            Home
          </NavLink>
          <NavLink to="/about" className="footer-link">
            About
          </NavLink>
          <NavLink to="/features" className="footer-link">
            Features
          </NavLink>
          <NavLink to="/faq" className="footer-link">
            FAQ
          </NavLink>
          <NavLink to="/contact" className="footer-link">
            Contact
          </NavLink>
        </nav>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-copy-row">
        <span className="footer-copy">
          © {new Date().getFullYear()} Cyber Sentinel. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
