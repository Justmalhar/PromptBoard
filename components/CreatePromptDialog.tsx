"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PromptCard } from "@/types/prompt"

interface CreatePromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateCard: (card: PromptCard) => void
}

export function CreatePromptDialog({ open, onOpenChange, onCreateCard }: CreatePromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1b74e4]">Create New Prompt</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const newCard: PromptCard = {
            id: Date.now().toString(),
            prompt: formData.get("prompt") as string,
            model: formData.get("model") as string,
            config: {
              temperature: parseFloat(formData.get("temperature") as string),
              maxTokens: parseInt(formData.get("maxTokens") as string),
            }
          }
          onCreateCard(newCard)
        }}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea 
                id="prompt" 
                name="prompt" 
                required 
                className="min-h-[100px] bg-gray-50 focus:ring-[#1b74e4]" 
                placeholder="Enter your prompt here..."
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Select name="model" defaultValue="gpt-4">
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                  <SelectItem value="gpt-40">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="temperature">Temperature ({0.7})</Label>
                <Input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.7"
                  name="temperature"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Controls randomness: Lower values are more focused, higher values are more creative.</p>
              </div>
              <div>
                <Label htmlFor="maxTokens">Max Tokens ({6000})</Label>
                <Input
                  type="number"
                  min="1"
                  max="32000"
                  defaultValue="6000"
                  name="maxTokens"
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum length of the generated response.</p>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#1b74e4] hover:bg-[#1a6fd1] text-white">
              Create Prompt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}