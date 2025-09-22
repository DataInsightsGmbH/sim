'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AgentBuilder } from '@/components/agentBuilder/agentBuilder'

function FloatingWindow({
  title,
  children,
  initialWidth = 600,
  initialHeight = 400,
}: {
  title: string
  children: ReactNode
  initialWidth?: number
  initialHeight?: number
}) {
  const [position, setPosition] = useState({ top: 100, left: 100 })
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight })
  const panelRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // drag window
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = {
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging.current) {
      setPosition({
        left: e.clientX - dragOffset.current.x,
        top: e.clientY - dragOffset.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    dragging.current = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // resize (bottom-right corner)
  const handleResize = (e: React.MouseEvent) => {
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = size.width
    const startHeight = size.height

    const onMouseMove = (moveEvent: MouseEvent) => {
      setSize({
        width: Math.max(200, startWidth + moveEvent.clientX - startX),
        height: Math.max(200, startHeight + moveEvent.clientY - startY),
      })
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      ref={panelRef}
      className="absolute overflow-hidden rounded-lg border bg-primary shadow-lg border-teal-500"
      style={{
        top: position.top,
        left: position.left,
        width: size.width,
        height: size.height,
        zIndex: 1000,
      }}
    >
      <div
        className="cursor-move select-none bg-teal-500 px-4 py-2 text-white"
        onMouseDown={handleMouseDown}
      >
        {title}
      </div>

      <div className="h-full w-full border-t">{children}</div>

      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize bg-teal-500"
        onMouseDown={handleResize}
      />
    </div>
  )
}

export function AgentBuilderButton({
  blockId,
  subBlockId,
  label,
  disabled = false,
}: {
  blockId: string,
  subBlockId: string,
  label: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 border-teal-500 px-4 font-normal text-sm text-teal-500 hover:bg-grey-500"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        {label}
      </Button>

      {open && (
        <FloatingWindow title="Agent Builder">
          < AgentBuilder
            blockId={blockId}
            subBlockId={subBlockId}
            />
        </FloatingWindow>
      )}
    </>
  )
}