import { useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map } from 'lucide-react';

interface MapTileOption {
  id: string;
  name: string;
  url: string;
  attribution: string;
}

const mapTileOptions: MapTileOption[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  {
    id: 'cartodb',
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  {
    id: 'cartodb-dark',
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  {
    id: 'esri-satellite',
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  {
    id: 'stamen-terrain',
    name: 'Stamen Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data &copy; OpenStreetMap contributors'
  }
];

interface MapTileSelectorProps {
  onTileChange?: (tileOption: MapTileOption) => void;
}

const MapTileSelector: React.FC<MapTileSelectorProps> = ({ onTileChange }) => {
  const [selectedTile, setSelectedTile] = useState<string>('osm');

  const handleTileChange = (tileId: string) => {
    setSelectedTile(tileId);
    const tileOption = mapTileOptions.find(option => option.id === tileId);
    if (tileOption && onTileChange) {
      onTileChange(tileOption);
    }
  };

  const currentTile = mapTileOptions.find(option => option.id === selectedTile) || mapTileOptions[0];

  return (
    <>
      <div className="mb-4">
        <Select value={selectedTile} onValueChange={handleTileChange}>
          <SelectTrigger className="w-48">
            <Map className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select map style" />
          </SelectTrigger>
          <SelectContent>
            {mapTileOptions.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <TileLayer
        key={currentTile.id}
        url={currentTile.url}
        attribution={currentTile.attribution}
      />
    </>
  );
};

export default MapTileSelector;
