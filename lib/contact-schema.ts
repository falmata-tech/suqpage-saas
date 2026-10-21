// Public contact defaults never derive from account or notification details.
export const CONTACT_SCHEMA_SQL = `
  ALTER TABLE businesses ADD COLUMN public_email TEXT NOT NULL DEFAULT '' CHECK(length(public_email)<=254);
  ALTER TABLE businesses ADD COLUMN public_phone TEXT NOT NULL DEFAULT '' CHECK(length(public_phone)<=40);
  ALTER TABLE users ADD COLUMN account_phone TEXT NOT NULL DEFAULT '' CHECK(length(account_phone)<=40);
`;
