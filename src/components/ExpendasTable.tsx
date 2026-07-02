import { Table, TableContainer } from "@mui/material"

// can expand this later if we want to make it fully automatic and render headers, rows and cells

export function ExpendasTable({ children }: { children: React.ReactNode }) {
  return (
    <TableContainer>
      <Table
        size="small"
        sx={{
          "& td, & th": {
            // no left padding on first and right padding on last
            ":first-of-type": {
              paddingLeft: 0,
            },
            ":last-child": {
              paddingRight: 0,
            },
            // no word wrap
            whiteSpace: "nowrap",
          },
        }}
      >
        {children}
      </Table>
    </TableContainer>
  )
}
