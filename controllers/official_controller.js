import express from 'express'
import { fetchFromOpenStates } from '../services/openStatesApiService.js'

const router = express.Router()

//GET specific officials by ID
// router.get('/:officialId', async (req, res) => {
//     try {
//         const { officialId } = req.params
//         const encodedOfficialId = encodeURIComponent(officialId)
//         console.log(encodedOfficialId)

//         const official = await fetchFromOpenStates(`/people/ocd-person/${encodedOfficialId}`)
//         res.json(official)
//     } catch (error) {
//         res.status(500).json({
//             error: `Error fetching specific Official Id: ${req.params.officialId}`, 
//             details: error.message
//         })
//     }
// })


router.get('/', async (req, res) => {
    try {
        const { jurisdiction, q, limit } = req.query
        if (!jurisdiction && !q) {
            return res.status(400).json({
                error: 'Missing required jurisdiction or query parameters'
            })
        }
        // Pass limit to OpenStates API if provided, default to 20
        const perPage = parseInt(limit) || 20
        const officials = await fetchFromOpenStates('/people', { jurisdiction, q, per_page: perPage })
        res.json(officials)
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching Officials',
            details: error.message
        })
    }
})

export default router