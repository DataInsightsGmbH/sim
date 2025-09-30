import type React from 'react'
import { type DragEvent, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Copy, FileSpreadsheet, Text, Upload } from 'lucide-react'
import * as Papa from 'papaparse'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { DataTable } from './dataTable'
import { IconSwitch } from './iconSwitch'

type DataInputProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  setData: (data: object[] | string) => void
  tableMode: boolean
  setTableMode: (active: boolean) => void
  onFile?: (file: File) => void
  accept?: string
  placeholder?: string
}

export function DataInput({
  title,
  setData,
  tableMode = false,
  setTableMode,
  onFile,
  accept = 'text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  placeholder,
  ...props
}: DataInputProps) {
  const [rawData, setRawData] = useState<object[] | string>('')
  const [columns, setColumns] = useState<ColumnDef<string | object, string>[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [dragOver, setDragOver] = useState<boolean>(false)
  const [noDrop, setNoDrop] = useState<boolean>(false)
  const acceptTypes = useMemo(
    () => (accept ? new Set(accept.split(',').map((x) => x.trim())) : null),
    [accept]
  )

  const copyToClipboard = async (rawData: object[] | string, title: string) => {
    const text = tableMode ? JSON.stringify(rawData, null, '\t') : (rawData as string)

    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard', {
        description: `Content from ${title} has been copied.`,
      })
    } catch (error) {
      toast.error('Failed to copy', {
        description: `Could not copy text to clipboard: ${error}`,
      })
    }
  }

  const unDrag = () => {
    setDragOver(false)
    setNoDrop(false)
  }

  const getFile = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null
    if (e.target instanceof HTMLInputElement) {
      file = e.target.files?.length ? e.target.files[0] : null
    } else if ('dataTransfer' in e && e.dataTransfer instanceof DataTransfer) {
      file = e.dataTransfer.files[0] ?? e.dataTransfer.items[0] ?? null
    }
    return file
  }

  const initialize = (rows: object[]) => {
    setRawData(rows)
    setData(rows)
    if (rows.length > 0) {
      const sample = rows[0]
      const cols = Object.keys(sample).map((key) => ({
        accessorKey: key,
        header: key,
      })) as ColumnDef<string | object, string>[]
      setColumns(cols)
      setSelectedColumns(Object.keys(sample))
    }
  }

  const onFileChange = async (
    e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault()
    e.stopPropagation()
    unDrag()
    const file = getFile(e)
    if (!file || (acceptTypes && !acceptTypes.has(file.type))) {
      return
    }

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results: { data: object[] }) => {
          const rows = results.data as object[]
          initialize(rows)
          setTableMode(true)
        },
      })
    } else if (file.name.endsWith('.xlsx')) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as object[]
        initialize(rows)
        setTableMode(true)
      }
      reader.readAsBinaryString(file)
    }

    if (onFile) {
      onFile(file)
    }
  }

  const onToggleTableMode = (checked: boolean) => {
    if (!checked) {
      setRawData('')
      setData('')
      setSelectedColumns([])
    }
    if (checked) {
      setRawData([])
      setData([])
      setSelectedColumns([])
    }
    setTableMode(checked)
  }

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setRawData(text)
    setData(text)
  }

  useEffect(() => {
    if (!tableMode || typeof rawData === 'string') {
      return
    }
    const rows = (rawData as object[]).map((row) =>
      selectedColumns.reduce((acc: Record<string, string | object>, key: string) => {
        if (key in row) {
          acc[key] = (row as Record<string, string | object>)[key]
        }
        return acc
      }, {})
    )
    setData(rows)
  }, [selectedColumns, rawData, setData, tableMode])

  return (
    <div
      {...props}
      className={cn(
        'relative flex h-full w-full max-w-full flex-col rounded-xl bg-muted',
        props.className ?? ''
      )}
      style={{ maxWidth: '100%' }}
    >
      <div className='flex w-full flex-row items-center justify-between p-2 px-4'>
        <h2 className='z-10 font-medium'>{title}</h2>
        <div className='flex gap-2'>
          {tableMode && rawData.length > 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload />
              <span>Change File</span>
              <input
                id='file-upload'
                type='file'
                accept={accept}
                className='hidden'
                onChange={onFileChange}
              />
            </Button>
          )}
          <IconSwitch
            checked={tableMode}
            onChange={onToggleTableMode}
            iconChecked={Text}
            iconNotChecked={FileSpreadsheet}
          />
        </div>
      </div>
      <div className='px-4'>
        <Separator />
      </div>
      <div
        className={cn(
          'relative flex h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-b-xl bg-background',
          dragOver && 'border-primary bg-accent',
          noDrop && 'border-destructive'
        )}
        onDragEnter={(e) => {
          const file = getFile(e)
          if (!file || (acceptTypes && !acceptTypes.has(file.type))) {
            setNoDrop(true)
          } else {
            setDragOver(true)
          }
        }}
        onDragLeave={unDrag}
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          e.stopPropagation()
          return false
        }}
        onDrop={onFileChange}
      >
        {!dragOver && !tableMode && (
          <Textarea
            value={typeof rawData === 'string' ? (rawData as string) : JSON.stringify(rawData[0])}
            onChange={onTextChange}
            className='h-full flex-1 resize-none rounded-xl border-none p-4 pt-2 font-mono text-sm focus-visible:ring-0'
            placeholder={placeholder || 'Enter text here...'}
          />
        )}
        {!dragOver && tableMode && rawData.length > 0 && (
          <div className='w-full flex-1 overflow-x-auto p-2'>
            {rawData.length > 0 && (
              <DataTable
                columns={columns}
                data={rawData as object[]}
                allowSelectColumns={true}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
              />
            )}
          </div>
        )}
        {!dragOver && tableMode && rawData.length === 0 && (
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload />
              <span>Select File</span>
              <input
                id='file-upload'
                type='file'
                accept={accept}
                className='hidden'
                onChange={onFileChange}
              />
            </Button>
          </div>
        )}
        {dragOver && (
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
            <Upload />
            <span className='pointer-events-none mt-2'>Drop File</span>
          </div>
        )}
        <Button
          onClick={() => copyToClipboard(rawData, title)}
          className='absolute right-5 bottom-2 z-10 bg-muted/50'
          size='icon'
          variant='ghost'
        >
          <Copy className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
