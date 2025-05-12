import express from 'express'
import fs from 'fs'
import centroid from '@turf/centroid'
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

// importing data from zip code json file
const rawJson = fs.readFileSync('./data/usa_zip_codes.json', 'utf8')
const zipGeoData = JSON.parse(rawJson)

//initializing express router
const router = express.Router()

//Gets the lat/lng from a given zipcode
router.get('/zip-centroid/:zip', (req, res) => {
    const { zip } = req.params

    const feature = zipGeoData.features.find(f => f.properties.ZCTA5CE10 === zip)

    if (!feature) {
        return res.status(404).json({
            error: "Zip code not found"
        })
    }

    const center = centroid(feature)
    const [lng, lat] = center.geometry.coordinates

    res.json({
        latitude: lat,
        longitude: lng
    })


})

//Returns the ZIP code containing the supplied lat/lng
router.get('/reverse-zip', (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Missing lat/lng parameters" });
    }

    const userPoint = point([parseFloat(lng), parseFloat(lat)]);

    const match = zipGeoData.features.find(feature =>
        feature?.geometry?.type === "Polygon" && booleanPointInPolygon(userPoint, feature)
    );

    if (match) {
        return res.json({ zipCode: match.properties.ZCTA5CE10 });
    } else {
        return res.status(404).json({ error: "ZIP code not found for location" });
    }
});

export default router