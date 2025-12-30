import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './RoomDetails.module.css';
import { FiHeart, FiMapPin, FiCheck } from 'react-icons/fi';
import RoomCard from '../components/RoomCard';
import Footer from '../components/Footer';
import BookingMultiSelect from '../components/BookingMultiSelect';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function RoomDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, favourites = [], addFavourite, removeFavourite, toggleFavourite } = useAuth();
  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [guests, setGuests] = useState(1);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const safeFavourites = Array.isArray(favourites) ? favourites : [];
  const isBookmarked = room && Array.isArray(favourites) && favourites.includes(room.room_id);
  const toDateOnly = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d)) return value; 
    return d.toISOString().split('T')[0];
  };
  

  // === FETCH ROOM DATA ===
  useEffect(() => {
    let cancelled = false;
    const fetchRoom = async () => {
      setLoadingRoom(true);
      try {
        const resRoom = await api.get(`/api/rooms/${id}`);
        if (!cancelled) setRoom(resRoom.data);
        if (!cancelled && resRoom.data?.hotel_id) {
          try {
            const resHotel = await api.get(`/api/hotels/${resRoom.data.hotel_id}`);
            if (!cancelled) setHotel(resHotel.data);
          } catch (err) {
            console.error('Error fetching hotel data:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching room:', err);
      } finally {
        if (!cancelled) setLoadingRoom(false);
      }
    };
    if (id) fetchRoom();
    return () => { cancelled = true; };
  }, [id]);

  // === Auto-fill dates from URL ===
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCheckIn(params.get('check_in') || '');
    setCheckOut(params.get('check_out') || '');
  }, [location.search]);

  // === FETCH SIMILAR ROOMS ===
  useEffect(() => {
    let cancelled = false;
    const fetchSimilarRooms = async () => {
      if (!room?.hotel_id) return;
      setLoadingSimilar(true);
      try {
        const res = await api.get(`/api/rooms/by-hotel/${room.hotel_id}`);
        const filtered = Array.isArray(res.data) ? res.data.filter(r => r.room_id !== room.room_id) : [];
        if (!cancelled) setSimilarRooms(filtered);
      } catch (err) {
        console.error('Error fetching similar rooms:', err);
        if (!cancelled) setSimilarRooms([]);
      } finally {
        if (!cancelled) setLoadingSimilar(false);
      }
    };
    fetchSimilarRooms();
    return () => { cancelled = true; };
  }, [room?.hotel_id, room?.room_id]);

  // === FETCH SERVICES ===
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/api/services');
        setServices(res.data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };
    fetchServices();
  }, []);

  // === SCROLL TOP ON ID CHANGE ===
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [id]);

  // === HANDLERS ===
