import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  X,
  Loader2,
  Wand2,
  ImagePlus,
  GripVertical,
  Edit3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api";
import { CanvasElement } from "./types";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  actions?: CanvasAction[];
  attachments?: ChatAttachment[];
  elementContext?: ElementContext[];
  createdAt?: string;
}

interface CanvasAction {
  type:
    | "add_sticky_note"
    | "add_text"
    | "add_shape"
    | "modify_element"
    | "delete_element"
    | "suggest";
  payload: any;
  targetElementId?: string;
}

interface ElementContext {
  id: string;
  type: string;
  content: string;
}

interface ChatAttachment {
  type: "image" | "element";
  data: string;
  elementContext?: ElementContext;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId?: string;
  ideaTitle: string;
  canvasElements: CanvasElement[];
  selectedElements?: CanvasElement[];
  onExecuteActions: (actions: CanvasAction[]) => void;
}

export function AIAssistantPanel({
  isOpen,
  onClose,
  ideaId,
  ideaTitle,
  canvasElements,
  selectedElements = [],
  onExecuteActions,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Add a problem statement",
    "Describe my solution",
    "List the benefits",
  ]);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [targetElements, setTargetElements] = useState<ElementContext[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history when panel opens or ideaId changes
  useEffect(() => {
    if (isOpen && ideaId) {
      loadChatHistory();
    }
  }, [isOpen, ideaId]);

  // Add welcome message if no history
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isLoadingHistory) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm your AI assistant. I can help you build out your idea "${
            ideaTitle || "Untitled Idea"
          }". 

You can:
• Ask me to add content to your canvas
• Drag elements here to modify them
• Attach images for context

