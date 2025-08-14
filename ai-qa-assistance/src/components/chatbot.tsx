"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/config";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Loader2,
  Settings,
  Save,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  variables?: Record<string, string>;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onVariablesUpdate?: (variables: Record<string, string>) => void;
  initialContext?: string;
}

export function Chatbot({
  isOpen,
  onClose,
  onVariablesUpdate,
  initialContext,
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [showVariables, setShowVariables] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with context if provided
  useEffect(() => {
    if (initialContext && messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Hello! I'm here to help you with your Postman collection execution. ${initialContext}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [initialContext, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/chatbot"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          variables: variables,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        variables: data.variables,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update variables if new ones are provided
      if (data.variables) {
        const newVariables = { ...variables, ...data.variables };
        setVariables(newVariables);
        onVariablesUpdate?.(newVariables);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveVariables = () => {
    // Save variables to localStorage
    localStorage.setItem("postman-variables", JSON.stringify(variables));
    onVariablesUpdate?.(variables);
  };

  const loadVariables = () => {
    const saved = localStorage.getItem("postman-variables");
    if (saved) {
      const parsed = JSON.parse(saved);
      setVariables(parsed);
      onVariablesUpdate?.(parsed);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    if (initialContext) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Hello! I'm here to help you with your Postman collection execution. ${initialContext}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVariables(!showVariables)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Variables Panel */}
        {showVariables && (
          <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Environment Variables</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={loadVariables}>
                  Load
                </Button>
                <Button size="sm" onClick={saveVariables}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {Object.entries(variables).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <Input
                    size={1}
                    value={key}
                    onChange={(e) => {
                      const newVariables = { ...variables };
                      delete newVariables[key];
                      newVariables[e.target.value] = value;
                      setVariables(newVariables);
                    }}
                    className="text-xs"
                    placeholder="Variable name"
                  />
                  <Input
                    size={1}
                    value={value}
                    onChange={(e) => {
                      setVariables((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }));
                    }}
                    className="text-xs"
                    placeholder="Value"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newVariables = { ...variables };
                      delete newVariables[key];
                      setVariables(newVariables);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setVariables((prev) => ({
                    ...prev,
                    [`var_${Object.keys(prev).length + 1}`]: "",
                  }));
                }}
              >
                Add Variable
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.variables &&
                  Object.keys(message.variables).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Variables updated:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(message.variables).map(
                          ([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium">{key}:</span>{" "}
                              {value}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
