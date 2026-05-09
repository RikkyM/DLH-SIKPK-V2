// import L from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix path icon default Leaflet untuk Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export const makePinIcon = (color: string) =>
  L.divIcon({
    className: "", // penting: biar gak ada style default leaflet
    html: `
      <svg width="34" height="34" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" d="M12 2c-3.86 0-7 3.14-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
        <circle cx="12" cy="9" r="2.8" fill="white"/>
      </svg>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 33], // titik “nempel” ke map
    popupAnchor: [0, -30],
  });

export const iconTitikSampah = makePinIcon("#ef4444");
