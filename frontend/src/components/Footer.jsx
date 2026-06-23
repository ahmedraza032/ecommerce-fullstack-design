import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaApple, FaGooglePlay } from 'react-icons/fa';
import './Footer.css';

const footerLinks = {
  About: ['About Us', 'Find store', 'Categories', 'Blogs'],
  Partnership: ['About Us', 'Find store', 'Categories', 'Blogs'],
  Information: ['Help Center', 'Money Refund', 'Shipping', 'Contact us'],
  'For users': ['Login', 'Register', 'Settings', 'My Orders'],
};

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/">
            <img src="/assets/Brand/logo-colored.svg" alt="Brand" height="36" />
          </Link>
          <p className="footer-brand-desc">
            Best information about the company gies here but now lorem ipsum is
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} className="footer-col">
            <h4>{title}</h4>
            <ul>
              {links.map(link => (
                <li key={link}><Link to="#">{link}</Link></li>
              ))}
            </ul>
          </div>
        ))}

        {/* Get App */}
        <div className="footer-col">
          <h4>Get app</h4>
          <div className="app-badges">
            <a href="#" className="app-badge">
              <FaApple size={20} /> App Store
            </a>
            <a href="#" className="app-badge">
              <FaGooglePlay size={18} /> Google Play
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2023 Ecommerce.</p>
          <span>🇬🇧 English</span>
        </div>
      </div>
    </footer>
  );
}
