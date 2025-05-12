import { fetchFromOpenStates } from '../services/openStatesApiService.js'
import { stateCodeToName } from '../data/stateCodeToName.js'

export async function getLandingData(req, res) {
    const stateCode = req.params.stateCode.toUpperCase()
    const jurisdiction = stateCodeToName[stateCode]

    if (!jurisdiction) {
        return res.status(400).json({ error: "Invalid state code" })
    }

    try {
        const bills = await fetchFromOpenStates('/bills', {
            jurisdiction,
            per_page: 5,
            sort: "updated_desc"
        })

        const officials = await fetchFromOpenStates('/people', {
            jurisdiction,
            per_page: 5,
            sort: "last_name"
        })

        res.status(200).json({
            bills: bills.results || [],
            officials: officials.results || []
        })
    } catch (error) {
        console.error("Landing route error:", error)
        res.status(500).json({ error: "Failed to fetch data" })
    }
}