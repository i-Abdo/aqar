
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { formatDisplayPrice } from '@/lib/utils';
import { useEffect } from 'react';

// Custom icon using a simple div for better customization and to avoid webpack issues with default icon paths
const createCustomIcon = () => {
  return new L.DivIcon({
    html: `<div style="background-color: hsl(var(--primary)); width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    className: '', // important to clear default styling
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
}

const extractCoordsFromGoogleMapsLink = (link?: string): [number, number] | null => {
  if (!link) return null;
  // Regex to find latitude and longitude in a Google Maps URL
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = link.match(regex);
  if (match && match[1] && match[2]) {
    return [parseFloat(match[1]), parseFloat(match[2])];
  }
  return null;
};

// This inner component will re-render when properties change, but MapContainer will not.
const MapInner = ({ properties, selectedPropertyId }: PropertyMapProps) => {
    const map = useMap();
    const propertiesWithCoords = properties
        .map(p => ({
            ...p,
            coords: extractCoordsFromGoogleMapsLink(p.googleMapsLink),
        }))
        .filter(p => p.coords !== null);

    useEffect(() => {
        if (selectedPropertyId && propertiesWithCoords.length > 0) {
            const selectedProp = propertiesWithCoords.find(p => p.id === selectedPropertyId);
            if (selectedProp && selectedProp.coords) {
                map.flyTo(selectedProp.coords, 15); // Zoom in on the selected property
            }
        } else if (propertiesWithCoords.length > 0) {
            // If no specific property is selected, fit the map to show all properties
            const bounds = new L.LatLngBounds(propertiesWithCoords.map(p => p.coords as L.LatLngExpression));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [selectedPropertyId, properties, map]); // properties dependency is simplified, but should be stable if parent component memoizes it.

    return (
        <>
            {propertiesWithCoords.map(prop => (
                prop.coords && (
                    <Marker key={prop.id} position={prop.coords} icon={createCustomIcon()}>
                        <Popup minWidth={250}>
                        <Card className="border-none shadow-none">
                            <CardHeader className="p-2">
                            <div className="relative h-24 w-full mb-2">
                                <Image
                                    src={prop.imageUrls?.[0] || "https://placehold.co/200x100.png"}
                                    alt={prop.title}
                                    fill
                                    style={{objectFit: "cover"}}
                                    className="rounded-md"
                                    data-ai-hint="house exterior"
                                />
                            </div>
                            <CardTitle className="text-sm font-headline truncate" title={prop.title}>{prop.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                            <p className="text-sm font-semibold text-primary mb-2">{formatDisplayPrice(prop.price)}</p>
                            <Button asChild size="sm" className="w-full">
                                <Link href={`/properties/${prop.id}`}>عرض التفاصيل</Link>
                            </Button>
                            </CardContent>
                        </Card>
                        </Popup>
                    </Marker>
                )
            ))}
        </>
    );
};


export function PropertyMap({ properties, selectedPropertyId }: PropertyMapProps) {
  const defaultPosition: [number, number] = [36.7753, 3.0601]; // Algiers
  const defaultZoom = 6; // Zoom out to show more of Algeria by default

  if (typeof window === 'undefined') {
    return <div className="h-[500px] w-full bg-muted rounded-lg flex items-center justify-center"><p>جارٍ تحميل الخريطة...</p></div>;
  }

  return (
    <MapContainer center={defaultPosition} zoom={defaultZoom} scrollWheelZoom={true} style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInner properties={properties} selectedPropertyId={selectedPropertyId} />
    </MapContainer>
  );
}
