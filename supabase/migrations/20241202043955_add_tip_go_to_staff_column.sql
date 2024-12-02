-- Add tips_go_to_staff column to reports table
ALTER TABLE reports
ADD COLUMN tips_go_to_staff boolean DEFAULT NULL;

-- Add comment to describe the column
COMMENT ON COLUMN reports.tips_go_to_staff IS 'Indicates whether tips/service charges go to front-of-house staff'; 