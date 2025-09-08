import * as L from 'leaflet';

// Webpack/Vite/Angular builder će vratiti URL-ove do ovih resursa:
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon    from 'leaflet/dist/images/marker-icon.png';
import markerShadow  from 'leaflet/dist/images/marker-shadow.png';

// Uklanjamo default _getIconUrl jer Leaflet CSS očekuje relative path do /images/
(L.Icon.Default as any).mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
