import React, { useState } from 'react';
import { MapPin, Crosshair, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ZonePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const ZONES = [
  // Grand Dakar
  { label: 'Dakar',        region: 'Dakar',         lat: 14.6928, lng: -17.4467 },
  { label: 'Pikine',       region: 'Dakar',         lat: 14.7645, lng: -17.3900 },
  { label: 'Guédiawaye',   region: 'Dakar',         lat: 14.7786, lng: -17.4047 },
  { label: 'Rufisque',     region: 'Dakar',         lat: 14.7158, lng: -17.2772 },
  { label: 'Zone des Niayes', region: 'Dakar/Thiès', lat: 14.9200, lng: -17.1800 },
  // Thiès
  { label: 'Thiès',        region: 'Thiès',         lat: 14.7886, lng: -16.9260 },
  { label: 'Mbour',        region: 'Thiès',         lat: 14.3666, lng: -16.9655 },
  { label: 'Tivaouane',    region: 'Thiès',         lat: 14.9569, lng: -16.8197 },
  // Diourbel
  { label: 'Diourbel',     region: 'Diourbel',      lat: 14.6564, lng: -16.2282 },
  { label: 'Touba',        region: 'Diourbel',      lat: 14.8578, lng: -15.8831 },
  { label: 'Mbacké',       region: 'Diourbel',      lat: 14.8003, lng: -15.9069 },
  // Kaolack
  { label: 'Kaolack',      region: 'Kaolack',       lat: 14.1520, lng: -16.0726 },
  { label: 'Nioro du Rip', region: 'Kaolack',       lat: 13.7519, lng: -15.7700 },
  // Kaffrine
  { label: 'Kaffrine',     region: 'Kaffrine',      lat: 14.1058, lng: -15.5506 },
  // Fatick
  { label: 'Fatick',       region: 'Fatick',        lat: 14.3394, lng: -16.4060 },
  { label: 'Foundiougne',  region: 'Fatick',        lat: 14.1333, lng: -16.4667 },
  // Louga
  { label: 'Louga',        region: 'Louga',         lat: 15.6166, lng: -16.2247 },
  { label: 'Linguère',     region: 'Louga',         lat: 15.3955, lng: -15.1147 },
  // Saint-Louis
  { label: 'Saint-Louis',  region: 'Saint-Louis',   lat: 16.0179, lng: -16.4896 },
  { label: 'Podor',        region: 'Saint-Louis',   lat: 16.6500, lng: -14.9669 },
  { label: 'Richard-Toll', region: 'Saint-Louis',   lat: 16.4614, lng: -15.7011 },
  // Matam
  { label: 'Matam',        region: 'Matam',         lat: 15.6558, lng: -13.2556 },
  // Tambacounda
  { label: 'Tambacounda',  region: 'Tambacounda',   lat: 13.7709, lng: -13.6673 },
  { label: 'Bakel',        region: 'Tambacounda',   lat: 14.9028, lng: -12.4625 },
  // Kédougou
  { label: 'Kédougou',     region: 'Kédougou',      lat: 12.5605, lng: -12.1747 },
  // Kolda
  { label: 'Kolda',        region: 'Kolda',         lat: 12.8961, lng: -14.9511 },
  { label: 'Vélingara',    region: 'Kolda',         lat: 13.1500, lng: -14.1167 },
  // Ziguinchor
  { label: 'Ziguinchor',   region: 'Ziguinchor',    lat: 12.5536, lng: -16.2716 },
  { label: 'Bignona',      region: 'Ziguinchor',    lat: 12.8069, lng: -16.2258 },
  { label: 'Oussouye',     region: 'Ziguinchor',    lat: 12.4847, lng: -16.5458 },
  // Sédhiou
  { label: 'Sédhiou',      region: 'Sédhiou',       lat: 12.7083, lng: -15.5570 },
];

const REGIONS = [...new Set(ZONES.map(z => z.region))];

function nearestZone(lat: number, lng: number): string {
  let best = ZONES[0];
  let bestDist = Infinity;
  for (const z of ZONES) {
    const d = Math.sqrt((z.lat - lat) ** 2 + (z.lng - lng) ** 2);
    if (d < bestDist) { bestDist = d; best = z; }
  }
  return best.label;
}

const ZonePicker = ({ value, onChange, label = 'Zone / Localisation', error, required, className }: ZonePickerProps) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const handleGeo = () => {
    if (!navigator.geolocation) {
      setGeoError('Géolocalisation non disponible');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const zone = nearestZone(pos.coords.latitude, pos.coords.longitude);
        onChange(zone);
        setGeoLoading(false);
      },
      () => {
        setGeoError('Impossible d\'obtenir la position');
        setGeoLoading(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider">
          <MapPin size={10} className="inline mr-1" />
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <button
          type="button"
          onClick={handleGeo}
          disabled={geoLoading}
          className="flex items-center gap-1 text-[10px] font-bold text-primary/50 hover:text-primary transition-colors disabled:opacity-50"
        >
          <Crosshair size={11} className={geoLoading ? 'animate-spin' : ''} />
          {geoLoading ? 'Localisation...' : 'Me localiser'}
        </button>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            'w-full px-3 py-2.5 pr-8 rounded-xl border-2 text-sm font-medium outline-none transition-all appearance-none bg-white cursor-pointer',
            error
              ? 'border-red-400 bg-red-50 text-red-900'
              : value
              ? 'border-primary/40 text-primary focus:ring-2 focus:ring-primary/10'
              : 'border-surface-container text-primary/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
          )}
        >
          <option value="">Sélectionnez une zone...</option>
          {REGIONS.map(region => (
            <optgroup key={region} label={`— ${region} —`}>
              {ZONES.filter(z => z.region === region).map(z => (
                <option key={z.label} value={z.label}>{z.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
      </div>

      {(error || geoError) && (
        <p className="text-xs text-red-500 font-bold">{error || geoError}</p>
      )}
    </div>
  );
};

export { ZonePicker, ZONES };
