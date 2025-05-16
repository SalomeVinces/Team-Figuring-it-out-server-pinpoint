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

//GET all bills by specific parameters
router.get('/', async (req, res) => {
    try {
        const {
            jurisdiction,
            q = "",
            sort = "updated_desc",
            pages = 3 // how many 20-bill pages to fetch (default to 3 pages = 60 bills)
        } = req.query;

        if (!jurisdiction) {
            return res.status(400).json({ error: "Missing required jurisdiction parameter" });
        }

        let allResults = [];
        const maxPages = Math.min(parseInt(pages), 5); // limit to 5 pages = 100 max

        for (let page = 1; page <= maxPages; page++) {
            const response = await fetchFromOpenStates('/bills', {
                jurisdiction,
                q,
                sort,
                per_page: 20,
                page
            });

            if (response?.results?.length) {
                allResults.push(...response.results);
            } else {
                break; // no more results
            }
        }

        res.status(200).json({ results: allResults });

    } catch (error) {
        console.error("Backend error in /bills route:", error);
        res.status(500).json({ error: "Error fetching bills", details: error.message });
    }
});


export default router