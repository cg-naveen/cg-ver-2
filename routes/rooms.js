import express from "express";
import pool from "../db.js";
const router = express.Router();

// Get all rooms with optional filters
router.get('/', async (req, res) => {
    try {
      const { state, category, guests, check_in, check_out } = req.query;

      let query = `
        SELECT 
          r.room_id, 
          r.room_name, 
          r.rate, 
          r.images->>0 AS image_url, 
          r.category, 
          r.max_guests, 
          r.rating, 
          h.name AS hotel_name, 
          CONCAT(h.town, ' | ', h.state) AS location
        FROM rooms r
        JOIN hotels h ON r.hotel_id = h.hotel_id
        WHERE r.availability_status = TRUE
      `;

      const params = [];

      if (state) {
        params.push(state);
        query += ` AND LOWER(h.state) = LOWER($${params.length})`;
      }

      if (category) {
        params.push(category);
        query += ` AND LOWER(r.category) = LOWER($${params.length})`;
      }

      if (guests) {
        params.push(parseInt(guests, 10));
        query += ` AND r.max_guests >= $${params.length}`;
      }

      if (check_in && check_out) {
        params.push(check_in, check_out);
        query += `
            AND r.room_id NOT IN (
                SELECT room_id
                FROM bookings
                WHERE check_in_date < $${params.length}
                AND check_out_date > $${params.length - 1}
            )
        `;
      }

      query += ` ORDER BY r.rating DESC;`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ message: 'Error fetching data' });
    }
});

// Get 4 cheapest rooms
router.get('/cheapest', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.room_id, r.room_name, r.rate, r.images->>0 AS image_url, r.rating, 
                   h.name AS hotel_name, CONCAT(h.town, ' | ', h.state) AS location
            FROM rooms r
            JOIN hotels h ON r.hotel_id = h.hotel_id
            WHERE r.availability_status = TRUE
            ORDER BY rate ASC
            LIMIT 4
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('error fetching data:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// Get rooms by state
router.get('/by-state/:state', async (req, res) => {
    try {
        const { state } = req.params;
        const result = await pool.query(
            `SELECT r.room_id, r.room_name, r.rate, r.images->>0 AS image_url, r.rating, 
                    h.name AS hotel_name, CONCAT(h.town, ' | ', h.state) AS location
             FROM rooms r
             JOIN hotels h ON r.hotel_id = h.hotel_id
             WHERE h.state = $1 AND r.availability_status = TRUE`,
            [state]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching hotel' });
    }
});

// Get rooms by hotel
router.get('/by-hotel/:hotel_id', async (req, res) => {
    try {
        const { hotel_id } = req.params;
        const result = await pool.query(
            `SELECT r.room_id, r.room_number, r.category, r.availability_status, r.room_features, r.room_name, r.rate, r.images->>0 AS image_url, r.max_guests, r.rating, 
                    h.name AS hotel_name, CONCAT(h.town, ' | ', h.state) AS location
             FROM rooms r
             JOIN hotels h ON r.hotel_id = h.hotel_id
             WHERE r.hotel_id = $1 AND r.availability_status = TRUE`,
            [hotel_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No rooms found' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching rooms' });
    }
});

// Get room by ID
router.get('/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;

        const result = await pool.query(`
            SELECT 
                r.room_id, 
                r.hotel_id, 
                r.room_name || ' - ' || h.name AS name,
                h.address, 
                h.video_url, 
                r.max_guests, 
                h.latitude, 
                h.longitude,
                r.rate AS price, 
                h.tags, 
                h.description, 
                r.images,
                r.room_features
            FROM rooms r
            JOIN hotels h ON r.hotel_id = h.hotel_id
            WHERE room_id = $1
        `, [room_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);-
        res.status(500).json({ message: 'error fetching room details' });
    }
});

// Add room
router.post('/', async (req, res) => {
    try {
      const {
        hotel_id,
        room_number,
        room_name,
        category,
        rate,
        availability_status,
        room_features,
        images,
        max_guests,
        rating
      } = req.body;

      const result = await pool.query(
        `INSERT INTO rooms
        (hotel_id, room_number, room_name, category, rate, availability_status, room_features, images, max_guests, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          hotel_id,
          room_number,
          room_name,
          category,
          rate,
          availability_status,
          JSON.stringify(room_features),
          JSON.stringify(images || []),
          max_guests,
          rating || 0
        ]
      );

      res.status(201).json({ message: 'Room added successfully', data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error adding room' });
    }
});

router.post('/by-ids', async (req, res) => {
    const { room_ids } = req.body;
  
    if (!Array.isArray(room_ids) || room_ids.length === 0) {
      return res.json({ rooms: [] });
    }
  
    try {
      const result = await pool.query(
        `
        SELECT 
  r.room_id,
  r.room_name,
  r.rate,
  r.images->>0 AS image_url,
  r.rating,
  h.name AS hotel_name,
  CONCAT(h.town, ' | ', h.state) AS location
FROM rooms r
JOIN hotels h ON r.hotel_id = h.hotel_id
WHERE r.room_id = ANY($1::uuid[])

        `,
        [room_ids]
      );
  
      res.json({ rooms: result.rows });
    } catch (err) {
      console.error('Error fetching rooms by ids:', err);
      res.status(500).json({ message: 'Failed to fetch favourite rooms' });
    }
  });  

// Update room
router.put('/:room_id', async (req, res) => {
    try {
      const { room_id } = req.params;
      const {
        room_number,
        room_name,
        category,
        rate,
        availability_status,
        room_features,
        images,
        max_guests,
        rating
      } = req.body;

      const result = await pool.query(
        `UPDATE rooms
        SET room_number = COALESCE($1, room_number),
            room_name = COALESCE($2, room_name),
            category = COALESCE($3, category),
            rate = COALESCE($4, rate),
            availability_status = COALESCE($5, availability_status),
            room_features = COALESCE($6, room_features),
            images = COALESCE($7, images),
            max_guests = COALESCE($8, max_guests),
            rating = COALESCE($9, rating),
            updated_at = NOW()
        WHERE room_id = $10
        RETURNING *`,
        [
          room_number,
          room_name,
          category,
          rate,
          availability_status,
          room_features ? JSON.stringify(room_features) : null,
          images ? JSON.stringify(images) : null,
          max_guests,
          rating,
          room_id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Room not found' });
      }

      res.json({ message: 'Room updated successfully', data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating room' });
    }
});

// Delete room
router.delete('/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;
        const result = await pool.query(
            `DELETE FROM rooms WHERE room_id = $1 RETURNING *`,
            [room_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({ message: 'Room deleted successfully', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting room' });
    }
});

export default router;
