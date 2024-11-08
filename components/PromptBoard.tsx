"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { ClipboardList, Loader2, CheckCircle, Download, Eye, Settings, Github } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'
import OpenAI from 'openai'
import { PromptColumn } from "./PromptColumn"
import { CreatePromptDialog } from "./CreatePromptDialog"
import { PreviewDialog } from "./PreviewDialog"
import { SettingsDialog } from "./SettingsDialog"
import { PromptCard, Column } from "@/types/prompt"

const STORAGE_KEY = 'ai_prompt_board_data'

export default function PromptBoard() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", cards: [] },
    { id: "inprogress", title: "In Progress", cards: [] },
    { id: "done", title: "Done", cards: [] },
  ])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState("")
  const [apiKey, setApiKey] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key')
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }

    const storedData = localStorage.getItem(STORAGE_KEY)
    if (storedData) {
      setColumns(JSON.parse(storedData))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
  }, [columns])

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  })

  const handleCreateCard = (card: PromptCard) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === "todo" ? { ...col, cards: [...col.cards, card] } : col
      )
    )
    setIsCreateDialogOpen(false)
    toast({
      title: "Success",
      description: "Prompt card created successfully",
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const sourceCards = Array.from(sourceColumn.cards)
    const destCards = Array.from(destColumn.cards)
    const [removed] = sourceCards.splice(source.index, 1)
    destCards.splice(destination.index, 0, removed)

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, cards: sourceCards }
        }
        if (col.id === destination.droppableId) {
          return { ...col, cards: destCards }
        }
        return col
      })
    )
  }

  const handleRunPrompt = async (card: PromptCard) => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your OpenAI API key in the settings",
        variant: "destructive",
      })
      return
    }

    try {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === "todo") {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            }
          }
          if (col.id === "inprogress") {
            return {
              ...col,
              cards: [...col.cards, card],
            }
          }
          return col
        })
      )

      const systemPrompt = `You are an expert assistant that creates well-formatted markdown responses based on user prompts. Regardless of the length of user input provide a very detailed response to the query Format with proper markdown:
    - **Bold** for emphasis
    - *Italic* for terminology
    - > Blockquotes for important quotes
    - \`code\` for technical terms
    - Lists (- or 1.) for multiple points
    - Add valid markdown formatted tables 
    - Add new line breaks, line breaks, code, codeblocks etc. 
    - This is a one way conversation with no follow ups expected from the user so write the responses accordingly
    Include relevant statistics, PhD level responses with detailed answers, relelvant Google Search, Wikipedia, Markdown Images from CDN sources or urls that you know wont expire and cite sources using [text](url) format.`;
    

      const completion = await openai.chat.completions.create({
        model: card.model,
        messages: [{role: 'system', content: systemPrompt},{ role: 'user', content: card.prompt }],
        temperature: card.config.temperature,
        max_tokens: card.config.maxTokens,
      })

      const result = completion.choices[0].message.content

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === "inprogress") {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            }
          }
          if (col.id === "done") {
            return {
              ...col,
              cards: [...col.cards, { ...card, result }],
            }
          }
          return col
        })
      )

      toast({
        title: "Success",
        description: "Prompt completed successfully",
      })
    } catch (error: any) {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === "inprogress") {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            }
          }
          if (col.id === "todo") {
            return {
              ...col,
              cards: [...col.cards, card],
            }
          }
          return col
        })
      )

      toast({
        title: "Error",
        description: error.message || "Failed to run prompt",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (card: PromptCard) => {
    if (!card.result) return

    const blob = new Blob([card.result], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prompt_result_${card.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePreview = (content: string) => {
    setPreviewContent(content)
    setIsPreviewDialogOpen(true)
  }

  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey)
    localStorage.setItem('openai_api_key', newApiKey)
    setIsSettingsDialogOpen(false)
    toast({
      title: "Success",
      description: "API key saved successfully",
    })
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-[#1b74e4] text-3xl font-bold">Prompt Board</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#1b74e4] hover:bg-[#1a6fd1] text-white">
              New Prompt
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsDialogOpen(true)} className="border-gray-300">
              <Settings className="h-4 w-4" />
            </Button>
            <a href="https://github.com/yourusername/ai-prompt-board" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="border-gray-300">
                <Github className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <p className="text-gray-600">
            Welcome to the Prompt Board, your intelligent AI workspace for managing and executing AI prompts. Create, organize, and track your prompts with our intuitive interface.
          </p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <PromptColumn
                key={column.id}
                column={column}
                onRunPrompt={handleRunPrompt}
                onPreview={handlePreview}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </DragDropContext>

        <CreatePromptDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateCard={handleCreateCard}
        />

        <PreviewDialog
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
          content={previewContent}
        />

        <SettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
          apiKey={apiKey}
          onSave={handleSaveApiKey}
        />
      </main>

     
    </div>
  )
}