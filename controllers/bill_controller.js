import express from 'express'
import { fetchFromOpenStates } from '../services/openStatesApiService.js'

const router = express.Router()

//GET specific bill by ID
router.get('/:billId', async (req, res) => {
    try {
        const { billId } = req.params
        const encodedBillId = encodeURIComponent(billId)
        console.log(encodedBillId)

        const bill = await fetchFromOpenStates(`/bills/ocd-bill/${encodedBillId}`)
        res.json(bill)
    } catch (error) {
        res.status(500).json({
            error: `Error fetching specific Bill Id: ${req.params.billId}`, 
            details: error.message
        })
    }
})

// router.get('/:billId', async (req, res) => {
//     try {
//         const { billId } = req.params;
//         console.log('Bill ID:', billId);

//         const encodedBillId = encodeURIComponent(billId)

//         const bill = await fetchFromOpenStates(`/bills/ocd-bill/${encodedBillId}`);
//         res.json(bill);
//     } catch (error) {
//         console.error('Error fetching Bill ID:', req.params.billId);
//         res.status(500).json({
//             error: `Error fetching specific Bill Id: ${req.params.billId}`, 
//             details: error.message
//         });
//     }
// });

//GET all bills by specific parameters
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