-- Extend existing membershipId from YSU + 5 digits to YSU + 8 digits
-- Pads the numeric portion with leading zeros: YSU55711 → YSU00055711
UPDATE "Member"
SET "membershipId" = 'YSU' || LPAD(SUBSTRING("membershipId" FROM 4), 8, '0')
WHERE LENGTH("membershipId") < 11;
