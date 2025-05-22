import express from 'express'
import { fetchFromOpenStates } from '../services/openStatesApiService.js'

const router = express.Router()

// 🔁 In-memory cache
const billCache = new Map(); // key: `${jurisdiction}_${q}`, value: { timestamp, data }
const CACHE_TTL = 60 * 1000; // 60 seconds

// GET specific bill by ID
router.get('/:billId', async (req, res) => {
    try {
        const { billId } = req.params
        const encodedBillId = encodeURIComponent(billId)
        const bill = await fetchFromOpenStates(`/bills/ocd-bill/${encodedBillId}`)
        res.json(bill)
    } catch (error) {
        res.status(500).json({
            error: `Error fetching specific Bill Id: ${req.params.billId}`,
            details: error.message
        })
    }
})

// GET all bills by specific parameters
router.get('/', async (req, res) => {
    try {
        const {
            jurisdiction,
            q = "",
            sort = "updated_desc",
            pages = 3,
            chamber,
            keyword,
            voteStatus
        } = req.query;

        if (!jurisdiction) {
            return res.status(400).json({ error: "Missing required jurisdiction parameter" });
        }

        const keywords = keyword
            ? keyword.split(",").map(k => k.trim().toLowerCase())
            : [];

        const cacheKey = `${jurisdiction}_${q}_${chamber}_${voteStatus}_${keyword}`;
        const cached = billCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return res.status(200).json({ results: cached.data });
        }

        let allResults = [];

        for (let page = 1; page <= Math.min(parseInt(pages), 5); page++) {
            const response = await fetchFromOpenStates('/bills', {
                jurisdiction,
                q,
                sort,
                page,
                per_page: 20,
                include: ['abstracts', 'actions', 'votes']
            });

            if (!response?.results?.length) break;

            const filtered = response.results.filter(bill => {
                const chamberMatches = !chamber || (
                    typeof bill.from_organization?.name === 'string' &&
                    bill.from_organization?.name?.toLowerCase().includes(chamber?.toLowerCase() || "")
                );

                const voteMatches = !voteStatus || (
                    bill.votes?.some(vote =>
                        vote.result?.toLowerCase() === voteStatus.toLowerCase()
                    )
                );

                let keywordMatches = true;
                if (keywords.length > 0) {
                    const entityNames = bill.actions?.flatMap(action =>
                        action.related_entities?.map(entity => entity.name.toLowerCase()) || []
                    ) || [];

                    keywordMatches = keywords.some(keyword =>
                        entityNames.some(name => name.includes(keyword))
                    );
                }

                return chamberMatches && voteMatches && keywordMatches;
            });

            allResults.push(...filtered);

            console.log("chamber param:", chamber);

            // ⏳ Add 1-second delay between pages to avoid rate limiting
            if (page < pages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // 🧠 Cache result
        billCache.set(cacheKey, {
            timestamp: Date.now(),
            data: allResults
        });

        res.status(200).json({ results: allResults });

    } catch (error) {
        console.error("Error in /bills:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
