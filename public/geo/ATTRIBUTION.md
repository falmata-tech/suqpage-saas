# Ethiopia Expo geography attribution

`ethiopia-admin1-2023.geojson` is a property-reduced and coordinate-quantized
copy of **ET_Admin1_2023**, downloaded from the FEWS NET Data Warehouse:

- Dataset page: https://fews.net/ethiopia-fews-net-admin-boundaries-october-2023
- Source layer: https://fdw.fews.net/api/feature.geojson?layer=4695
- Effective date recorded by the source: October 1, 2023

`ethiopia-admin2-2023.geojson` is a simplified, property-reduced copy of
**ET_Admin2_2023** from the same dataset:

- Source layer: https://fdw.fews.net/api/feature.geojson?layer=4696
- Generated with: `npm run build:expo-geography`

`ethiopia-places-osm.geojson` and `ethiopia-major-roads-osm.geojson` are
property-reduced, coordinate-quantized, and display-simplified derivatives of
the metadata-stripped Geofabrik Ethiopia OpenStreetMap extract timestamped
2026-07-31T20:21:56Z. Places outside the FEWS NET Ethiopia boundary are removed.
The road asset contains motorway, trunk, primary, and secondary display layers;
it is not a routable street database.

- Extract: https://download.geofabrik.de/africa/ethiopia.html
- Rebuild: `npm run build:discovery-geography -- /path/to/ethiopia.osm.pbf`

- OpenStreetMap copyright: https://www.openstreetmap.org/copyright
- Open Database License: https://opendatacommons.org/licenses/odbl/
- Geofabrik attribution: https://www.geofabrik.de/geofabrik/geofabrik.html

The local copies retain only the names, classifications, coordinates, and
geometry needed for the MirtPage Expo overview. They are visual discovery aids,
not authoritative legal boundaries, navigation instructions, or a live map.
