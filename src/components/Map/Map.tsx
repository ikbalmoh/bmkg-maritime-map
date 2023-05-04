import {
  MapContainer,
  TileLayer,
  useMap,
  GeoJSON,
  Marker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Leaflet, { Layer } from 'leaflet';
import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  RefObject,
  ForwardedRef,
} from 'react';
import { GeoJsonObject, Feature } from 'geojson';
import { weatherColor } from '@/utils/weather';
import axios from 'axios';
import WaveOverview from '@/data/models/wave_overview';

const MARKER_ICON = Leaflet.icon({
  iconUrl: '/icons/marker.png',
  iconSize: [38, 72],
});

interface MapControllerProps {
  enable: boolean;
  bounds?: Leaflet.LatLngBoundsExpression;
}

interface WrappedMapProps extends Props {
  mapRef?: RefObject<MapRef>;
}

interface Props {
  center?: Leaflet.LatLngExpression;
  onClickArea?: (feature: Feature<GeoJSON.Polygon, any>) => void;
  zoom?: number;
  markers?: Leaflet.LatLngExpression[];
  waveOverview: WaveOverview;
}

export interface MapRef {
  handleAreaSelect(title: string): void;
}

// eslint-disable-next-line react/display-name
const Map = forwardRef(
  (
    {
      center = [-1.1744305, 116.7717081],
      onClickArea,
      zoom = 5,
      markers,
      waveOverview,
    }: Props,
    ref: ForwardedRef<MapRef>
  ) => {
    const geoJsonRef = useRef<Leaflet.GeoJSON>(null);

    const [map, setMap] = useState<Leaflet.Map | null>(null);
    const [geojson, setGeojson] = useState<
      GeoJSON.FeatureCollection | undefined
    >(undefined);
    const [scroll, setscroll] = useState<boolean>(false);
    const [marker, setMarker] = useState<Leaflet.LatLng | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      handleAreaSelect(title: string) {
        onSelectArea(title);
      },
    }));

    async function fetchGeoJson() {
      try {
        const { data }: { data: GeoJSON.FeatureCollection } = await axios.get(
          '/api/geojson-area'
        );
        const _geojson = {
          ...data,
          features: data.features.map((feauture) => {
            const _overview: string =
              waveOverview[feauture?.properties?.WP_1] ?? '';
            return {
              ...feauture,
              properties: {
                ...feauture.properties,
                overview: _overview,
              },
            };
          }),
        };
        setGeojson(_geojson);
      } catch (error) {
        console.error('fetch geojson failed!', error);
      }
    }

    useEffect(() => {
      fetchGeoJson();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (geojson && geoJsonRef.current && map) {
        map.fitBounds(geoJsonRef.current.getBounds());
      }
    }, [geojson, map]);

    const onMouseEnter = () => {
      setTimeout(() => {
        setscroll(true);
      }, 1000);
    };

    const onMouseLeave = () => {
      setTimeout(() => {
        setscroll(false);
      }, 1000);
    };

    const onEachFeature = (
      feature: Feature<GeoJSON.Polygon, any>,
      layer: Layer
    ) => {
      layer.bindTooltip(feature?.properties.WP_IMM, { opacity: 0.8 });
      layer.on({
        click: () => {
          const latlng = layer?.getTooltip()?.getLatLng();
          setMarker(latlng);
          layer.closeTooltip();
          if (onClickArea) {
            onClickArea(feature);
          }
        },
      });
    };

    const onSelectArea = (title: string) => {
      const layer = geoJsonRef?.current
        ?.getLayers()
        .find((layer) => layer.getTooltip()?.getContent() === title);
      const latlng = layer?.getTooltip()?.getLatLng();

      console.log('onSelectArea', { title, layer, latlng });

      setMarker(latlng);
    };

    return (
      <div
        className="w-full h-full shadow-xl"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          minZoom={5}
          maxZoom={10}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController enable={scroll} />
          {geojson && (
            <GeoJSON
              data={geojson as GeoJsonObject}
              style={(feature) => ({
                color: '#001B54',
                weight: 0.5,
                fillColor: weatherColor(
                  feature?.properties?.overview?.toLowerCase()
                ),
                fillOpacity: 0.75,
              })}
              onEachFeature={onEachFeature}
              ref={geoJsonRef}
            />
          )}
          {marker && <Marker position={marker} icon={MARKER_ICON} />}
          {markers?.map((position, index) => (
            <Marker
              key={index}
              position={position}
              icon={MARKER_ICON}
              riseOffset={10}
            />
          ))}
        </MapContainer>
      </div>
    );
  }
);

function MapController({ enable, bounds }: MapControllerProps) {
  const map = useMap();
  if (enable) {
    map.scrollWheelZoom.enable();
  } else {
    map.scrollWheelZoom.disable();
  }
  if (bounds) {
    map.fitBounds(bounds);
  }
  return null;
}

export default function WrappedMap({ mapRef, ...props }: WrappedMapProps) {
  return <Map ref={mapRef} {...props} />;
}
