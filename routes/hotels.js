import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                h.*, 
                COUNT(r.room_id) AS room_count
            FROM hotels h
            LEFT JOIN rooms r ON h.hotel_id = r.hotel_id
            GROUP BY h.hotel_id
            ORDER BY h.hotel_id DESC;
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching data' });
    }
});


// add new hotel
router.post('/', async (req, res) => {
    try {
        const {
            user_id = null,
            name,
            town,
            state,
            address,
            latitude,
            longitude,
            description,
            tags,
            video_url
        } = req.body;

        const result = await pool.query(
            `INSERT INTO hotels 
            (name, town, state, address, latitude, longitude, description, tags, video_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                name,
                town,
                state,
                address,
                latitude,
                longitude,
                description || null,
                Array.isArray(tags) ? tags : [],   
                video_url || null
            ]
        );

        res.status(201).json({
            message: 'Hotel added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding hotel' });
    }
});


// update hotel details
router.put('/:hotel_id', async (req, res) => {
    try {
        const { hotel_id } = req.params;

        const {
            name,
            town,
            state,
            address,
            latitude,
            longitude,
            description,
            tags,
            video_url
        } = req.body;

        await pool.query(
            `UPDATE hotels
            SET 
                name = COALESCE($1, name),
                town = COALESCE($2, town),
                state = COALESCE($3, state),
                address = COALESCE($4, address),
                latitude = COALESCE($5, latitude),
                longitude = COALESCE($6, longitude),
                description = COALESCE($7, description),
                tags = COALESCE($8, tags),
                video_url = COALESCE($9, video_url),
                updated_at = NOW()
            WHERE hotel_id = $10
            RETURNING *`,
            [
                name,
                town,
                state,
                address,
                latitude,
                longitude,
                description,
                Array.isArray(tags) ? tags : [],
                video_url,
                hotel_id
            ]
        );


        //fetch result
        const result = await pool.query(`
            SELECT
                    h.*,
                    COUNT(r.room_id) :: int AS room_count
                    FROM hotels h
                    LEFT JOIN rooms r ON h.hotel_id = r.hotel_id
                    WHERE h.hotel_id = $1
                    GROUP BY h.hotel_id`
                , [hotel_id]);
                
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json({
            message: 'Hotel updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating hotel' });
    }
});

// delete a hotel
router.delete('/:hotel_id', async (req, res) => {
    try {
        const { hotel_id } = req.params;

        const result = await pool.query(
            `DELETE FROM hotels WHERE hotel_id = $1 RETURNING *`,
            [hotel_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json({
            message: 'Hotel deleted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting hotel' });
    }
});

export default router;