Try asking me to add a problem statement, solution, or benefits!`,
        },
      ]);
    }
  }, [isOpen, messages.length, isLoadingHistory, ideaTitle]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Update target elements when selected elements change
  useEffect(() => {
    if (selectedElements.length > 0) {
      const contexts = selectedElements.map((el) => ({
        id: el.id,
        type: el.type,
        content: (el.data as any)?.content || (el.data as any)?.title || "",
      }));
      setTargetElements(contexts);
    }
  }, [selectedElements]);

  const loadChatHistory = async () => {
    if (!ideaId) return;

    setIsLoadingHistory(true);
    try {
      const response = await aiApi.getChatHistory(ideaId);
      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(
          response.data.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            actions: msg.actions,
            attachments: msg.attachments,
            elementContext: msg.elementContext,
            createdAt: msg.createdAt,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message to UI immediately
    const userChatMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      elementContext:
        targetElements.length > 0 ? [...targetElements] : undefined,
    };
    setMessages((prev) => [...prev, userChatMessage]);
    setIsLoading(true);

    // Clear attachments and target elements after sending
    const sentAttachments = [...attachments];
    const sentTargetElements = [...targetElements];
    setAttachments([]);
    setTargetElements([]);

    try {
      // Use V2 API if we have an ideaId
      if (ideaId) {
        const response = await aiApi.assistantChatV2({
          ideaId,
          message: userMessage,
          ideaTitle,
          canvasElements: canvasElements.map((el) => ({
            id: el.id,
            type: el.type,
            position: el.position,
            size: el.size,
            data: el.data,
          })),
          attachments: sentAttachments,
          targetElements: sentTargetElements,
        });

        const { message, actions, suggestions: newSuggestions } = response.data;

        // Add assistant response
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: message, actions },
        ]);

        // Update suggestions if provided
        if (newSuggestions && newSuggestions.length > 0) {
          setSuggestions(newSuggestions);
        }

        // Execute actions
        if (actions && actions.length > 0) {
          onExecuteActions(actions);
        }
      } else {
        // Fallback to legacy API
        const chatHistory = messages
          .filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0)
          .map((msg) => ({ role: msg.role, content: msg.content }));

        const response = await aiApi.assistantChat({
          message: userMessage,
          ideaTitle,
          canvasElements: canvasElements.map((el) => ({
            id: el.id,
            type: el.type,
            position: el.position,
            size: el.size,
            data: el.data,
          })),
          chatHistory,
        });

        const { message, actions, suggestions: newSuggestions } = response.data;

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: message, actions },
        ]);

        if (newSuggestions && newSuggestions.length > 0) {
          setSuggestions(newSuggestions);
        }

        if (actions && actions.length > 0) {
          onExecuteActions(actions);
        }
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachments((prev) => [...prev, { type: "image", data: base64 }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeTargetElement = (id: string) => {
    setTargetElements((prev) => prev.filter((el) => el.id !== id));
  };

  // Handle drag and drop of elements
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Check for element data
    const elementData = e.dataTransfer.getData("application/canvas-element");
    if (elementData) {
      try {
        const element = JSON.parse(elementData);
        const context: ElementContext = {
          id: element.id,
          type: element.type,
          content: element.data?.content || element.data?.title || "",
        };
        setTargetElements((prev) => {
          if (prev.some((el) => el.id === context.id)) return prev;
          return [...prev, context];
        });
      } catch (error) {
        console.error("Failed to parse dropped element:", error);
      }
    }

    // Check for files (images)
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAttachments((prev) => [
              ...prev,
              { type: "image", data: base64 },
            ]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, []);

  const getActionSummary = (actions: CanvasAction[]) => {
    const added = actions.filter(
      (a) => a.type === "add_sticky_note" || a.type === "add_text"
    ).length;
    const modified = actions.filter((a) => a.type === "modify_element").length;
    const deleted = actions.filter((a) => a.type === "delete_element").length;

    const parts = [];
    if (added > 0) parts.push(`Added ${added}`);
    if (modified > 0) parts.push(`Modified ${modified}`);
    if (deleted > 0) parts.push(`Deleted ${deleted}`);

    return (
      parts.join(", ") +
      " element" +
      (added + modified + deleted > 1 ? "s" : "")
    );
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 z-50 flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "w-[400px] translate-x-0" : "w-0 translate-x-full"
      )}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  AI Assistant
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Helps you build your idea
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className={cn(
              "flex-1 overflow-y-auto p-4 space-y-4",
              isDragOver && "bg-blue-50 dark:bg-blue-900/20"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800"
                      )}
                    >
                      {/* Show attached elements */}
                      {msg.elementContext && msg.elementContext.length > 0 && (
                        <div className="mb-2 pb-2 border-b border-white/20 dark:border-slate-700">
                          <p className="text-xs opacity-75 mb-1">
                            Targeting elements:
                          </p>
                          {msg.elementContext.map((el) => (
                            <div
                              key={el.id}
                              className="text-xs bg-white/10 dark:bg-slate-700 rounded px-2 py-1 mt-1"
                            >
                              {el.type}: {el.content.substring(0, 50)}
                              {el.content.length > 50 ? "..." : ""}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show attached images */}
                      {msg.attachments &&
                        msg.attachments.filter((a) => a.type === "image")
                          .length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {msg.attachments
                              .filter((a) => a.type === "image")
                              .map((att, i) => (
                                <img
                                  key={i}
                                  src={att.data}
                                  alt="Attached"
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                          </div>
                        )}

                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20 dark:border-slate-700">
                          <p className="text-xs opacity-75 flex items-center gap-1">
                            <Wand2 className="w-3 h-3" />
                            {getActionSummary(msg.actions)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-slate-500">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isDragOver && (
                  <div className="flex items-center justify-center py-8 border-2 border-dashed border-blue-400 rounded-xl">
                    <p className="text-blue-500 text-sm">
                      Drop elements or images here
                    </p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Target Elements */}
          {targetElements.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                Targeting elements:
              </p>
              <div className="flex flex-wrap gap-2">
                {targetElements.map((el) => (
                  <div
                    key={el.id}
                    className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                  >
                    <GripVertical className="w-3 h-3" />
                    <span className="max-w-[150px] truncate">
                      {el.type}: {el.content.substring(0, 20)}
                    </span>
                    <button
                      onClick={() => removeTargetElement(el.id)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Attachments:
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, index) => (
                  <div key={index} className="relative group">
                    {att.type === "image" && (
                      <img
                        src={att.data}
                        alt="Attachment"
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-900">
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                title="Attach image"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    targetElements.length > 0
                      ? "What would you like to do with these elements?"
                      : "Ask me to add or modify content..."
                  }
                  className="w-full px-4 py-3 pr-12 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none min-h-[48px] max-h-[120px]"
                  disabled={isLoading}
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    "absolute right-2 bottom-2 p-2 rounded-lg transition-colors",
                    inputValue.trim() && !isLoading
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Drag elements here to target them for modification
            </p>
          </div>
        </>
      )}
    </div>
  );
}
