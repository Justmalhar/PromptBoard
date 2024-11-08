"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string
  onSave: (apiKey: string) => void
}

export function SettingsDialog({ open, onOpenChange, apiKey, onSave }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1b74e4]">Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const newApiKey = formData.get("apiKey") as string
          onSave(newApiKey)
        }}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-gray-700">OpenAI API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                defaultValue={apiKey}
                required
                className="bg-gray-50 focus:ring-[#1b74e4] focus:border-[#1b74e4]"
                placeholder="sk-..."
              />
              <p className="text-xs text-gray-500">Your API key is stored locally and never shared.</p>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#1b74e4] hover:bg-[#1a6fd1] text-white transition-colors"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}