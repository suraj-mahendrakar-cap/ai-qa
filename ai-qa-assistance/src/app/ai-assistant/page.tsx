"use client";

import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chatbot } from "@/components/chatbot";
import { MessageCircle, Bot, Settings, BookOpen, Zap } from "lucide-react";

export default function AIAssistantPage() {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">AI Assistant</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent companion for Postman collection management,
            variable configuration, and API testing assistance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Smart Variable Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatically identifies missing environment variables in your
                Postman collections and provides intelligent suggestions for
                configuration.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Variable Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in variable editor with save/load functionality. Manage
                your environment variables with ease and security.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Context-Aware Help</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get intelligent assistance based on your specific collection
                structure and API testing needs.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Real-time Execution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure variables and run collections seamlessly with
                integrated execution capabilities.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Bot className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>AI-Powered Troubleshooting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get intelligent help with API errors, authentication issues, and
                performance optimization.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Natural Language</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Communicate with the AI assistant using natural language. No
                need to learn complex commands.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Ready to Get Started?</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Start a conversation with the AI assistant to get help with your
              Postman collections, configure variables, or troubleshoot API
              issues.
            </p>
            <Button
              size="lg"
              onClick={() => setShowChatbot(true)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Start Chat
            </Button>
          </CardContent>
        </Card>

        {/* Example Use Cases */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Example Use Cases
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Variable Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  "I need help setting up the CLIENT_API_KEY variable for my
                  collection"
                </p>
                <p className="text-sm text-muted-foreground">
                  "What should I set for the baseUrl variable?"
                </p>
                <p className="text-sm text-muted-foreground">
                  "Help me configure authentication variables"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  "My requests are failing with 401 errors"
                </p>
                <p className="text-sm text-muted-foreground">
                  "How do I fix CORS issues in my API calls?"
                </p>
                <p className="text-sm text-muted-foreground">
                  "Why are my requests timing out?"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  "How should I organize my environment variables?"
                </p>
                <p className="text-sm text-muted-foreground">
                  "What's the best way to handle sensitive data?"
                </p>
                <p className="text-sm text-muted-foreground">
                  "How can I optimize my collection performance?"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collection Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  "How do I structure my Postman collection?"
                </p>
                <p className="text-sm text-muted-foreground">
                  "What's the difference between environment and global
                  variables?"
                </p>
                <p className="text-sm text-muted-foreground">
                  "How can I share variables between requests?"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chatbot Modal */}
        <Chatbot
          isOpen={showChatbot}
          onClose={() => setShowChatbot(false)}
          initialContext="Hello! I'm your AI assistant for Postman collection management. I can help you with variable configuration, troubleshooting API issues, and providing best practices for API testing. How can I assist you today?"
        />
      </div>
    </Layout>
  );
}
