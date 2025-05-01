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
        const { jurisdiction, q } = req.query
        if (!jurisdiction && !q) {
            return res.status(400).json({
                error: 'Missing required jurisdiction or query parameters'
            })
        }

        const officials = await fetchFromOpenStates('/people', { jurisdiction, q })
        res.json(officials)
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching Officials',
            details: error.message
        })
    }
})

export default router