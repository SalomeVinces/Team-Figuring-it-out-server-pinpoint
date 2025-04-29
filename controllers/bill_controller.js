import express from 'express'
import { fetchFromOpenStates } from '../services/openStatesApiService.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const { jurisdiction, q } = req.query

        if (!jurisdiction && !q) {
            return res.status(400).json({
                error: "Missing required jusridiction and/or query parameters"
            })
        }

        const bills = await fetchFromOpenStates('/bills', { jurisdiction, q })
        res.json(bills)
    } catch (error) {
        res.status(500).json({
            error: "Error fetching Bills", 
            details: error.message
        })
    }
})

export default router