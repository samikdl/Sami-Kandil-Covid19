import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fmt } from '../services/format';

type CountryStats = {
  country: string;
  cases: number;
  deaths: number;
  lat: number;
  lng: number;
};

type Props = {
  data: CountryStats[];
  onCountryClick?: (country: string) => void;
};

// Coordonnées approximatives des pays principaux
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'Afghanistan': [33.93, 67.71],
  'Albania': [41.15, 20.17],
  'Algeria': [28.03, 1.66],
  'Andorra': [42.55, 1.60],
  'Angola': [-11.20, 17.87],
  'Argentina': [-38.42, -63.62],
  'Armenia': [40.07, 45.04],
  'Australia': [-25.27, 133.78],
  'Austria': [47.52, 14.55],
  'Azerbaijan': [40.14, 47.58],
  'Bahamas': [25.03, -77.40],
  'Bahrain': [26.07, 50.56],
  'Bangladesh': [23.68, 90.36],
  'Barbados': [13.19, -59.54],
  'Belarus': [53.71, 27.95],
  'Belgium': [50.50, 4.47],
  'Belize': [17.19, -88.50],
  'Benin': [9.31, 2.32],
  'Bhutan': [27.51, 90.43],
  'Bolivia': [-16.29, -63.59],
  'Bosnia and Herzegovina': [43.92, 17.68],
  'Botswana': [-22.33, 24.68],
  'Brazil': [-14.24, -51.93],
  'Brunei': [4.54, 114.73],
  'Bulgaria': [42.73, 25.49],
  'Burkina Faso': [12.24, -1.56],
  'Burma': [21.91, 95.96],
  'Burundi': [-3.37, 29.92],
  'Cambodia': [12.57, 104.99],
  'Cameroon': [7.37, 12.35],
  'Canada': [56.13, -106.35],
  'Central African Republic': [6.61, 20.94],
  'Chad': [15.45, 18.73],
  'Chile': [-35.68, -71.54],
  'China': [35.86, 104.20],
  'Colombia': [4.57, -74.30],
  'Comoros': [-11.88, 43.87],
  'Congo (Brazzaville)': [-0.23, 15.83],
  'Congo (Kinshasa)': [-4.04, 21.76],
  'Costa Rica': [9.75, -83.75],
  "Cote d'Ivoire": [7.54, -5.55],
  'Croatia': [45.10, 15.20],
  'Cuba': [21.52, -77.78],
  'Cyprus': [35.13, 33.43],
  'Czechia': [49.82, 15.47],
  'Denmark': [56.26, 9.50],
  'Djibouti': [11.83, 42.59],
  'Dominica': [15.41, -61.37],
  'Dominican Republic': [18.74, -70.16],
  'Ecuador': [-1.83, -78.18],
  'Egypt': [26.82, 30.80],
  'El Salvador': [13.79, -88.90],
  'Equatorial Guinea': [1.65, 10.27],
  'Eritrea': [15.18, 39.78],
  'Estonia': [58.60, 25.01],
  'Eswatini': [-26.52, 31.47],
  'Ethiopia': [9.15, 40.49],
  'Fiji': [-17.71, 178.07],
  'Finland': [61.92, 25.75],
  'France': [46.23, 2.21],
  'Gabon': [-0.80, 11.61],
  'Gambia': [13.44, -15.31],
  'Georgia': [42.32, 43.36],
  'Germany': [51.17, 10.45],
  'Ghana': [7.95, -1.02],
  'Greece': [39.07, 21.82],
  'Grenada': [12.26, -61.60],
  'Guatemala': [15.78, -90.23],
  'Guinea': [9.95, -9.70],
  'Guinea-Bissau': [11.80, -15.18],
  'Guyana': [4.86, -58.93],
  'Haiti': [18.97, -72.29],
  'Holy See': [41.90, 12.45],
  'Honduras': [15.20, -86.24],
  'Hungary': [47.16, 19.50],
  'Iceland': [64.96, -19.02],
  'India': [20.59, 78.96],
  'Indonesia': [-0.79, 113.92],
  'Iran': [32.43, 53.69],
  'Iraq': [33.22, 43.68],
  'Ireland': [53.14, -7.69],
  'Israel': [31.05, 34.85],
  'Italy': [41.87, 12.57],
  'Jamaica': [18.11, -77.30],
  'Japan': [36.20, 138.25],
  'Jordan': [30.59, 36.24],
  'Kazakhstan': [48.02, 66.92],
  'Kenya': [-0.02, 37.91],
  'Korea, South': [35.91, 127.77],
  'Kosovo': [42.60, 20.90],
  'Kuwait': [29.31, 47.48],
  'Kyrgyzstan': [41.20, 74.77],
  'Laos': [19.86, 102.50],
  'Latvia': [56.88, 24.60],
  'Lebanon': [33.85, 35.86],
  'Lesotho': [-29.61, 28.23],
  'Liberia': [6.43, -9.43],
  'Libya': [26.34, 17.23],
  'Liechtenstein': [47.17, 9.56],
  'Lithuania': [55.17, 23.88],
  'Luxembourg': [49.82, 6.13],
  'Madagascar': [-18.77, 46.87],
  'Malawi': [-13.25, 34.30],
  'Malaysia': [4.21, 101.98],
  'Maldives': [3.20, 73.22],
  'Mali': [17.57, -4.00],
  'Malta': [35.94, 14.38],
  'Mauritania': [21.01, -10.94],
  'Mauritius': [-20.35, 57.55],
  'Mexico': [23.63, -102.55],
  'Moldova': [47.41, 28.37],
  'Monaco': [43.75, 7.41],
  'Mongolia': [46.86, 103.85],
  'Montenegro': [42.71, 19.37],
  'Morocco': [31.79, -7.09],
  'Mozambique': [-18.67, 35.53],
  'Namibia': [-22.96, 18.49],
  'Nepal': [28.39, 84.12],
  'Netherlands': [52.13, 5.29],
  'New Zealand': [-40.90, 174.89],
  'Nicaragua': [12.87, -85.21],
  'Niger': [17.61, 8.08],
  'Nigeria': [9.08, 8.68],
  'North Macedonia': [41.51, 21.75],
  'Norway': [60.47, 8.47],
  'Oman': [21.51, 55.92],
  'Pakistan': [30.38, 69.35],
  'Panama': [8.54, -80.78],
  'Papua New Guinea': [-6.31, 143.96],
  'Paraguay': [-23.44, -58.44],
  'Peru': [-9.19, -75.02],
  'Philippines': [12.88, 121.77],
  'Poland': [51.92, 19.15],
  'Portugal': [39.40, -8.22],
  'Qatar': [25.35, 51.18],
  'Romania': [45.94, 24.97],
  'Russia': [61.52, 105.32],
  'Rwanda': [-1.94, 29.87],
  'Saint Kitts and Nevis': [17.36, -62.78],
  'Saint Lucia': [13.91, -60.98],
  'Saint Vincent and the Grenadines': [12.98, -61.29],
  'San Marino': [43.94, 12.46],
  'Sao Tome and Principe': [0.19, 6.61],
  'Saudi Arabia': [23.89, 45.08],
  'Senegal': [14.50, -14.45],
  'Serbia': [44.02, 21.01],
  'Seychelles': [-4.68, 55.49],
  'Sierra Leone': [8.46, -11.78],
  'Singapore': [1.35, 103.82],
  'Slovakia': [48.67, 19.70],
  'Slovenia': [46.15, 14.99],
  'Somalia': [5.15, 46.20],
  'South Africa': [-30.56, 22.94],
  'South Sudan': [6.88, 31.31],
  'Spain': [40.46, -3.75],
  'Sri Lanka': [7.87, 80.77],
  'Sudan': [12.86, 30.22],
  'Suriname': [3.92, -56.03],
  'Sweden': [60.13, 18.64],
  'Switzerland': [46.82, 8.23],
  'Syria': [34.80, 39.00],
  'Taiwan*': [23.70, 120.96],
  'Tajikistan': [38.86, 71.28],
  'Tanzania': [-6.37, 34.89],
  'Thailand': [15.87, 100.99],
  'Timor-Leste': [-8.87, 125.73],
  'Togo': [8.62, 0.82],
  'Trinidad and Tobago': [10.69, -61.22],
  'Tunisia': [33.89, 9.54],
  'Turkey': [38.96, 35.24],
  'US': [37.09, -95.71],
  'Uganda': [1.37, 32.29],
  'Ukraine': [48.38, 31.17],
  'United Arab Emirates': [23.42, 53.85],
  'United Kingdom': [55.38, -3.44],
  'Uruguay': [-32.52, -55.77],
  'Uzbekistan': [41.38, 64.59],
  'Venezuela': [6.42, -66.59],
  'Vietnam': [14.06, 108.28],
  'West Bank and Gaza': [31.95, 35.23],
  'Yemen': [15.55, 48.52],
  'Zambia': [-13.13, 27.85],
  'Zimbabwe': [-19.02, 29.15],
};

