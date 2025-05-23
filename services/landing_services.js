import { fetchFromOpenStates } from '../services/openStatesApiService.js'
import { stateCodeToName } from '../data/stateCodeToName.js'

export async function getLandingData(req, res) {
    const stateCode = req.params.stateCode.toUpperCase()
    const jurisdiction = stateCodeToName[stateCode]
    const thumbnail = req.params.image

    // Read limits from query, default to 20
    const billsLimit = parseInt(req.query.billsLimit) || 20;
    const officialsLimit = parseInt(req.query.officialsLimit) || 20;

    if (!jurisdiction) {
        return res.status(400).json({ error: "Invalid state code" })
    }

    try {
        const bills = await fetchFromOpenStates('/bills', {
            jurisdiction,
            per_page: billsLimit,
            sort: "updated_desc"
        })
        console.log("List of Bills:", bills)

        const officials = await fetchFromOpenStates('/people', {
            jurisdiction,
            thumbnail,
            per_page: officialsLimit,
            sort: "last_name"
        })
        console.log("List of Officials:", officials)

        res.status(200).json({
            bills: bills.results || [],
            officials: officials.results || []
        })
    } catch (error) {
        console.error("Landing route error:", error)
        res.status(500).json({ error: "Failed to fetch data" })
    }
}