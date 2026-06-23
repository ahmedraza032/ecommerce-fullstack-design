/**
 * ProductImage — drop-in replacement for <img> for product images.
 * Adds referrerPolicy="no-referrer" (bypasses hotlink protection on most sites)
 * and a grey placeholder fallback if the image fails to load.
 */
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductImage({ src, alt, className, style }) {
  return (
    <img
      src={src || PLACEHOLDER}
      alt={alt || 'Product'}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={e => {
        if (e.currentTarget.src !== PLACEHOLDER) {
          e.currentTarget.onerror = null;
          e.currentTarget.src = PLACEHOLDER;
        }
      }}
    />
  );
}
