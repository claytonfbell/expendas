import {
  Box,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import EditIcon from "@material-ui/icons/Edit"
import React from "react"
import { StyledTableRow } from "./StyledTableRow"

export interface ResponsiveTableSchema<DataItem> {
  headerLabel: string
  alignRight?: boolean
  render: (data: DataItem) => React.ReactElement
}

export interface ResponsiveTableProps<DataItem> {
  schema: ResponsiveTableSchema<DataItem>[]
  rowData: DataItem[]
  totalRow?: React.ReactNode
  className?: string
  onEdit?: (dataItem: DataItem) => void
  onDelete?: (dataItem: DataItem) => void
}

export function ResponsiveTable<T extends object>({
  onEdit,
  onDelete,
  ...props
}: ResponsiveTableProps<T>) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down("xs"))

  return isXs ? (
    <Box className={props.className}>
      {props.rowData.map((dataItem, index) => {
        return (
          <Paper key={index} style={{ marginBottom: 16 }}>
            <Box padding={1}>
              {props.schema.map((x, index) => {
                return (
                  <Grid
                    key={index}
                    container
                    spacing={2}
                    justify="space-between"
                  >
                    <Grid item>{x.headerLabel}</Grid>
                    <Grid item>{x.render(dataItem)}</Grid>
                  </Grid>
                )
              })}

              {onEdit !== undefined || onDelete !== undefined ? (
                <Grid container spacing={2} justify="space-between">
                  <Grid item></Grid>
                  <Grid item>
                    {onEdit !== undefined ? (
                      <IconButton size="small" onClick={() => onEdit(dataItem)}>
                        <EditIcon />
                      </IconButton>
                    ) : null}
                    {onDelete !== undefined ? (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(dataItem)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : null}
                  </Grid>
                </Grid>
              ) : null}
            </Box>
          </Paper>
        )
      })}
      {props.totalRow}
    </Box>
  ) : (
    <TableContainer component={Paper} className={props.className}>
      <Table>
        <TableHead>
          <StyledTableRow>
            {props.schema.map((x, index) => {
              return (
                <TableCell
                  key={index}
                  align={x.alignRight === true ? "right" : undefined}
                >
                  {x.headerLabel}
                </TableCell>
              )
            })}
            {onEdit !== undefined || onDelete !== undefined ? (
              <TableCell align="right"></TableCell>
            ) : null}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          <StyledTableRow />
          {props.rowData.map((dataItem, index) => {
            return (
              <StyledTableRow key={index}>
                {props.schema.map((x, index) => {
                  return (
                    <TableCell
                      key={index}
                      align={x.alignRight === true ? "right" : undefined}
                    >
                      {x.render(dataItem)}
                    </TableCell>
                  )
                })}
                {onEdit !== undefined || onDelete !== undefined ? (
                  <TableCell align="right" style={{ whiteSpace: "nowrap" }}>
                    {onEdit !== undefined ? (
                      <IconButton size="small" onClick={() => onEdit(dataItem)}>
                        <EditIcon />
                      </IconButton>
                    ) : null}
                    {onDelete !== undefined ? (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(dataItem)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : null}
                  </TableCell>
                ) : null}
              </StyledTableRow>
            )
          })}
          {props.totalRow}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
