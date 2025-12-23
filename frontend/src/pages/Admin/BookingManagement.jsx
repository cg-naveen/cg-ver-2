import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiPlus, FiEdit, FiEye, FiSearch } from 'react-icons/fi';
import { useAdmin } from './AdminContext';
import styles from './Admin.module.css';
import BookingMultiSelect from '../../components/BookingMultiSelect';

export default function BookingManagement() {
  const {
    hotels,
    roomInventory,
    fetchRoomsForHotel,
    bookings ,
    fetchBookings,
    checkOverlappingBookings,
    services,
    updateBooking,
    addBooking,
    getStatusColor
  } = useAdmin();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [editFormData, setEditFormData] = useState({});
  const [addFormData, setAddFormData] = useState({});

  const [roomsOptions, setRoomsOptions] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const safe = v => (v ? v.toString().toLowerCase() : "");

  const filteredBookings = bookings.filter(b => {
    const search = safe(searchText);
  
    const matchSearch =
      safe(b.first_name).includes(search) ||
      safe(b.last_name).includes(search) ||
      safe(b.booking_id).includes(search) ||
      safe(b.hotel_name).includes(search) ||
      safe(b.room_name).includes(search);
  
    const matchStatus =
      statusFilter === "All Status" || b.booking_status === statusFilter;
  
    return matchSearch && matchStatus;
  });

  const allRooms = Object.values(roomInventory).flat();

  // derive roomsOptions (you already do this), then compute selected rooms safely:
  const selectedRoom = roomsOptions.find(r => String(r.room_id) === String(addFormData.room_id));
  const selectedEditRoom = roomsOptions.find(r => String(r.room_id) === String(editFormData.room_id));

  function calculateNights(start, end) {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1) || isNaN(d2)) return 1;
    return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  }

  function calcTotal(room, check_in, check_out, selected_services = [], servicesMaster = []) {
    // Room
    const nights = calculateNights(check_in, check_out);
    const rate = Number(room?.rate ?? 0);
    const roomTotal = rate * nights;
    // Services
    let servicesTotal = 0;
    for (const item of Array.isArray(selected_services) ? selected_services : []) {
      const svc = typeof item === 'object'
        ? (servicesMaster.find(s => s.service_name === item.name || s.service_name === item.service_name)
          || {})
        : {};
      const price = Number(item.price ?? svc.price ?? 0);
      const quantity = Number(item.quantity || 1);
      servicesTotal += price * quantity;
    }
    return roomTotal + servicesTotal;
  }

  const updateGuests = delta => {
      setAddFormData(prev => {
        const current = Number(prev.num_guests || 1);
        const next = current + Number(delta);
    
        if (next < 1) return prev;
    
        const max = Number(selectedRoom?.max_guests ?? Infinity);
        if (next > max) {
          alert(`Maximum guests for this room is ${max}`);
          return prev;
        }
    
        return { ...prev, num_guests: next };
      });
    };
    
    const updateEditGuests = delta => {
      setEditFormData(prev => {
        const current = Number(prev.num_guests || 1);
        const next = current + Number(delta);
    
        if (next < 1) return prev;
    
        const max = Number(selectedEditRoom?.max_guests ?? Infinity);
        if (next > max) {
          alert(`Maximum guests for this room is ${max}`);
          return prev;
        }
    
        return { ...prev, num_guests: next };
      });
    };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    async function loadRooms() {
      const allRooms = [];
  
      for (const hotel of hotels) {
        const rooms = await fetchRoomsForHotel(hotel.hotel_id);
        rooms.forEach(room => {
          allRooms.push({
            ...room,
            label: `${hotel.name} | ${room.room_name}`
          });
        });
      }
  
      setRoomsOptions(allRooms);
    }
  
    if (hotels.length > 0) loadRooms();
  }, [hotels]);  

  const handleAddChange = e => {
    const { name, value } = e.target;
  
    setAddFormData(prev => {
      // if it's the room select, set num_guests to 1 or clamp to max
      if (name === 'room_id') {
        const room = roomsOptions.find(r => String(r.room_id) === String(value));
        const max = room ? Number(room.max_guests ?? Infinity) : Infinity;
        const initial = Math.min(1, max); // 1 normally, but never exceed max
        return { ...prev, [name]: value, num_guests: initial };
      }
  
      // Otherwise keep existing fields; ensure num_guests remains a number
      if (name === 'num_guests') {
        return { ...prev, [name]: Number(value) || 1 };
      }
  
      return { ...prev, [name]: value };
    });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
  
    setEditFormData(prev => {
      if (name === 'room_id') {
        const room = roomsOptions.find(r => String(r.room_id) === String(value));
        const max = room ? Number(room.max_guests ?? Infinity) : Infinity;
        const initial = Math.min(1, max);
        return { ...prev, [name]: value, num_guests: initial };
      }
  
      if (name === 'num_guests') {
        return { ...prev, [name]: Number(value) || 1 };
      }
  
      return { ...prev, [name]: value };
    });
  };

  const addFormTotalPrice = useMemo(() =>
    calcTotal(selectedRoom, addFormData.check_in_date, addFormData.check_out_date, addFormData.selected_services, services),
    [selectedRoom, addFormData.check_in_date, addFormData.check_out_date, addFormData.selected_services, services]
  );
  const editFormTotalPrice = useMemo(() =>
    calcTotal(selectedEditRoom, editFormData.check_in_date, editFormData.check_out_date, editFormData.selected_services, services),
    [selectedEditRoom, editFormData.check_in_date, editFormData.check_out_date, editFormData.selected_services, services]
  );

  // Ensure add/edit submit includes the calculated total price
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.room_id || !addFormData.check_in_date || !addFormData.check_out_date) {
      alert("Room and dates are required.");
      return;
    }
    const bookingData = {
      ...addFormData,
      total_price: addFormTotalPrice,
      selected_services: (addFormData.selected_services || []).map(s => ({
        service_id: s.service_id,
        quantity: s.quantity
      }))
      
    };    
    const overlaps = await checkOverlappingBookings(
      bookingData.room_id,
      bookingData.check_in_date,
      bookingData.check_out_date
    );
    if (overlaps.length > 0) {
      alert(
        "This room is already booked for that period.\n\n" +
          overlaps
            .map(o => {
              const start = o.check_in_date?.split("T")[0] ?? "?";
              const end = o.check_out_date?.split("T")[0] ?? "?";
              return `Booking ${o.booking_id}: ${start} to ${end}`;
            })
            .join("\n")
      );
      return;
    }
    try {
      await addBooking(bookingData);
      alert("Booking created successfully.");
      setShowAdd(false);
      setAddFormData({});
    } catch (err) {
      console.error(err);
      alert("Error creating booking.");
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.room_id || !editFormData.check_in_date || !editFormData.check_out_date) {
      alert("Room and dates are required.");
      return;
    }
    const bookingData = {
      ...editFormData,
      total_price: editFormTotalPrice,
      selected_services: (editFormData.selected_services || []).map(s => ({
        service_id: s.service_id,
        quantity: s.quantity
      }))
      
    };    
    await updateBooking(selectedBooking.booking_id, bookingData);
  };

  // Open edit panel
  const openEdit = booking => {
    setSelectedBooking(booking);

    // Convert booking services to { name, quantity } format
    const servicesWithQty = (booking.services || []).map(s => {
      if (typeof s === 'object') {
        const service_id = s.service_id;
        const name = s.service_name || s.name || s.label;
        const quantity = Number(s.quantity || s.service_quantity || 1);
        if (name && service_id) {
          return {
            service_id,
            name,
            quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1
          };
        }
      } else if (typeof s === 'string') {
        return { name: s, quantity: 1 };
      }
      return null;
    }).filter(Boolean);
    

    setEditFormData({
      room_id: booking.room_id,
      first_name: booking.first_name,
      last_name: booking.last_name,
      email: booking.email,
      phone_number: booking.phone_number,
      age: booking.age,
      hotel_name: booking.hotel_name,
      room_name: booking.room_name,
      check_in_date: booking.check_in_date?.split('T')[0],
      check_out_date: booking.check_out_date?.split('T')[0],
      num_guests: booking.num_guests,
      total_price: booking.total_price,
      selected_services: servicesWithQty,
      message: booking.message,
      booking_status: booking.booking_status
    });
    setShowEdit(true);
    setShowView(false);
    setShowAdd(false);
  };

  // Open view panel
  const openView = booking => {
    setSelectedBooking(booking);
    setShowView(true);
    setShowEdit(false);
    setShowAdd(false);
  };

  return (
    <div className={styles.bookingsContent}>
      {/* HEADER */}
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Booking Management</h2>
        <button
          className={styles.addButton}
          onClick={() => {
            setSelectedBooking(null);
            setShowAdd(true);
            setShowView(false);
            setShowEdit(false);
            setAddFormData({});
          }}
        >
          <FiPlus size={18} />
          Create Manual Booking
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch size={18} />
          <input type="text" placeholder="Search by guest, hotel, room or booking ID..."  onChange={e => setSearchText(e.target.value)}/>
        </div>
        <select className={styles.filterSelect} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>Pending Payment</option>
          <option>Complete</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* BOOKINGS TABLE */}
      <div className={styles.tableContainer}>
        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest</th>
              <th>Hotel / Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total (RM)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking.booking_id}>
                <td>{booking.booking_id}</td>
                <td>{booking.first_name} {booking.last_name}</td>
                <td>
                  {booking.hotel_name}<br />
                  {booking.room_name}
                </td>
                <td>{booking.check_in_date?.split('T')[0]}</td>
                <td>{booking.check_out_date?.split('T')[0]}</td>
                <td>{booking.num_guests}</td>
                <td>{booking.total_price}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(booking.booking_status) }}
                  >
                    {booking.booking_status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtonsRow}>
                    <button
                      className={styles.actionButton}
                      onClick={() => openView(booking)}
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => openEdit(booking)}
                    >
                      <FiEdit size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW PANEL */}
      {selectedBooking && showView && (
        <div className={styles.settingsCard}>
          <h3>Booking Details — {selectedBooking.booking_id}</h3>
          <div className={styles.detailsBox}>
            <p><strong>Guest:</strong> {selectedBooking.first_name} {selectedBooking.last_name}</p>
            <p><strong>Email:</strong> {selectedBooking.email || '-'}</p>
            <p><strong>Phone:</strong> {selectedBooking.phone_number}</p>
            <p><strong>Age:</strong> {selectedBooking.age || '-'}</p>
            <p><strong>Hotel:</strong> {selectedBooking.hotel_name}</p>
            <p><strong>Room:</strong> {selectedBooking.room_name}</p>
            <p><strong>Check-in:</strong> {selectedBooking.check_in_date?.split('T')[0]}</p>
            <p><strong>Check-out:</strong> {selectedBooking.check_out_date?.split('T')[0]}</p>
            <p><strong>Guests:</strong> {selectedBooking.num_guests}</p>
            <p><strong>Services:</strong>{' '}
              {(selectedBooking.services || []).map(s => {
                const name = s.service_name || s.name || s.label || s;
                const qty = s.quantity || s.service_quantity || 1;
                return qty > 1 ? `${name} (x${qty})` : name;
              }).join(', ')}
            </p>
            <p><strong>Total (RM):</strong> {selectedBooking.total_price}</p>
            <p><strong>Message:</strong> {selectedBooking.message || '-'}</p>
            <p><strong>Status:</strong> {selectedBooking.booking_status}</p>
          </div>
        </div>
      )}

      {/* EDIT PANEL */}
      {selectedBooking && showEdit && (
        <div className={styles.settingsCard}>
          <h3>Edit Booking — {selectedBooking.booking_id}</h3>
          <form className={styles.settingsForm} onSubmit={handleEditSubmit}>
            <div className={styles.inputGroup}>
              <label>Room</label>
              <select
                name="room_id"
                value={editFormData.room_id || ""}
                onChange={handleEditChange}
              >
                <option value="">Select room</option>
                {roomsOptions.map(r => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={editFormData.first_name || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={editFormData.last_name || ""}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={editFormData.phone_number || ""}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={editFormData.age || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Guests</label>
                <div className={styles.counter}>
                  <button type="button" onClick={() => updateEditGuests(-1)}>-</button>
                  <span>{editFormData.num_guests || 1}</span>
                  <button
                    type="button"
                    onClick={() => updateEditGuests(1)}
                    disabled={selectedEditRoom && Number(editFormData.num_guests || 1) >= Number(selectedEditRoom.max_guests ?? Infinity)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Services</label>
              <BookingMultiSelect
  value={editFormData.selected_services || []}
  onChange={vals => {
    setEditFormData(prev => {
      // Keep existing service_ids if present
      const merged = vals.map(v => {
        if (v.service_id) return v; // already has id
        // Find matching service in prev list to get id
        const existing = prev.selected_services?.find(s => s.name === v.name);
        return {
          ...v,
          service_id: existing?.service_id
        };
      });
      return { ...prev, selected_services: merged };
    });
  }}
/>

            </div>

            <div className={styles.inputGroup}>
              <label>Total Price (RM)</label>
              <div style={{ fontWeight: 700, color: "#2B615F", fontSize: "1.15em" }}>
                RM {editFormTotalPrice.toFixed(2)}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Message</label>
              <input
                type="text"
                name="message"
                value={editFormData.message || ""}
                onChange={handleEditChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Status</label>
              <select
                name="booking_status"
                value={editFormData.booking_status || ""}
                onChange={handleEditChange}
              >
                <option>Pending Payment</option>
                <option>Complete</option>
                <option>Cancelled</option>
              </select>
            </div>

            <button type="submit" className={styles.saveButton}>Save Booking</button>
          </form>
        </div>
      )}

      {/* ADD PANEL */}
      {showAdd && (
        <div className={styles.settingsCard}>
          <h3>Create Manual Booking</h3>
          <form className={styles.settingsForm} onSubmit={handleAddSubmit}>
            <div className={styles.inputGroup}>
              <label>Room</label>
              <select
                name="room_id"
                value={addFormData.room_id || ""}
                onChange={handleAddChange}
                required
              >
                <option value="">Select room</option>
                {roomsOptions.map(r => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={addFormData.first_name || ""}
                  onChange={handleAddChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={addFormData.last_name || ""}
                  onChange={handleAddChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Check-in</label>
                <input
                  type="date"
                  name="check_in_date"
                  value={addFormData.check_in_date || ""}
                  onChange={handleAddChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Check-out</label>
                <input
                  type="date"
                  name="check_out_date"
                  value={addFormData.check_out_date || ""}
                  onChange={handleAddChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={addFormData.email || ""}
                  onChange={handleAddChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input
                  type="text"
                  name="phone_number"
                  value={addFormData.phone_number || ""}
                  onChange={handleAddChange}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={addFormData.age || ""}
                  onChange={handleAddChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Guests</label>
                <div className={styles.counter}>
                  <button type="button" onClick={() => updateGuests(-1)}>-</button>
                  <span>{addFormData.num_guests || 1}</span>
                  <button
                    type="button"
                    onClick={() => updateGuests(1)}
                    disabled={selectedRoom && Number(addFormData.num_guests || 1) >= Number(selectedRoom.max_guests ?? Infinity)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Services</label>
              <BookingMultiSelect
                value={addFormData.selected_services || []}
                onChange={vals =>
                  setAddFormData(prev => ({ ...prev, selected_services: vals }))
                }
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Total Price (RM)</label>
              <div style={{ fontWeight: 700, color: "#2B615F", fontSize: "1.15em" }}>
                RM {addFormTotalPrice.toFixed(2)}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Message</label>
              <input
                type="text"
                name="message"
                value={addFormData.message || ""}
                onChange={handleAddChange}
              />
            </div>

            <div className={styles.actionButtons}>
              <button type="submit" className={styles.addButton}>Submit</button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
