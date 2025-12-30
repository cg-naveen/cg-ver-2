import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../api/axios";
import {
  formatCurrency,
  getStatusColor,
} from "./mockData";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);// Add these near the top with other useState
  const [occupancyDate, setOccupancyDate] = useState(new Date().toISOString().split("T")[0]);
  const [hotelFilter, setHotelFilter] = useState("all_time");
  const [stateFilter, setStateFilter] = useState("all_time");

 
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const [roomInventory, setRoomInventory] = useState({});
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [serviceBookings, setServiceBookings] = useState([]);
  const [loadingServiceBookings, setLoadingServiceBookings] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [refunds, setRefunds] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", iconName: "FiHome" },
    { id: "listings", label: "Listings", iconName: "FiKey" },
    { id: "services", label: "Services", iconName: "FiCalendar" },
    { id: "bookings", label: "Bookings", iconName: "FiUsers" },
    { id: "payments", label: "Payments", iconName: "FiCreditCard" },
    { id: "accounts", label: "Accounts", iconName: "FiBriefcase" },
    { id: "analytics", label: "Analytics", iconName: "FiBarChart2" }
  ];

  //dashboard--------------------------------------------
  const fetchDashboard = async ({ occupancyDate, hotelFilter, stateFilter } = {}) => {
    try {
      setLoadingDashboard(true);
      // Build query string
      const params = new URLSearchParams();
      if (occupancyDate) params.append("occupancyDate", occupancyDate);
      if (hotelFilter) params.append("hotelFilter", hotelFilter);
      if (stateFilter) params.append("stateFilter", stateFilter);
  
      const response = await api.get(`/api/admin/dashboard?${params.toString()}`);
      setDashboard(response.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setDashboard(null);
    } finally {
      setLoadingDashboard(false);
    }
  };
  
  useEffect(() => {
    fetchDashboard({ occupancyDate, hotelFilter, stateFilter });
  }, [occupancyDate, hotelFilter, stateFilter]);
  

  //Hotels-----------------------------------------------
  const fetchHotels = async () => {
    try {
      setLoadingHotels(true);
      const response = await api.get("/api/hotels");
      setHotels(response.data?.data ?? response.data ?? []);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    } finally {
      setLoadingHotels(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const addHotel = async hotelData => {
    try {
      const payload = { user_id: 1, ...hotelData };
      const response = await api.post("/api/hotels", payload);

      const newHotel = response.data?.data ?? response.data;

      if (newHotel) {
        setHotels(prev => [newHotel, ...prev]);
      } else {
        await fetchHotels();
      }
    } catch (err) {
      console.error("Error adding hotel:", err);
      throw err;
    }
  };

  const updateHotel = async (hotel_id, updatedData) => {
    try {
      const response = await api.put(`/api/hotels/${hotel_id}`, updatedData);
      const updated = response.data?.data ?? response.data;

      if (updated) {
        setHotels(prev =>
          prev.map(h => (h.hotel_id === hotel_id ? updated : h))
        );
      } else {
        await fetchHotels();
      }
    } catch (err) {
      console.error("Error updating hotel:", err);
      throw err;
    }
  };

  const removeHotel = async hotel_id => {
    try {
      await api.delete(`/api/hotels/${hotel_id}`);

      setHotels(prev => prev.filter(h => h.hotel_id !== hotel_id));

      setRoomInventory(prev => {
        const copy = { ...prev };
        delete copy[hotel_id];
        return copy;
      });
    } catch (err) {
      console.error("Error deleting hotel:", err);
      throw err;
    }
  };

  //Rooms-------------------------------------
  const fetchRoomsForHotel = async hotel_id => {
    if (!hotel_id) return [];

    try {
      setLoadingRooms(true);

      const response = await api.get(`/api/rooms/by-hotel/${hotel_id}`);
      const rooms = response.data?.data ?? response.data ?? [];

      setRoomInventory(prev => ({
        ...prev,
        [hotel_id]: rooms
      }));

      return rooms;
    } catch (err) {
      if (err.response?.status === 404) {
        setRoomInventory(prev => ({ ...prev, [hotel_id]: [] }));
        return [];
      }
      console.error("Error fetching rooms:", err);
      return [];
    } finally {
      setLoadingRooms(false);
    }
  };

  const addRoom = async (hotel_id, roomPayload) => {
    try {
      const {
        room_number,
        room_name,
        rate,
        category,
        max_guests,
        availability_status,
        room_features,
        images = []
      } = roomPayload;

      const payload = {
        hotel_id,
        room_number,
        room_name,
        rate,
        category,
        max_guests,
        availability_status:
          availability_status === true || availability_status === "true",
        room_features: {
          regions: room_features?.regions ?? [],
          features: room_features?.features ?? [],
          categories: room_features?.categories ?? [],
          rentalCategories: room_features?.rentalCategories ?? []
        },
        images
      };

      const response = await api.post("/api/rooms", payload);
      const newRoom = response.data?.data ?? response.data;

      await fetchRoomsForHotel(hotel_id);
      await fetchHotels();

      return newRoom;
    } catch (err) {
      console.error("Error adding room:", err);
      throw err;
    }
  };

  const updateRoom = async (room_id, hotel_id, roomPayload) => {
    try {
      const {
        room_number,
        room_name,
        rate,
        category,
        max_guests,
        availability_status,
        room_features
      } = roomPayload;

      const payload = {
        room_number,
        room_name,
        rate,
        category,
        max_guests,
        availability_status:
          availability_status === true || availability_status === "true",
        room_features
      };

      const response = await api.put(`/api/rooms/${room_id}`, payload);
      const updated = response.data?.data ?? response.data;

      await fetchRoomsForHotel(hotel_id);
      await fetchHotels();

      return updated;
    } catch (err) {
      console.error("Error updating room:", err);
      throw err;
    }
  };

  const removeRoom = async (room_id, hotel_id) => {
    try {
      await api.delete(`/api/rooms/${room_id}`);

      await fetchRoomsForHotel(hotel_id);
      await fetchHotels();
    } catch (err) {
      console.error("Error deleting room:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchServiceBookings();
  }, []);
  

  //Services------------------------------------------
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await api.get("/api/services");
      setServices(response.data?.data ?? response.data ?? []);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const addService = async newService => {
    try {
      const response = await api.post("/api/services", newService);
      const created = response.data?.data ?? response.data;

      setServices(prev => [...prev, created]);
      return { success: true };
    } catch (err) {
      console.error("Error adding service:", err);
      return { success: false };
    }
  };

  const updateService = async (id, updates) => {
    try {
      const response = await api.put(`/api/services/${id}`, updates);
      const updated = response.data?.data ?? response.data;

      setServices(prev =>
        prev.map(s => (s.service_id === id ? updated : s))
      );

      return { success: true };
    } catch (err) {
      console.error("Error updating service:", err);
      return { success: false };
    }
  };

  const deleteService = async id => {
    try {
      await api.delete(`/api/services/${id}`);
      setServices(prev => prev.filter(s => s.service_id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting service:", err);
      return { success: false };
    }
  };

  //servicebookings-------------------------------------
  const fetchServiceBookings = async () => {
    try {
      setLoadingServiceBookings(true);
  
      const response = await api.get("/api/bookings"); // returns { bookings: [...] }
      const bookings = response.data?.bookings ?? [];
  
      // Flatten services into individual entries
      const serviceData = bookings.flatMap(booking =>
        (booking.services || []).map(service => ({
          service_booking_id: service.service_booking_id,
          booking_id: booking.booking_id,
          first_name: booking.first_name,
          last_name: booking.last_name,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          service_name: service.service_name,
          quantity: service.quantity
        }))
      );
  
      setServiceBookings(serviceData);
    } catch (err) {
      console.error("Error fetching service bookings:", err);
      setServiceBookings([]);
    } finally {
      setLoadingServiceBookings(false);
    }
  };
  
  //Booking---------------------------------------------
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await api.get("/api/bookings");
      setBookings(response.data?.bookings ?? []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };
  
  const getBookingById = async booking_id => {
    if (!booking_id) return null;
    try {
      const response = await api.get(`/api/bookings/${booking_id}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching booking by ID:", err);
      return null;
    }
  };
  
  const addBooking = async bookingData => {
    try {
      const response = await api.post("/api/bookings", bookingData);
      const newBookingId = response.data?.booking_id;
      if (newBookingId) {
        await fetchBookings(); // refresh table
      }
      return response.data;
    } catch (err) {
      console.error("Error creating booking:", err);
      throw err;
    }
  };
  
  const updateBooking = async (booking_id, updatedData) => {
    try {
      const response = await api.put(`/api/bookings/${booking_id}`, updatedData);
      await fetchBookings(); // refresh table
      return response.data;
    } catch (err) {
      console.error("Error updating booking:", err);
      throw err;
    }
  };
  
  const checkOverlappingBookings = async (room_id, check_in, check_out) => {
    try {
      const response = await api.get("/api/bookings/overlap", {
        params: { room_id, check_in, check_out }
      });
      return response.data;
    } catch (err) {
      console.error("Error checking overlapping bookings:", err);
      return [];
    }
  };

  //payments-------------------------------------
  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await api.get("/api/payments");
  
      const normalised =
        Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
  
      setPayments(normalised);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };
  
  const getPaymentById = async payment_id => {
    try {
      const response = await api.get(`/api/payments/${payment_id}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching payment by ID:", err);
      return null;
    }
  };
  const addPayment = async paymentData => {
    try {
      const response = await api.post("/api/payments", paymentData);
      await fetchPayments();
      return response.data;
    } catch (err) {
      console.error("Error creating payment:", err);
      throw err;
    }
  };
  const updatePayment = async (payment_id, updatedData) => {
    try {
      const response = await api.put(`/api/payments/${payment_id}`, updatedData);
      await fetchPayments();
      return response.data;
    } catch (err) {
      console.error("Error updating payment:", err);
      throw err;
    }
  };
  const deletePayment = async payment_id => {
    try {
      await api.delete(`/api/payments/${payment_id}`);
      await fetchPayments();
    } catch (err) {
      console.error("Error deleting payment:", err);
      throw err;
    }
  };
  
  const fetchRefunds = async () => {
    try {
      setLoadingRefunds(true);
  
      const response = await api.get("/api/payments/refunds");
  
      const normalised =
        Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
  
      setRefunds(normalised);
    } catch (err) {
      console.error("Error fetching refunds:", err);
      setRefunds([]);
    } finally {
      setLoadingRefunds(false);
    }
  };
  

  const addRefund = async refundData => {
    try {
      const response = await api.post("/api/payments/refunds", refundData);
      await fetchRefunds();
      return response.data;
    } catch (err) {
      console.error("Error creating refund:", err);
      throw err;
    }
  };
  const updateRefundStatus = async (refund_id, status) => {
    try {
      const response = await api.put(`/api/payments/refunds/${refund_id}/status`, { status });
      await fetchRefunds();
      return response.data;
    } catch (err) {
      console.error("Error updating refund status:", err);
      throw err;
    }
  };
  const deleteRefund = async refund_id => {
    try {
      await api.delete(`/api/payments/refunds/${refund_id}`);
      await fetchRefunds();
    } catch (err) {
      console.error("Error deleting refund:", err);
      throw err;
    }
  };  
  useEffect(() => {
    fetchPayments();
    fetchRefunds();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        dashboard,
        loadingDashboard,
        fetchDashboard,
        occupancyDate,
      setOccupancyDate,
      hotelFilter,
      setHotelFilter,
      stateFilter,
      setStateFilter,

        hotels,
        loadingHotels,
        fetchHotels,
        addHotel,
        updateHotel,
        removeHotel,

        roomInventory,
        loadingRooms,
        fetchRoomsForHotel,
        addRoom,
        updateRoom,
        removeRoom,

        navigationItems,
        formatCurrency,
        getStatusColor,

        services,
        loadingServices,
        fetchServices,
        addService,
        updateService,
        deleteService,

        serviceBookings,
        loadingServiceBookings,
        fetchServiceBookings,

        bookings,
        loadingBookings,
        selectedBooking,
        setSelectedBooking,
        fetchBookings,
        getBookingById,
        addBooking,
        updateBooking,
        checkOverlappingBookings,

        payments,
        loadingPayments,
        fetchPayments,
        getPaymentById,
        addPayment,
        updatePayment,
        deletePayment,

        refunds,
        loadingRefunds,
        fetchRefunds,
        addRefund,
        updateRefundStatus,
        deleteRefund
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};