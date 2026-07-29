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

`ethiopia-places-osm.geojson` contains city and town points queried from
OpenStreetMap through the public Overpass API on July 29, 2026. Points outside
the FEWS NET Ethiopia boundary were removed. `ethiopia-major-roads-osm.geojson`
contains a restrained set of simplified inter-city road corridors routed on
OpenStreetMap data through the public OSRM service on the same date.

- OpenStreetMap copyright: https://www.openstreetmap.org/copyright
- Open Database License: https://opendatacommons.org/licenses/odbl/
- OSRM project: https://project-osrm.org/

The local copies retain only the names, classifications, coordinates, and
geometry needed for the SuqPage Expo overview. They are visual discovery aids,
not authoritative legal boundaries, navigation instructions, or a live map.
