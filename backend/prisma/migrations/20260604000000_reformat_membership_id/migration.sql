-- Reformat existing membershipIds to new format: YSU + 2-digit year + month letter + 5 digits
-- Month letters (Jan–Dec): J F M A Y N L G S O V D
-- Example: YSU26N76896  (registered June 2026)

-- Widen column to 11 chars (new format is exactly 11)
ALTER TABLE "Member" ALTER COLUMN "membershipId" TYPE VARCHAR(11);

-- Reformat all IDs that still match the old all-digits suffix format (YSU + 8 digits)
-- Uses createdAt for year/month, and a deterministic 5-digit hash of the row id for the suffix.
UPDATE "Member"
SET "membershipId" =
  'YSU'
  || TO_CHAR("createdAt", 'YY')
  || CASE EXTRACT(MONTH FROM "createdAt")::int
       WHEN 1  THEN 'J'
       WHEN 2  THEN 'F'
       WHEN 3  THEN 'M'
       WHEN 4  THEN 'A'
       WHEN 5  THEN 'Y'
       WHEN 6  THEN 'N'
       WHEN 7  THEN 'L'
       WHEN 8  THEN 'G'
       WHEN 9  THEN 'S'
       WHEN 10 THEN 'O'
       WHEN 11 THEN 'V'
       WHEN 12 THEN 'D'
     END
  || LPAD(((ABS(HASHTEXT("id")) % 90000) + 10000)::text, 5, '0')
WHERE "membershipId" ~ '^YSU[0-9]+$';
