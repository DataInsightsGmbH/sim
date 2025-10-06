import type React from 'react'
import { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
import { highlight, languages } from 'prismjs'
import Editor from 'react-simple-code-editor'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSubBlockValue } from '@/app/workspace/[workspaceId]/w/[workflowId]/components/workflow-block/components/sub-block/hooks/use-sub-block-value'
import JsonSkeleton from './jsonSkeleton'

type DataFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  data: string | object
  setData: (data: string | object) => void
  dataLoading?: boolean
  buttonTitle?: string
  onButtonClick?: () => void
  placeholder?: string
  disabled?: boolean
  blockId: string
  subBlockId: string
  codeEditor?: boolean
}

export function DataField({
  title,
  data,
  setData,
  dataLoading = false,
  buttonTitle,
  onButtonClick,
  placeholder,
  disabled,
  blockId,
  subBlockId,
  codeEditor = false,
  ...props
}: DataFieldProps) {
  const [schema, setSchema] = useState<object | string>({})
  const [storeSchema, setStoreSchema] = useSubBlockValue(blockId, `${subBlockId}_schema`, false)

  const copyToClipboard = async (data: string | object, title: string) => {
    const text = codeEditor ? JSON.stringify(data, null, '\t') : (data as string)

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

  const [localValue, setLocalValue] = useState(
    typeof data === 'string' ? data : JSON.stringify(data ?? '', null, 2)
  )

  useEffect(() => {
    setLocalValue(typeof data === 'string' ? data : JSON.stringify(data ?? '', null, 2))
  }, [data])

  return (
    <div
      {...props}
      className={`relative flex h-full flex-col overflow-auto rounded-xl bg-muted ${props.className ?? ''}`}
    >
      <div className='flex w-full flex-row items-center justify-between p-2 px-4'>
        <h2 className='z-10 font-medium'>{title}</h2>
        {buttonTitle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='inline-block'>
                  <Button
                    onClick={onButtonClick}
                    className='z-10 hover:bg-accent hover:text-white'
                    size='sm'
                    disabled={disabled}
                  >
                    {buttonTitle}
                  </Button>
                </span>
              </TooltipTrigger>
              {disabled && (
                <TooltipContent side='top'>
                  To generate a schema you first need to provide a Schema Description.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className='px-4'>
        <Separator />
      </div>
      <div className='flex h-0 flex-1 flex-col overflow-hidden rounded-b-xl bg-background font-mono'>
        {codeEditor ? (
          <div className='min-h-0 flex-1 overflow-hidden'>
            {dataLoading ? (
              <JsonSkeleton />
            ) : (
              <Editor
                value={localValue}
                onValueChange={(newCode) => {
                  setLocalValue(newCode)
                }}
                onBlur={() => {
                  setSchema(localValue)
                  setStoreSchema(localValue)
                  setData(localValue)
                }}
                highlight={(code) => highlight(code, languages.javascript, 'javascript')}
                padding={12}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  lineHeight: '21px',
                  outline: 'none',
                }}
                className={cn('code-editor-area caret-primary dark:caret-white')}
                textareaClassName={cn(
                  'focus:outline-none focus:ring-0 border-none bg-transparent resize-none'
                )}
              />
            )}
          </div>
        ) : (
          <Textarea
            value={data.toString()}
            onChange={(e) => setData(e.target.value)}
            className='h-full flex-1 resize-none rounded-xl border-none p-4 pt-2 font-mono text-sm focus-visible:ring-0'
            placeholder={placeholder || 'Enter text here...'}
          />
        )}
        <Button
          onClick={() => copyToClipboard(data, title)}
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
