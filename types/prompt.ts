export interface PromptCard {
  id: string
  prompt: string
  model: string
  result?: string
  config: {
    temperature: number
    maxTokens: number
  }
}