const handleBookmark = async () => {
  if (!user) {
    alert('Please log in to save favourites');
    return;
  }

  try {
    await toggleFavourite(room.room_id);
  } catch (err) {
    console.error('Favourite toggle error:', err);
    alert('Could not update favourites. Please try again later.');
  }
};


  const handleImageClick = (index) => setSelectedImageIndex(index);
  const handleCloseModal = () => setSelectedImageIndex(null);
  const handleDecrease = () => setGuests(prev => Math.max(1, prev - 1));
  const handleIncrease = () => {
    if (!room) return setGuests(g => g + 1);
    if (guests + 1 > (room.max_guests || Number.MAX_SAFE_INTEGER)) {
      return alert(`Max is ${room.max_guests} ppl`);
    }
    setGuests(g => g + 1);
  };
  const handlePrev = () => {
    if (!room?.images?.length) return;
    setSelectedImageIndex(prev => prev === 0 ? room.images.length - 1 : prev - 1);
  };
  const handleNext = () => {
    if (!room?.images?.length) return;
    setSelectedImageIndex(prev => prev === room.images.length - 1 ? 0 : prev + 1);
  };

  const checkOverlap = async () => {
    if (!checkIn || !checkOut) return false;
    try {
      const res = await api.get('/api/bookings/overlap', {
        params: { 
          room_id: room.room_id, 
          check_in: toDateOnly(checkIn), 
          check_out: toDateOnly(checkOut) 
        }
        
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        const b = res.data[0];
        alert(
          `This room is already booked from ${toDateOnly(b.check_in_date)} to ${toDateOnly(b.check_out_date)}.`
        );
        
        return false;
      }
      return true;
    } catch (err) {
      console.error('Overlap check error:', err);
      alert('Could not verify availability. Please try again later.');
      return false;
    }
  };

  const handleBookNow = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!checkIn || !checkOut) { alert('Please select dates'); setSubmitting(false); return; }
    const dIn = new Date(checkIn), dOut = new Date(checkOut);
    if (isNaN(dIn) || isNaN(dOut) || dOut <= dIn) {
      alert('Please select valid dates'); setSubmitting(false); return;
    }

    if (!await checkOverlap()) { setSubmitting(false); return; }

    const selectedServiceData = selectedService.map(sel => {
      const svc = services.find(s => s.service_name === sel.name);
      return {
        service_id: svc.service_id,
        service_name: svc.service_name,
        quantity: sel.quantity,
        price: svc.price
      };
    });
    
    navigate('/booking-confirmation', {
      state: {
        userId: user?.user_id || null,
        roomId: room.room_id,
        roomName: room.name,
        hotelName: hotel?.name,
        image: room.images?.[0] || 'https://via.placeholder.com/800x450?text=No+Image',
        checkIn: toDateOnly(checkIn),
        checkOut: toDateOnly(checkOut),
        guests,
        roomPrice: Number(room.price),
        selectedServices: selectedServiceData
      }
    });

    setSubmitting(false);
  };

  if (loadingRoom) return <div className={styles.loading}>Loading room details...</div>;
  if (!room) return <div className={styles.loading}>Room not found.</div>;

  // === RENDER TAB CONTENT ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <p className={styles.description}>{room.description || 'No description available.'}</p>;
      case 'gallery': return (
        <div className={styles.galleryGrid}>
          {room.images?.length ? room.images.map((img, i) => (
            <img key={i} src={img} alt={`Hotel view ${i + 1}`} className={styles.galleryImage} onClick={() => handleImageClick(i)} />
          )) : <p>No images available.</p>}
        </div>
      );
      case 'pricing': return (
        <>
          <h3 className={styles.pricingTitle}>Concierge Service Add-Ons</h3>
          <div className={styles.pricingList}>
            {services.length ? services.map(s => (
              <div key={s.service_id} className={styles.pricingItem}>
                <div className={styles.serviceInfo}>
                  <h4 className={styles.serviceName}>{s.service_name}</h4>
                  <p className={styles.serviceDescription}>{s.description}</p>
                </div>
                <div className={styles.servicePrice}>RM {Number(s.price).toFixed(2)}</div>
              </div>
            )) : <p>No pricing add-ons available.</p>}
          </div>
        </>
      );
      case 'video': return (
        <div className={styles.videoContainer}>
          <iframe width="100%" height="400" src={room.video_url || 'https://www.youtube.com/embed/IH98IfqPAIo'} title="Hotel Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      );
      case 'location': {
        const lat = room.latitude, lng = room.longitude;
        const src = lat && lng
          ? `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`
          : room.address
            ? `https://www.google.com/maps?q=${encodeURIComponent(room.address)}&hl=en&z=15&output=embed`
            : null;
        return src ? (
          <div className={styles.mapContainer}>
            <iframe width="100%" height="400" src={src} style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Hotel location" />
          </div>
        ) : <p className={styles.placeholderText}>Location data is not available.</p>;
      }
      case 'reviews': return <p className={styles.placeholderText}>Only guests who have booked can leave a review.</p>;
      default: return null;
    }
  };

  return (
    <>
      <div className={styles.container}>
        {/* HEADER */}
        <section className={styles.headerSection}>
          <div className={styles.tagsContainer}>{room.tags?.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}</div>
          <div className={styles.titleRow}>
            <div className={styles.titleInfo}>
              <h1 className={styles.hotelName}>{room.name}</h1>
              <div className={styles.addressRow}><FiMapPin className={styles.locationIcon} /><span className={styles.address}>{room.address}</span></div>
            </div>
            <div className={styles.bookmarkSection}>
              <button className={styles.bookmarkBtn} onClick={handleBookmark}>
                <FiHeart className={`${styles.heartIcon} ${isBookmarked ? styles.bookmarked : ''}`} />
                Bookmark this listing
              </button>
            </div>
          </div>
        </section>


        {/* GALLERY */}
        <section className={styles.gallerySection}>
          <div className={styles.mainImageContainer}>
            <img src={room.images?.[0] || 'https://via.placeholder.com/800x450?text=No+Image'} alt="Main" className={styles.mainImage} onClick={() => handleImageClick(0)} />
          </div>
          <div className={styles.thumbnailsContainer}>
            <div className={styles.thumbnailGrid}>
              {(room.images || []).slice(1,5).map((img,i)=>(
                <div key={i} className={styles.thumbnailWrapper}>
                  <img src={img} alt={`Thumb ${i+1}`} className={styles.thumbnail} onClick={()=>handleImageClick(i+1)} />
                  {i===3 && <button className={styles.showAllBtn} onClick={()=>setSelectedImageIndex(0)}>Show all photos</button>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IMAGE MODAL */}
        {selectedImageIndex!==null && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={e=>e.stopPropagation()}>
              <button className={styles.closeModal} onClick={handleCloseModal}>×</button>
              <button className={styles.prevBtn} onClick={handlePrev}>‹</button>
              <img src={room.images?.[selectedImageIndex]||'https://via.placeholder.com/800x450?text=No+Image'} alt="Large" className={styles.modalImage} />
              <button className={styles.nextBtn} onClick={handleNext}>›</button>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className={styles.mainContent}>
          <section className={styles.tabsSection}>
            <nav className={styles.tabNav}>
              {['overview','gallery','pricing','video','location','reviews'].map(tab=>(
                <button key={tab} className={`${styles.tabButton} ${activeTab===tab?styles.activeTab:''}`} onClick={()=>setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </nav>
            <div className={styles.tabContent}>{renderTabContent()}</div>
          </section>

          {/* BOOKING WIDGET */}
          <aside className={styles.bookingWidget}>
            <div className={styles.bookingCard}>
              <div className={styles.priceSection}>
                <h3 className={styles.bookNowTitle}>Book Now</h3>
                <p className={styles.priceText}>Starts from RM{room.price} per day</p>
              </div>
              <div className={styles.bookingForm}>
                <div className={styles.dateInputs}>
                  <div className={styles.inputGroup}><label>Check-in</label><input type="date" className={styles.dateInput} value={checkIn} onChange={e=>setCheckIn(e.target.value)} /></div>
                  <div className={styles.inputGroup}><label>Check-out</label><input type="date" className={styles.dateInput} value={checkOut} onChange={e=>setCheckOut(e.target.value)} /></div>
                </div>
                <div className={styles.inputGroup}>
                    <label>Extra Services</label>
                      <BookingMultiSelect
                      value={selectedService}
                      onChange={setSelectedService}
                      services={services}
                    />
                  </div>

                <div className={styles.inputGroup}>
                  <label>Guests</label>
                  <div className={styles.guestCounter}>
                    <button type="button" onClick={handleDecrease} className={styles.counterBtn}>-</button>
                    <span className={styles.guestCount}>{guests}</span>
                    <button type="button" onClick={handleIncrease} className={styles.counterBtn}>+</button>
                  </div>
                </div>
                <button type="button" className={styles.bookNowBtn} onClick={handleBookNow} disabled={submitting}>
                  {submitting?'Checking...':'Book Now'}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* FEATURES */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            {['categories','rentalCategories','features','regions'].map(key=>(
              <div key={key} className={styles.featureGroup}>
                <h4 className={styles.featureTitle}>{key.charAt(0).toUpperCase()+key.slice(1).replace(/([A-Z])/g,' $1')}</h4>
                <div className={styles.featureList}>
                  {room.room_features?.[key]?.map((f,i)=>(
                    <div key={i} className={styles.featureItem}><FiCheck className={styles.checkIcon} />{f}</div>
                  ))??<p>No items.</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SIMILAR */}
        <section className={styles.similarSection}>
          <h3 className={styles.similarTitle}>Similar Stays</h3>
          {loadingSimilar?<p>Loading similar stays...</p>:similarRooms.length>0?(
            <div className={styles.similarGrid}>
              {similarRooms.slice(0,4).map(h=>(
                <RoomCard
                key={h.room_id}
                room={{
                  room_id: h.room_id,
                  room_name: h.room_name,
                  rate: h.rate,
                  image_url: h.image_url,
                  rating: h.rating,
                  hotel_name: h.hotel_name,
                  location: h.location
                }}
                isFavourite={Array.isArray(favourites) && favourites.includes(h.room_id)}
                isLoggedIn={!!user}
                onToggleFavourite={() => {
                  if (!user) {
                    alert('Please log in to save favourites');
                    return;
                  }
                  favourites.includes(h.room_id)
                    ? removeFavourite(h.room_id)
                    : addFavourite(h.room_id);
                }}
              />              
              ))}
            </div>
          ):<p className={styles.noSimilar}>No similar stays found.</p>}
        </section>
      </div>

      <Footer />
    </>
  );
}

export default RoomDetails;
