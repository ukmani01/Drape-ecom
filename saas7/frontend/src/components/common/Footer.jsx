import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../../api/settings';
import { useAuth } from '../../contexts/AuthContext';   // ✅ ADDED

const Footer = () => {
  const { user } = useAuth();   // ✅ ADDED

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings().then(res => res.data.data),
    enabled: !!user,            // ✅ ADDED – only fetch when authenticated
    retry: false,               // ✅ ADDED – no retries on failure
    staleTime: 5 * 60 * 1000,
  });

  const brand = settings?.brand || {};
  const footer = settings?.footer || {};
  const social = footer.socialLinks || {};

  const socialIcons = [
    { key: 'facebook', icon: '📘', url: social.facebook },
    { key: 'instagram', icon: '📷', url: social.instagram },
    { key: 'twitter', icon: '🐦', url: social.twitter },
    { key: 'youtube', icon: '▶️', url: social.youtube },
    { key: 'linkedin', icon: '🔗', url: social.linkedin },
    { key: 'pinterest', icon: '📌', url: social.pinterest },
    { key: 'whatsapp', icon: '💬', url: social.whatsapp },
  ];

  const hasContact = footer.address || footer.phone || footer.email;
  const hasSocial = socialIcons.some(s => s.url);

  return (
    <footer className="footer-luxury">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand-col">
            <h3 className="footer-logo">{brand.name || 'Drape'}</h3>
            <p className="footer-tagline">{brand.tagline || 'Premium fashion ecommerce platform for modern brands.'}</p>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-links-col">
            <h4>Contact</h4>
            {hasContact ? (
              <ul className="footer-contact-list">
                {footer.address && (
                  <li>
                    <span className="icon">📍</span>
                    <span>{footer.address}</span>
                  </li>
                )}
                {footer.phone && (
                  <li>
                    <span className="icon">📞</span>
                    <a href={`tel:${footer.phone}`}>{footer.phone}</a>
                  </li>
                )}
                {footer.email && (
                  <li>
                    <span className="icon">✉️</span>
                    <a href={`mailto:${footer.email}`}>{footer.email}</a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="muted-text">No contact details set</p>
            )}
          </div>

          {/* Social */}
          <div className="footer-links-col">
            <h4>Follow Us</h4>
            {hasSocial ? (
              <div className="footer-socials">
                {socialIcons.map(({ key, icon, url }) =>
                  url ? (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                    >
                      {icon}
                    </a>
                  ) : null
                )}
              </div>
            ) : (
              <p className="muted-text">No social links set</p>
            )}
          </div>

        </div>

        <div className="footer-bottom">
          <p>{footer.copyright || `© ${new Date().getFullYear()} ${brand.name || 'Drape'}. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;