import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeoJSON.FeatureCollection>
) {
  const geojson: GeoJSON.FeatureCollection = require('/public/json/wilayah_perairan.json');
  const { code } = req.query;
  const response: GeoJSON.FeatureCollection = {
    ...geojson,
    features: geojson.features.filter(
      (feature) => feature?.properties?.WP_1 === code
    ),
  };
  res.status(200).json(response);
}
