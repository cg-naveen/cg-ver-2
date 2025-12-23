import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get('/users/me/profile');
      setUser(res.data.user);
      setFavourites(res.data.user?.favourites ?? []);
    } catch (err) {
      setUser(null);
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async ({ identifier, password }) => {
    const payload = { password };
    identifier.includes('@')
      ? payload.email = identifier
      : payload.username = identifier;

    const res = await api.post('/api/auth/login', payload);
    setUser(res.data.user);
    setFavourites(res.data.user?.favourites ?? []);
    return res.data;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    setFavourites([]);
  };

  const addFavourite = async (roomId) => {
    const res = await api.post('/users/add', { room_id: roomId });
    setFavourites(res.data.favourites);
  };

  const removeFavourite = async (roomId) => {
    const res = await api.post('/users/remove', { room_id: roomId });
    setFavourites(res.data.favourites);
  };

  const toggleFavourite = async (roomId) => {
    if (!user) return;
    const id = roomId.toString();

    favourites.includes(id)
      ? await removeFavourite(id)
      : await addFavourite(id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      favourites,
      login,
      logout,
      toggleFavourite
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

