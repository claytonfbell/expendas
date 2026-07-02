import { Chip } from "@mui/material"
import { AccountBucket } from "@prisma/client"
import { displayAccountBucket } from "./accountBuckets"

export function AccountBucketChip({
  bucket,
}: {
  bucket: AccountBucket | null
}) {
  const color =
    bucket === "After_Tax"
      ? "primary"
      : bucket === "Traditional"
        ? "warning"
        : "success"

  return bucket !== null ? (
    <Chip
      label={displayAccountBucket(bucket)}
      size="small"
      color={color}
      variant="outlined"
    />
  ) : null
}
