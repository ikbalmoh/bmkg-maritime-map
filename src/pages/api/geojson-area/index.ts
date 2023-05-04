import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeoJSON.FeatureCollection>
) {
  const geojson: GeoJSON.FeatureCollection = require('/public/json/wilayah_perairan.json');
  res.status(200).json(geojson);
}
