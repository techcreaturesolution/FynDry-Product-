import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MapLocationPicker({
  initialCoordinates = null, // [lng, lat]
  onLocationSelect,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default center: India center (or provided coordinates)
  const defaultLat = initialCoordinates ? initialCoordinates[1] : 20.5937;
  const defaultLng = initialCoordinates ? initialCoordinates[0] : 78.9629;
  const defaultZoom = initialCoordinates ? 16 : 5;

  useEffect(() => {
    let isMounted = true;

    // Dynamically inject Leaflet CSS & JS if not present
    function loadLeaflet() {
      if (window.L) {
        if (isMounted) initMap();
        return;
      }

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
          if (isMounted) initMap();
        };
        document.body.appendChild(script);
      } else {
        const existingScript = document.getElementById('leaflet-js');
        existingScript.addEventListener('load', () => {
          if (isMounted) initMap();
        });
      }
    }

    function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

      const L = window.L;
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon using HTML for perfect styling
      const customPinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="transform: translate(-50%, -100%);">
            <div style="background-color: #1F6B3A; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
              <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customPinIcon,
      }).addTo(map);

      // On pin drag end, notify parent
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onLocationSelect) {
          onLocationSelect({ lat: pos.lat, lng: pos.lng });
        }
      });

      // On map click, move marker to clicked location
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        if (onLocationSelect) {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapLoaded(true);

      // Invalidate size to ensure proper rendering inside modals
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if initialCoordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && initialCoordinates) {
      const lat = initialCoordinates[1];
      const lng = initialCoordinates[0];
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  }, [initialCoordinates]);

  // Handle Current Location Geolocation
  const handleDetectLocation = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoLoading(false);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.setView([latitude, longitude], 17);
        }

        if (onLocationSelect) {
          onLocationSelect({ lat: latitude, lng: longitude, isLiveGPS: true });
        }

        toast.success('Current GPS location pinned! Drag pin to fine-tune.');
      },
      (err) => {
        setGeoLoading(false);
        let msg = 'Unable to retrieve location. Please type manually or drag pin.';
        if (err.code === 1) msg = 'Location permission was denied. Please allow access.';
        else if (err.code === 2) msg = 'Location signal unavailable. Please try again.';
        else if (err.code === 3) msg = 'Location request timed out.';
        toast.error(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>Pin Location on Map (Draggable)</span>
        </span>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={geoLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-50 text-primary hover:bg-primary-100 border border-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {geoLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>{geoLoading ? 'Detecting...' : 'Use Current Location'}</span>
        </button>
      </div>

      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gray-200 bg-cream/40 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/80 text-xs font-bold text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
            Loading Map Preview...
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-400 italic">
        💡 Tip: Drag the green pin or tap anywhere on the map to adjust exact drop-off spot.
      </p>
    </div>
  );
}
