import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

if (!process.env.OS_API_KEY) {
    throw new Error("Missing OpenStates API key in environment variables")
}

const API_BASE_URL = `https://v3.openstates.org`

const apiEndpoint = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-API-Key': process.env.OS_API_KEY
    }
})

//function to fetch data from OpenStates API
export async function fetchFromOpenStates(endpoint, params = {}) {
    try {
        const response = await apiEndpoint.get(endpoint, { params })

        //print the exact URL being requested
        console.log('Requesting:', response.request.res.responseUrl)

        //return the data being requested
        return response.data

    } catch (error) {
        console.error('OpenStates API Error:', error.response?.status, error.response?.data || error.message)
        throw error
    }
}
