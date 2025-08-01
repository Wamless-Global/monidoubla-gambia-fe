
'use client';

export default function ContactHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center"
      style={{
        backgroundImage: `url('https://readdy.ai/api/search-image?query=Professional%20business%20contact%20center%20with%20modern%20office%20environment%2C%20customer%20service%20representatives%20at%20desks%20with%20headsets%2C%20bright%20office%20lighting%2C%20clean%20corporate%20atmosphere%2C%20blue%20and%20white%20color%20scheme%2C%20modern%20technology%20setup&width=1920&height=1080&seq=contact-hero&orientation=landscape')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Contact Us</h1>
        <p className="text-xl md:text-2xl leading-relaxed">
          Get in touch with our team for any questions or support you need
        </p>
      </div>
    </section>
  );
}
