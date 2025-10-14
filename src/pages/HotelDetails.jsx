import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './HotelDetails.module.css';
import { FiHeart, FiMapPin, FiShare2, FiChevronRight, FiCheck } from 'react-icons/fi';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';

const sampleHotel = {
  id: 1,
  name: 'Premium Suite (Assisted) – Sukha Senior Resort',
  address: '385, Lorong Sultan, Pjs 52, 46200 Petaling Jaya, Selangor',
  price: 350,
  tags: ['Assisted Stays', 'Resort', 'Senior Friendly Stay', 'Selangor'],
  description:
    'Sukha Senior Resort offers a premium lifestyle experience designed specifically for senior travelers. Our resort combines comfort, care, and tranquility in a convenient location. With elder-friendly architecture, accessible facilities, and curated experiences, we provide the perfect environment for relaxation and wellness. Our concierge services ensure every need is met with personalized attention.',
  images: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  ],
  features: {
    categories: ['Assisted Stays', 'Resort'],
    rentalCategories: ['Senior Friendly Stay'],
    features: [
      'Air conditioning',
      'Free Parking',
      'Instant Book',
      'Laundry Service',
      'Meals',
      'Senior Friendly Toilets',
      'Stretching Areas',
      'Wireless Internet'
    ],
    regions: ['Selangor']
  },
  pricing: [
    { name: 'Airport Transfer', description: 'Comfortable, assisted transport to and from the accommodation.', price: 600 },
    { name: 'Express Check-In', description: 'Hassle free, priority check-in tailored for seniors.', price: 180 },
    { name: 'Dietary Supplies', description: 'Personalized sourcing of meals or groceries to meet dietary needs.', price: 50 },
    { name: 'Personal Driver', description: 'A dedicated driver for safe and convenient travel.', price: 300 },
    { name: 'Personal Companion (Non-Medical) - 3 Hours', description: 'Friendly assistance for outings, errands, or leisure activities.', price: 180 },
    { name: 'Personal Companion (Medical) - 3 Hours', description: 'Support from a trained companion for basic medical needs.', price: 270 },
    { name: 'Personal Shopping Assistant', description: 'Help with shopping, whether in person or online.', price: 180 },
    { name: 'Personal Tour Planner', description: 'Custom travel plans and sightseeing tailored for senior comfort.', price: 180 },
    { name: 'In-House Companion (Medical) - 3 Hours', description: 'On-site presence for light medical supervision and wellness support.', price: 270 },
    { name: 'In-House Companion (Non-Medical)', description: 'Companionship and assistance with daily routines within the accommodation.', price: 180 }
  ],
  similarHotels: [
    {
      id: 2,
      name: '2-Bedroom Suite - Millennia Village',
      address: 'Seremban, Negeri Sembilan',
      price: '100',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      name: 'Studio Plus - Millennia Village',
      address: 'Seremban, Negeri Sembilan',
      price: '130',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'
    }
  ]
};

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [guests, setGuests] = useState(1);

  const handleBookmark = () => setIsBookmarked(!isBookmarked);
  const handleImageClick = (index) => setSelectedImageIndex(index);
  const handleCloseModal = () => setSelectedImageIndex(null);

  const handleDecrease = () => setGuests((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => setGuests((prev) => prev + 1);

  const handlePrev = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? sampleHotel.images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === sampleHotel.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <p className={styles.description}>{sampleHotel.description}</p>;
      case 'gallery':
        return (
          <div className={styles.galleryGrid}>
            {sampleHotel.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Hotel view ${index + 1}`}
                className={styles.galleryImage}
                onClick={() => handleImageClick(index)}
              />
            ))}
          </div>
        );
      case 'pricing':
        return (
          <>
            <h3 className={styles.pricingTitle}>Concierge Service Add-Ons</h3>
            <div className={styles.pricingList}>
              {sampleHotel.pricing.map((service, index) => (
                <div key={index} className={styles.pricingItem}>
                  <div className={styles.serviceInfo}>
                    <h4 className={styles.serviceName}>{service.name}</h4>
                    <p className={styles.serviceDescription}>{service.description}</p>
                  </div>
                  <div className={styles.servicePrice}>RM {service.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </>
        );
      case 'video':
        return (
          <div className={styles.videoContainer}>
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/IH98IfqPAIo?si=DoJrKLT4-FhoxDhT"
              title="Hotel Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      case 'location':
        return (
          <div className={styles.mapContainer}>
            <iframe
              width="100%"
              height="400"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.5!2d101.6!3d3.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMDYnMDAuMCJOIDEwMcKwMzYnMDAuMCJF!5e0!3m2!1sen!2smy!4v1234567890"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        );
      case 'reviews':
        return <p className={styles.placeholderText}>Only guests who have booked can leave a review.</p>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.container}>
        {/* === HEADER SECTION === */}
        <section className={styles.headerSection}>
          <div className={styles.tagsContainer}>
            {sampleHotel.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>{tag}</span>
            ))}
          </div>
          <div className={styles.titleRow}>
            <div className={styles.titleInfo}>
              <h1 className={styles.hotelName}>{sampleHotel.name}</h1>
              <div className={styles.addressRow}>
                <FiMapPin className={styles.locationIcon} />
                <span className={styles.address}>{sampleHotel.address}</span>
              </div>
            </div>
            <div className={styles.bookmarkSection}>
              <button className={styles.bookmarkBtn} onClick={handleBookmark}>
                <FiHeart className={`${styles.heartIcon} ${isBookmarked ? styles.bookmarked : ''}`} />
                Bookmark this listing
              </button>
              <p className={styles.bookmarkCount}>1 person bookmarked this place</p>
            </div>
          </div>
        </section>

        {/* === GALLERY SECTION === */}
        <section className={styles.gallerySection}>
          <div className={styles.mainImageContainer}>
            <img
              src={sampleHotel.images[0]}
              alt="Main hotel view"
              className={styles.mainImage}
              onClick={() => handleImageClick(0)}
            />
          </div>
          <div className={styles.thumbnailsContainer}>
            <div className={styles.thumbnailGrid}>
              {sampleHotel.images.slice(1, 5).map((image, index) => (
                <div key={index} className={styles.thumbnailWrapper}>
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={styles.thumbnail}
                    onClick={() => handleImageClick(index + 1)}
                  />
                  {index === 3 && (
                    <button
                      className={styles.showAllBtn}
                      onClick={() => setSelectedImageIndex(0)}
                    >
                      Show all photos
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === IMAGE MODAL === */}
        {selectedImageIndex !== null && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeModal} onClick={handleCloseModal}>×</button>
              <button className={styles.prevBtn} onClick={handlePrev}>‹</button>
              <img
                src={sampleHotel.images[selectedImageIndex]}
                alt="Large view"
                className={styles.modalImage}
              />
              <button className={styles.nextBtn} onClick={handleNext}>›</button>
            </div>
          </div>
        )}

        {/* === MAIN CONTENT === */}
        <div className={styles.mainContent}>
        <section className={styles.tabsSection}>
  <nav className={styles.tabNav}>
    {['overview', 'gallery', 'pricing', 'video', 'location', 'reviews'].map((tab) => (
      <button
        key={tab}
        className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
        onClick={() => setActiveTab(tab)}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </nav>
  <div className={styles.tabContent}>
    {renderTabContent()}
  </div>
</section>


          {/* === BOOKING WIDGET === */}
          <aside className={styles.bookingWidget}>
            <div className={styles.bookingCard}>
              <div className={styles.priceSection}>
                <h3 className={styles.bookNowTitle}>Book Now</h3>
                <p className={styles.priceText}>Starts from RM{sampleHotel.price} per day</p>
              </div>

              <div className={styles.bookingForm}>
                <div className={styles.dateInputs}>
                  <div className={styles.inputGroup}>
                    <label>Check-in</label>
                    <input type="date" className={styles.dateInput} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Check-out</label>
                    <input type="date" className={styles.dateInput} />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Extra Services</label>
                  <select className={styles.selectInput}>
                    <option>Select services</option>
                    <option>Airport Transfer</option>
                    <option>Express Check-In</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Guests</label>
                  <div className={styles.guestCounter}>
                    <button type="button" onClick={handleDecrease} className={styles.counterBtn}>-</button>
                    <span className={styles.guestCount}>{guests}</span>
                    <button type="button" onClick={handleIncrease} className={styles.counterBtn}>+</button>
                  </div>
                </div>

                <button
                  className={styles.bookNowBtn}
                  onClick={() => navigate('/booking-confirmation')}
                >
                  Book Now
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* === FEATURES SECTION === */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureGroup}>
              <h4 className={styles.featureTitle}>Categories</h4>
              <div className={styles.featureList}>
                {sampleHotel.features.categories.map((feature, index) => (
                  <div key={index} className={styles.featureItem}>
                    <FiCheck className={styles.checkIcon} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.featureGroup}>
              <h4 className={styles.featureTitle}>Rental Categories</h4>
              <div className={styles.featureList}>
                {sampleHotel.features.rentalCategories.map((feature, index) => (
                  <div key={index} className={styles.featureItem}>
                    <FiCheck className={styles.checkIcon} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.featureGroup}>
              <h4 className={styles.featureTitle}>Features</h4>
              <div className={styles.featureList}>
                {sampleHotel.features.features.map((feature, index) => (
                  <div key={index} className={styles.featureItem}>
                    <FiCheck className={styles.checkIcon} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.featureGroup}>
              <h4 className={styles.featureTitle}>Regions</h4>
              <div className={styles.featureList}>
                {sampleHotel.features.regions.map((feature, index) => (
                  <div key={index} className={styles.featureItem}>
                    <FiCheck className={styles.checkIcon} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* === SIMILAR LISTINGS === */}
        <section className={styles.similarSection}>
          <h3 className={styles.similarTitle}>Similar Listings</h3>
          <div className={styles.similarGrid}>
            {sampleHotel.similarHotels.map((hotel) => (
              <Link key={hotel.id} to={`/hotels/${hotel.id}`} className={styles.cardLink}>
                <HotelCard hotel={hotel} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* === FOOTER === */}
      <Footer />
    </>
  );
}

export default HotelDetails;

