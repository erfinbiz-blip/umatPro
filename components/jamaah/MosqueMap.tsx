'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import Link from 'next/link'
import type { Mosque } from '@/lib/supabase/types'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const mosqueIcon = new L.DivIcon({
  html: `<div style="
    width:32px;height:32px;
    background:linear-gradient(135deg,#064E3B,#0A6B4A);
    border:2px solid #D4AF37;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 12px rgba(0,0,0,0.4);
  "><span style="transform:rotate(45deg);font-size:14px;">🕌</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
  className: '',
})

interface MosqueMapProps {
  mosques: Mosque[]
  center: { lat: number; lng: number }
  className?: string
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], 13)
  }, [center, map])
  return null
}

export default function MosqueMap({ mosques, center, className = '' }: MosqueMapProps) {
  return (
    <div className={`h-64 rounded-2xl overflow-hidden border border-white/10 ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <RecenterMap center={center} />
        {mosques
          .filter((m) => m.lat && m.lng)
          .map((mosque) => (
            <Marker key={mosque.id} position={[mosque.lat!, mosque.lng!]} icon={mosqueIcon}>
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <p style={{ fontWeight: 700, color: '#F8F6F0', marginBottom: '4px' }}>
                    {mosque.name}
                  </p>
                  {mosque.address && (
                    <p style={{ fontSize: '12px', color: 'rgba(248,246,240,0.6)', marginBottom: '8px' }}>
                      {mosque.address}
                    </p>
                  )}
                  <a
                    href={`/app/mosque/${mosque.id}`}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg,#D4AF37,#E8C84A)',
                      color: '#022D1A',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Lihat Profil →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
