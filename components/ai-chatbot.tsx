"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  context?: "user" | "responder" | "admin"
}

export function AIChatbot({ context = "user" }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm CrowdGuard AI, your intelligent event management assistant. I can help you with crowd information, safety updates, incident reports, and answer questions about the event. How can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const contextPrompts = {
    user: [
      "What's the current crowd density at Main Stage?",
      "Help me find a lost person",
      "What are the predicted busy times?",
      "Report a safety concern",
    ],
    responder: [
      "Show me active incidents in my zone",
      "What's the fastest route to Food Court?",
      "Request backup for current incident",
      "Update incident status",
    ],
    admin: [
      "Generate system health report",
      "Show me zone utilization analytics",
      "What are the current bottlenecks?",
      "Optimize responder deployment",
    ],
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Mock AI response - in real app, this would call your AI service
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(inputValue, context),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateMockResponse = (input: string, context: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("crowd") || lowerInput.includes("density")) {
      return "Current crowd density at Main Stage is 85% (high). Food Court is at 72% (medium). I recommend avoiding Main Stage area for the next 15 minutes. Would you like me to suggest alternative routes?"
    }

    if (lowerInput.includes("lost") || lowerInput.includes("find")) {
      return "I can help you search for a lost person using our AI-powered CCTV analysis. Please provide a description and photo if available. Our system will scan all camera feeds and provide potential matches with location timestamps."
    }

    if (lowerInput.includes("incident") || lowerInput.includes("emergency")) {
      if (context === "responder") {
        return "You have 2 active incidents in your assigned zones: MED-001 at Main Stage (high priority) and MED-002 at Food Court (medium priority). MED-001 requires immediate attention - person collapsed, unconscious. ETA to location: 3 minutes."
      }
      return "I can help you report an incident. Please describe what you've observed, and I'll categorize it and alert the appropriate responders. For immediate emergencies, please call 911."
    }

    if (lowerInput.includes("prediction") || lowerInput.includes("forecast")) {
      return "Based on our WE-GCN model analysis: Peak crowd expected at 2:30 PM (92% capacity). Main Stage will reach critical density in 15 minutes. I recommend crowd control measures at Entrance A and additional security at Food Court."
    }

    if (lowerInput.includes("route") || lowerInput.includes("navigate")) {
      return "Fastest route to your destination: Take the service path behind VIP area (2.3 minutes). Alternative route via main walkway is currently congested (4.8 minutes). I'll send turn-by-turn directions to your device."
    }

    if (lowerInput.includes("analytics") || lowerInput.includes("report")) {
      return "System Health Report: 98.5% uptime, 24/24 cameras online, AI prediction accuracy at 87%. Today's metrics: 30 incidents resolved, 4.2 min avg response time. Zone utilization: Main Stage (critical), Food Court (high), others (normal)."
    }

    // Default response
    return "I understand you're asking about event management. I can help with crowd monitoring, incident reporting, lost person searches, predictions, navigation, and system analytics. Could you be more specific about what you need assistance with?"
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg pulse-glow"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-xl z-50 ${isMinimized ? "h-16" : "h-[500px]"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">CrowdGuard AI</CardTitle>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Online
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[400px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === "assistant" && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    {message.role === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div className="text-sm">{message.content}</div>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {contextPrompts[context].slice(0, 2).map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-transparent"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about the event..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
