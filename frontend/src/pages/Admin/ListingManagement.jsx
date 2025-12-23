import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import { useAdmin } from './AdminContext';
import styles from './Admin.module.css';

export default function ListingManagement() {
  const {
    hotels,
    roomInventory,
    loadingHotels,
    loadingRooms,
    fetchRoomsForHotel,
    addHotel,
    updateHotel,
    removeHotel,
    addRoom,
    updateRoom,
    removeRoom,
    formatCurrency,
    getStatusColor
  } = useAdmin();

  const [listingAction, setListingAction] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All States');


  // rooms for currently selected hotel (safe fallback)
  const roomsForSelectedHotel = selectedHotel
    ? roomInventory[selectedHotel.hotel_id] ?? []
    : [];

  const handleHotelAction = (type, hotel = null) => {
    setListingAction(type);
    setSelectedHotel(hotel);
    setSelectedRoom(null);
    // when viewer asks to view rooms, fetch them
    if (type === 'viewRooms' && hotel?.hotel_id) {
      fetchRoomsForHotel(hotel.hotel_id).catch(() => { /* handled in context */ });
    }
  };

  const handleRoomAction = (type, hotel, room = null) => {
    setListingAction(type);
    setSelectedHotel(hotel);
    setSelectedRoom(room);
    // if editing a room, ensure room list loaded
    if (hotel?.hotel_id) fetchRoomsForHotel(hotel.hotel_id).catch(() => {});
  };

  // --- Hotel form submit (add / edit) ---
  const handleSaveHotel = async (e) => {
    e.preventDefault();
    const form = e.target;
    const hotelData = {
      name: form.name.value.trim(),
      town: form.town.value.trim(),
      state: form.state.value.trim(),
      address: form.address.value.trim(),
      latitude: form.latitude.value ? parseFloat(form.latitude.value) : null,
      longitude: form.longitude.value ? parseFloat(form.longitude.value) : null,
      description: form.description.value.trim(),
      tags: form.tags.value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length),
      video_url: form.video_url.value.trim()
    };

    try {
      if (listingAction === 'addHotel') {
        await addHotel(hotelData);
      } else if (listingAction === 'editHotel' && selectedHotel) {
        await updateHotel(selectedHotel.hotel_id, hotelData);
      }
      setListingAction(null);
      setSelectedHotel(null);
    } catch (err) {
      console.error('Error saving hotel:', err);
      // keep UI open for user to fix
    }
  };

  // --- Hotel delete ---
  const handleDeleteHotel = async () => {
    if (!selectedHotel) return;
    try {
      await removeHotel(selectedHotel.hotel_id);
      setListingAction(null);
      setSelectedHotel(null);
    } catch (err) {
      console.error('Error deleting hotel:', err);
    }
  };

  // --- Room add (form submit inside Add Room panel) ---
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!selectedHotel) return;
    const form = e.target;
    const roomPayload = {
        hotel_id: selectedHotel.hotel_id,
        room_number: form.room_number.value.trim(),
        room_name: form.room_name.value.trim(),
        category: form.category.value,
        rate: parseFloat(form.rate.value) || 0,
        availability_status: form.availability_status.value === 'true',
        max_guests: parseInt(form.max_guests.value, 10) || 1,
        room_features: {
            regions: form.region?.value ? form.region.value.split(',').map(s => s.trim()) : [],
            features: form.features?.value ? form.features.value.split(',').map(s => s.trim()) : [],
            categories: form.categories?.value ? form.categories.value.split(',').map(s => s.trim()) : [],
            rentalCategories: form.rentalCategories?.value ? form.rentalCategories.value.split(',').map(s => s.trim()) : []
          },
          images: []           
      };      

    try {
      await addRoom(selectedHotel.hotel_id, roomPayload);
      // reload rooms is handled by context
      setListingAction(null);
      setSelectedRoom(null);
    } catch (err) {
      console.error('Error adding room:', err);
    }
  };

  // --- Room edit submit ---
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!selectedHotel || !selectedRoom) return;
    const form = e.target;
    const updatedPayload = {
        hotel_id: selectedHotel.hotel_id,
        room_number: form.room_number.value.trim(),
        category: form.category.value,
        rate: parseFloat(form.rate.value) || 0,
        availability_status: form.availability_status.value === 'true',
        max_guests: parseInt(form.max_guests.value, 10) || 1,
        room_features: {
          regions: form.region?.value ? form.region.value.split(',').map(s => s.trim()) : [],
          features: form.features?.value ? form.features.value.split(',').map(s => s.trim()) : [],
          categories: form.categories?.value ? form.categories.value.split(',').map(s => s.trim()) : [],
          rentalCategories: form.rentalCategories?.value ? form.rentalCategories.value.split(',').map(s => s.trim()) : []
        },
        images: [] // keep empty for now or attach files
      };
      

    try {
      await updateRoom(selectedRoom.room_id, selectedHotel.hotel_id, updatedPayload);
      setListingAction(null);
      setSelectedRoom(null);
    } catch (err) {
      console.error('Error updating room:', err);
    }
  };

  // --- Room delete ---
  const handleDeleteRoom = async () => {
    if (!selectedHotel || !selectedRoom) return;
    try {
      await removeRoom(selectedRoom.room_id, selectedHotel.hotel_id);
      setListingAction(null);
      setSelectedRoom(null);
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  const safeTags = Array.isArray(selectedHotel?.tags)
    ? selectedHotel.tags.join(', ')
    : typeof selectedHotel?.tags === 'string'
      ? selectedHotel.tags
      : '';
  const filteredHotels = hotels.filter(hotel => {
  const matchesName = hotel.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesState = filterState === 'All States' || hotel.state === filterState;
  return matchesName && matchesState;
      });
      

  return (
    <div className={styles.roomsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Listing Management</h2>
        <button className={styles.addButton} onClick={() => handleHotelAction('addHotel')}>
          <FiPlus size={18} /> Add Hotel
        </button>
      </div>

      <div className={styles.filtersBar}>
  <div className={styles.searchBox}>
    <FiSearch size={18} />
    <input type="text" placeholder="Search hotels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
  </div>

  <select className={styles.filterSelect} value={filterState} onChange={(e) => setFilterState(e.target.value)}>
    <option>All States</option>
    {[...new Set(filteredHotels.map(h => h.state))].map(state => (
      <option key={state}>{state}</option>
    ))}
  </select>
  </div>


      <div className={styles.tableContainer}>
        <table className={styles.roomsTable}>
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Town</th>
              <th>State</th>
              <th>Number of Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map((hotel, index) => (
              <motion.tr key={hotel.hotel_id || hotel.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                <td>
                  <div className={styles.bookingInfo}>
                    <span className={styles.guestName}>{hotel.name}</span>
                    <span className={styles.roomNumber}>ID: {hotel.hotel_id ?? hotel.id}</span>
                  </div>
                </td>
                <td>{hotel.town}</td>
                <td>{hotel.state}</td>
                <td>{hotel.room_count ?? hotel.num_of_room ?? 0}</td>
                <td>
                  <div className={styles.actionButtonsRow}>
                    <button className={styles.actionButton} onClick={() => handleHotelAction('editHotel', hotel)}><FiEdit size={14} /></button>
                    <button className={styles.actionButton} onClick={() => handleHotelAction('deleteHotel', hotel)}><FiTrash2 size={14} /></button>
                    <button className={styles.actionButton} onClick={() => handleHotelAction('viewRooms', hotel)}><FiEye size={14} /></button>
                    <button className={styles.actionButton} onClick={() => handleHotelAction('addRoom', hotel)}><FiPlus size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Hotel */}
      {listingAction === 'editHotel' && selectedHotel && (
        <div className={styles.settingsCard}>
          <h3>Edit Hotel — {selectedHotel.name}</h3>
          <form className={styles.settingsForm} onSubmit={handleSaveHotel}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Name</label>
                <input type="text" name="name" defaultValue={selectedHotel.name} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Town</label>
                <input type="text" name="town" defaultValue={selectedHotel.town} />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="state">State</label>
                    <select name="state" id="state" defaultValue={selectedHotel.state}>
                        <option value="">Select a state</option>
                        <option value="Johor">Johor</option>
                        <option value="Kedah">Kedah</option>
                        <option value="Kelantan">Kelantan</option>
                        <option value="Melaka">Melaka</option>
                        <option value="Negeri Sembilan">Negeri Sembilan</option>
                        <option value="Pahang">Pahang</option>
                        <option value="Perak">Perak</option>
                        <option value="Perlis">Perlis</option>
                        <option value="Pulau Pinang">Pulau Pinang</option>
                        <option value="Sabah">Sabah</option>
                        <option value="Sarawak">Sarawak</option>
                        <option value="Selangor">Selangor</option>
                        <option value="Terengganu">Terengganu</option>
                        <option value="Wilayah Persekutuan Kuala Lumpur"> Wilayah Persekutuan Kuala Lumpur </option>
                        <option value="Wilayah Persekutuan Labuan"> Wilayah Persekutuan Labuan </option>
                        <option value="Wilayah Persekutuan Putrajaya"> Wilayah Persekutuan Putrajaya </option>
                    </select>
                </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Address</label>
              <textarea name="address" defaultValue={selectedHotel.address} />
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Latitude</label>
                <input type="text" name="latitude" defaultValue={selectedHotel.latitude} />
              </div>
              <div className={styles.inputGroup}>
                <label>Longitude</label>
                <input type="text" name="longitude" defaultValue={selectedHotel.longitude} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea name="description" defaultValue={selectedHotel.description} />
            </div>

            <div className={styles.inputGroup}>
              <label>Tags</label>
              <input type="text" name="tags" defaultValue={safeTags} />
            </div>

            <div className={styles.inputGroup}>
              <label>Video URL</label>
              <input type="text" name="video_url" defaultValue={selectedHotel.video_url || ''} />
            </div>

            <button className={styles.saveButton} type="submit">Save Hotel</button>
          </form>
        </div>
      )}

      {/* Delete Hotel */}
      {listingAction === 'deleteHotel' && selectedHotel && (
        <div className={styles.settingsCard}>
          <h3>Delete Hotel</h3>
          <p>If you delete this hotel, all listing rooms from this hotel will also be deleted.</p>
          <div className={styles.actionButtons}>
            <button className={styles.addButton} onClick={handleDeleteHotel}>Continue</button>
            <button className={styles.actionButton} onClick={() => setListingAction(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* View Rooms */}
      {listingAction === 'viewRooms' && selectedHotel && (
        <div className={styles.settingsCard}>
          <h3>Rooms — {selectedHotel.name}</h3>
          {loadingRooms ? <p>Loading rooms...</p> : (
            <div className={styles.tableContainer}>
              <table className={styles.roomsTable}>
                <thead>
                  <tr>
                    <th>Room</th><th>Rate</th><th>Availability</th><th>Pax</th><th>Category</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomsForSelectedHotel.map(room => (
                    <tr key={room.room_id || room.id}>
                      <td>{room.room_name} ({room.room_number})</td>
                      <td>{formatCurrency(room.rate)}</td>
                      <td>
                        <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(room.availability_status ? 'active' : 'pending') }}>
                          {room.availability_status ? 'True' : 'False'}
                        </span>
                      </td>
                      <td>{room.max_guests}</td>
                      <td>{room.category}</td>
                      <td>
                        <div className={styles.actionButtonsRow}>
                          <button className={styles.actionButton} onClick={() => handleRoomAction('editRoom', selectedHotel, room)}><FiEdit size={14} /></button>
                          <button className={styles.actionButton} onClick={() => handleRoomAction('deleteRoom', selectedHotel, room)}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button className={styles.addButton} onClick={() => handleRoomAction('addRoom', selectedHotel)}>
            <FiPlus size={18} /> Add Room
          </button>
        </div>
      )}

      {/* Add Hotel */}
{listingAction === 'addHotel' && (
  <div className={styles.settingsCard}>
    <h3>Add Hotel</h3>
    <form className={styles.settingsForm} id="addHotelForm">
        <div className={styles.inputGroup}>
          <label>Name</label>
          <input type="text" name="Hotel Name" placeholder="Hotel name" required />
        </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Town</label>
          <input type="text" name="town" />
        </div>
            <div className={styles.inputGroup}>
                <label htmlFor="state">State</label>
                    <select name="state" id="state">
                        <option value="">Select a state</option>
                        <option value="Johor">Johor</option>
                        <option value="Kedah">Kedah</option>
                        <option value="Kelantan">Kelantan</option>
                        <option value="Melaka">Melaka</option>
                        <option value="Negeri Sembilan">Negeri Sembilan</option>
                        <option value="Pahang">Pahang</option>
                        <option value="Perak">Perak</option>
                        <option value="Perlis">Perlis</option>
                        <option value="Pulau Pinang">Pulau Pinang</option>
                        <option value="Sabah">Sabah</option>
                        <option value="Sarawak">Sarawak</option>
                        <option value="Selangor">Selangor</option>
                        <option value="Terengganu">Terengganu</option>
                        <option value="Wilayah Persekutuan Kuala Lumpur">
                            Wilayah Persekutuan Kuala Lumpur
                        </option>
                        <option value="Wilayah Persekutuan Labuan">
                            Wilayah Persekutuan Labuan
                        </option>
                        <option value="Wilayah Persekutuan Putrajaya">
                            Wilayah Persekutuan Putrajaya
                        </option>
                    </select>
                </div>
            </div>
      <div className={styles.inputGroup}>
        <label>Address</label>
        <textarea name="address" placeholder="Full address" />
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Latitude</label>
          <input type="text" name="latitude" />
        </div>
        <div className={styles.inputGroup}>
          <label>Longitude</label>
          <input type="text" name="longitude" />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Description</label>
        <textarea name="description" placeholder="Short description" />
      </div>

      <div className={styles.inputGroup}>
        <label>Tags</label>
        <input type="text" name="tags" placeholder="premium, urban, business" />
      </div>

      <div className={styles.inputGroup}>
        <label>Video URL</label>
        <input type="text" name="video_url" placeholder="https://" />
      </div>

      {!confirming && (
        <button
          className={styles.saveButton}
          type="button"
          onClick={() => setConfirming(true)}
        >
          Add Hotel
        </button>
      )}

      {confirming && (
        <div className={styles.actionButtons}>
          <p>“Are you confirming all details for this hotel to be added?”</p>
          <button
            className={styles.addButton}
            type="button"
            onClick={async () => {
              const form = document.getElementById('addHotelForm');

              // Safe extraction of values
              const hotelData = {
                name: form.name?.value?.trim() || '',
                town: form.town?.value?.trim() || '',
                state: form.state?.value?.trim() || '',
                address: form.address?.value?.trim() || '',
                latitude: form.latitude?.value ? parseFloat(form.latitude.value) : null,
                longitude: form.longitude?.value ? parseFloat(form.longitude.value) : null,
                description: form.description?.value?.trim() || '',
                tags: form.tags?.value
                  ? form.tags.value.split(',').map(t => t.trim()).filter(t => t.length)
                  : [],
                video_url: form.video_url?.value?.trim() || ''
              };

              try {
                await addHotel(hotelData);
                setListingAction(null);
                setConfirming(false);
              } catch (err) {
                console.error('Error adding hotel:', err);
              }
            }}
            disabled={loadingHotels}
          >
            Continue
          </button>

          <button
            className={styles.actionButton}
            type="button"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  </div>
)}

      {/* Add Room */}
      {listingAction === 'addRoom' && selectedHotel && (
        <div className={styles.settingsCard}>
          <h3>Add Room for {selectedHotel.name}</h3>
          <form className={styles.settingsForm} onSubmit={handleSaveRoom}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Room Number</label>
                <input type="text" name="room_number" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Room Name</label>
                <input type="text" name="room_name" required />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Rate</label>
                <input type="number" name="rate" step="0.01" />
              </div>
              <div className={styles.inputGroup}>
                <label>Max Guests</label>
                <input type="number" name="max_guests" min="1" />
              </div>
            </div>

            <div className={styles.formRow}>
            <div className={styles.inputGroup}>
                <label htmlFor="category">Category</label>
                <select name="category" id="category">
                    <option value="">Select category</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Budget">Budget</option>
                </select>
            </div>

              <div className={styles.inputGroup}>
                <label>Availability</label>
                <select name="availability_status">
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Regions</label>
              <input type="text" name="region" />
            </div>

            <div className={styles.inputGroup}>
              <label>Features</label>
              <input type="text" name="features" />
            </div>

            <div className={styles.inputGroup}>
              <label>Categories</label>
              <input type="text" name="categories" />
            </div>

            <div className={styles.inputGroup}>
              <label>Rental Categories</label>
              <input type="text" name="rentalCategories" />
            </div>

            <button className={styles.saveButton} type="submit">Add Room</button>
          </form>
        </div>
      )}

      {/* Edit Room */}
      {listingAction === 'editRoom' && selectedHotel && selectedRoom && (
        <div className={styles.settingsCard}>
          <h3>Edit Room — {selectedRoom.room_name}</h3>
          <form className={styles.settingsForm} onSubmit={handleUpdateRoom}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Room Name</label>
                <input type="text" name="room_name" defaultValue={selectedRoom.room_name} />
              </div>
              <div className={styles.inputGroup}>
                <label>Room Number</label>
                <input type="text" name="room_number" defaultValue={selectedRoom.room_number} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Rate</label>
                <input type="number" name="rate" defaultValue={selectedRoom.rate} step="0.01" />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="category">Category</label>
                <select name="category" id="category" defaultValue={selectedRoom.category}>
                    <option value="">Select category</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Budget">Budget</option>
                </select>
            </div>

            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Max Guests</label>
                <input type="number" name="max_guests" defaultValue={selectedRoom.max_guests} />
              </div>
              <div className={styles.inputGroup}>
              <label>Availability</label>
              <select name="availability_status" defaultValue={selectedRoom.availability_status ? 'true' : 'false'}>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Regions</label>
              <input type="text" name="region" defaultValue={(selectedRoom.room_features?.regions|| []).join(', ')} />
            </div>

            <div className={styles.inputGroup}>
              <label>Features</label>
              <input type="text" name="features" defaultValue={(selectedRoom.room_features?.features || []).join(', ')} />
            </div>

            <div className={styles.inputGroup}>
              <label>Categories</label>
              <input type="text" name="categories" defaultValue={(selectedRoom.room_features?.categories || []).join(', ')} />
            </div>

            <div className={styles.inputGroup}>
              <label>Rental Categories</label>
              <input type="text" name="rentalCategories" defaultValue={(selectedRoom.room_features?.rentalCategories || []).join(', ')} />
            </div>

            <button className={styles.saveButton} type="submit">Save Changes</button>
          </form>
        </div>
      )}

       {/* Delete Room */}
       {listingAction === 'deleteRoom' && selectedHotel && selectedRoom && (
        <div className={styles.settingsCard}>
          <h3>Delete Room</h3>
          <p>Are you sure you want to delete {selectedRoom.room_name} from {selectedHotel.name}?</p>

          <div className={styles.actionButtons}>
            <button className={styles.addButton} onClick={handleDeleteRoom}>Confirm</button>
            <button className={styles.actionButton} onClick={() => setListingAction(null)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}
