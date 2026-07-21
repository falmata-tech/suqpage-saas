# Security policy

Do not publish database files, `.env`, `.local/seed-credentials.txt`, uploaded media directories or backups.

Report a suspected security issue privately to `falmata.dawano@gmail.com`. Include the affected route, reproduction steps and observed impact. Do not include real customer information in screenshots or reports.

Before deployment run `npm run release`. Rotate affected passwords, revoke sessions, and restore from a verified backup after a confirmed compromise.
