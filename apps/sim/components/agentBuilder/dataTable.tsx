'use client'

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  allowSelectColumns: boolean
  selectedColumns: string[]
  setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  allowSelectColumns = false,
  selectedColumns = [],
  setSelectedColumns = () => {},
}: DataTableProps<TData, TValue>) {
  const toggleColumn = (colId: string) => {
    if (allowSelectColumns) {
      setSelectedColumns((prev) =>
        prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
      )
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return data.length === 1 ? (
    <div className='p-4 text-center text-muted-foreground text-sm'>No data available.</div>
  ) : (
    <Table className='table-fixed border-collapse'>
      <TableHeader className='sticky top-0 z-10'>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className='divide-x-1 divide-grey-200'>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className='sticky top-0 z-10 whitespace-nowrap p-2 align-top '
                style={
                  {
                    //maxWidth: maxColWidth,
                    //   overflow: "hidden",
                    //   textOverflow: "ellipsis",
                  }
                }
              >
                {!header.isPlaceholder && (
                  <div className='flex items-center gap-2'>
                    {allowSelectColumns && (
                      <Checkbox
                        checked={selectedColumns.includes(header.id)}
                        onCheckedChange={() => toggleColumn(header.id)}
                      />
                    )}
                    <span className='break-words'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className='align-top'
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    verticalAlign: 'top',
                  }}
                >
                  <div
                    className='line-clamp-3 whitespace-normal break-words'
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordWrap: 'break-word',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell className='h-24 text-center' colSpan={columns.length}>
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
