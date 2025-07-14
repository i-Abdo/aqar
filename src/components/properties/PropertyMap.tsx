
"use client";

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import type { Property } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { formatDisplayPrice } from '@/lib/utils';
import ReactDOMServer from 'react-dom/server';

// Custom icon using a simple div for better customization
const createCustomIcon = (isSelected: boolean = false) => {
  const style = `
    background-color: ${isSelected ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}; 
    width: 24px; height: 24px; 
    border-radius: 50%; 
    border: 2px solid #fff; 
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
    transition: background-color 0.3s;
  `;
  return new L.DivIcon({
    html: `<div style="${style}"></div>`,
    className: '',
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
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = link.match(regex);
  if (match && match[1] && match[2]) {
    return [parseFloat(match[1]), parseFloat(match[2])];
  }
  return null;
};

// Component to render inside the Leaflet popup
const PopupContent = ({ property }: { property: Property }) => (
    <div className="w-[220px] font-body">
        <div className="relative h-24 w-full mb-2">
            <Image
                src={property.imageUrls?.[0] || "https://placehold.co/200x100.png"}
                alt={property.title}
                fill
                style={{objectFit: "cover"}}
                className="rounded-md"
                data-ai-hint="house exterior"
            />
        </div>
        <h3 className="text-sm font-headline font-semibold truncate mb-1" title={property.title}>{property.title}</h3>
        <p className="text-sm font-semibold text-primary mb-2">{formatDisplayPrice(property.price)}</p>
        <Button asChild size="sm" className="w-full">
            <Link href={`/properties/${property.id}`}>عرض التفاصيل</Link>
        </Button>
    </div>
);


const PropertyMap: React.FC<PropertyMapProps> = ({ properties, selectedPropertyId }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const propertiesWithCoords = useMemo(() => properties
    .map(p => ({
      ...p,
      coords: extractCoordsFromGoogleMapsLink(p.googleMapsLink),
    }))
    .filter(p => p.coords !== null), [properties]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current === null && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [36.7753, 3.0601], // Algiers
        zoom: 6,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
    // This effect should only run once to initialize the map.
    // The empty dependency array ensures this.
    // The cleanup function handles component unmounting.
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers and view when properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    propertiesWithCoords.forEach(prop => {
      if (prop.coords) {
        const isSelected = prop.id === selectedPropertyId;
        const marker = L.marker(prop.coords, { icon: createCustomIcon(isSelected) })
          .addTo(map)
          .bindPopup(ReactDOMServer.renderToString(<PopupContent property={prop} />));
        
        if (isSelected) {
            marker.openPopup();
        }

        markersRef.current.push(marker);
      }
    });

    // Adjust map view
    if (selectedPropertyId) {
      const selectedProp = propertiesWithCoords.find(p => p.id === selectedPropertyId);
      if (selectedProp?.coords) {
        map.flyTo(selectedProp.coords, 15, { animate: true, duration: 1 });
      }
    } else if (propertiesWithCoords.length > 0) {
      const bounds = new L.LatLngBounds(propertiesWithCoords.map(p => p.coords as L.LatLngExpression));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [propertiesWithCoords, selectedPropertyId]);

  return <div ref={mapContainerRef} style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }} />;
};

export default React.memo(PropertyMap);
