"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { ClipboardList, Loader2, CheckCircle, Download, Eye, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Column, PromptCard } from "@/types/prompt"

interface PromptColumnProps {
  column: Column
  onRunPrompt: (card: PromptCard) => void
  onPreview: (content: string) => void
  onDownload: (card: PromptCard) => void
}

export function PromptColumn({ column, onRunPrompt, onPreview, onDownload }: PromptColumnProps) {
  const getColumnIcon = () => {
    switch (column.id) {
      case "todo":
        return <ClipboardList className="w-5 h-5 mr-2 text-[#1b74e4]" />
      case "inprogress":
        return <Loader2 className="w-5 h-5 mr-2 animate-spin text-[#1b74e4]" />
      case "done":
        return <CheckCircle className="w-5 h-5 mr-2 text-[#1b74e4]" />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <h2 className="text-xl font-semibold p-4 flex items-center text-gray-800 border-b border-gray-200">
        {getColumnIcon()}
        {column.title}
      </h2>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="p-4 space-y-4 min-h-[200px]"
          >
            <AnimatePresence>
              {column.cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 group">
                        <CardContent className="p-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[#1b74e4]">
                              <Zap className="w-3 h-3 mr-1" />
                              {card.model}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {card.config.temperature}° temp
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {card.config.maxTokens} tokens
                            </span>
                          </div>
                          <div className="relative">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {card.prompt.length > 150
                                ? `${card.prompt.slice(0, 150)}...`
                                : card.prompt}
                            </p>
                            {card.prompt.length > 150 && (
                              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                          {column.id === "todo" && (
                            <Button 
                              onClick={() => onRunPrompt(card)} 
                              className="bg-[#1b74e4] hover:bg-[#1a6fd1] text-white w-full group-hover:shadow-lg transition-all duration-300"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Run Prompt
                            </Button>
                          )}
                          {column.id === "done" && card.result && (
                            <div className="flex gap-2 w-full">
                              <Button 
                                onClick={() => onPreview(card.result!)} 
                                variant="outline" 
                                className="flex-1 border-[#1b74e4] text-[#1b74e4] hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button 
                                onClick={() => onDownload(card)} 
                                variant="outline" 
                                className="flex-1 border-[#1b74e4] text-[#1b74e4] hover:bg-blue-50"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </motion.div>
  )
}