export default function WorldMap({ data, onCountryClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'cases' | 'deaths'>('cases');

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialiser la carte
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      worldCopyJump: true,
    });

    // Ajouter le fond de carte sombre
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !data.length) return;

    const map = mapInstanceRef.current;

    // Supprimer les anciens marqueurs
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Calculer le max pour la normalisation
    const maxValue = Math.max(...data.map(d => selectedMetric === 'cases' ? d.cases : d.deaths));

    // Ajouter les cercles pour chaque pays
    data.forEach((country) => {
      const coords = COUNTRY_COORDS[country.country];
      if (!coords) return;

      const value = selectedMetric === 'cases' ? country.cases : country.deaths;
      const radius = Math.max(5, Math.sqrt(value / maxValue) * 40);
      const color = selectedMetric === 'cases' ? '#3b82f6' : '#f43f5e';

      const circle = L.circleMarker([coords[0], coords[1]], {
        radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.4,
      });

      circle.bindPopup(`
        <div style="font-family: system-ui; min-width: 150px;">
          <strong style="font-size: 14px;">${country.country}</strong>
          <div style="margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #666;">Cas:</span>
              <span style="font-weight: 600; color: #3b82f6;">${fmt.format(country.cases)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Décès:</span>
              <span style="font-weight: 600; color: #f43f5e;">${fmt.format(country.deaths)}</span>
            </div>
          </div>
        </div>
      `);

      circle.on('click', () => {
        if (onCountryClick) {
          onCountryClick(country.country);
        }
      });

      circle.addTo(map);
    });
  }, [data, selectedMetric, onCountryClick]);

  return (
    <div className="relative h-full w-full">
      {/* Contrôles de la carte */}
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <button
          onClick={() => setSelectedMetric('cases')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            selectedMetric === 'cases'
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
          }`}
        >
          Cas
        </button>
        <button
          onClick={() => setSelectedMetric('deaths')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            selectedMetric === 'deaths'
              ? 'bg-rose-500 text-white'
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
          }`}
        >
          Décès
        </button>
      </div>

      {/* Container de la carte */}
      <div ref={mapRef} className="h-full w-full rounded-lg" />

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-black/60 backdrop-blur-sm p-3 text-xs">
        <div className="text-gray-400 mb-2">Taille = Volume de {selectedMetric === 'cases' ? 'cas' : 'décès'}</div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: selectedMetric === 'cases' ? '#3b82f6' : '#f43f5e', opacity: 0.6 }}
          />
          <span className="text-gray-300">Cliquez pour sélectionner</span>
        </div>
      </div>
    </div>
  );
}

export { COUNTRY_COORDS };