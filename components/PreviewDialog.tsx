"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReactMarkdown from 'react-markdown'

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: string
}

export function PreviewDialog({ open, onOpenChange, content }: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white/90 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>Markdown Preview</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto prose prose-sm">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  )
}