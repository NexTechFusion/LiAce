import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  MessageSquare,
  BookOpen,
  Send,
  Loader2,
  Sliders,
  FileText,
  ExternalLink,
  Plus,
  Check,
  ChevronRight,
  Search,
  User,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { chatRequest } from "@/lib/api";
import { useRightSidebarSettings } from "@/contexts/RightSidebarContext";
import { PROMPT_CHAT } from "@/lib/constants";
// Define message type
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isHTML?: boolean; // Flag to indicate if the content contains HTML
}

interface RightSidebarProps {
  isOpen: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm Lia Ace. Here are some of my features: <br> - Mark a text and see a context menu <br> - Grammar correction <br> - Text rephraser <br> - Text continuations <br> - Word replacements while writing <br> - AI chat",
      sender: "ai",
      isHTML: true,
      timestamp: new Date(),
    }
  ]);
  const [formalityLevel, setFormalityLevel] = useState([50]);
  const [descriptiveLevel, setDescriptiveLevel] = useState([70]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Get context values instead of using local state
  const {
    customEndpoint,
    setCustomEndpoint,
    selectedModel,
    setSelectedModel,
    modelProvider,
    setModelProvider,
    useAutocorrecting,
    setUserAutocorrecting,
    enableReplacements,
    setEnableReplacements,
    enableContinuations,
    setEnableContinuations
  } = useRightSidebarSettings();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Model configuration
  const modelProviders = {
    openai: {
      name: "OpenAI",
      models: [
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
        { id: "gpt-4", name: "GPT-4" },
        { id: "gpt-4-turbo", name: "GPT-4 Turbo" }
      ]
    },
    anthropic: {
      name: "Anthropic",
      models: [
        { id: "claude-2", name: "Claude 2" },
        { id: "claude-instant", name: "Claude Instant" },
        { id: "claude-3-opus", name: "Claude 3 Opus" },
        { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
        { id: "claude-3-haiku", name: "Claude 3 Haiku" }
      ]
    }
  };

  // Get current provider's models
  const getCurrentProviderModels = () => {
    return modelProviders[modelProvider as keyof typeof modelProviders]?.models || [];
  };

  // Handle model provider change
  const handleProviderChange = (value: string) => {
    setModelProvider(value);
    // Set default model for the selected provider
    const defaultModel = modelProviders[value as keyof typeof modelProviders]?.models[0]?.id;
    if (defaultModel) {
      setSelectedModel(defaultModel);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Listen for grammar correction events
  useEffect(() => {
    const handleGrammarCorrection = (event: CustomEvent) => {
      const { formattedHtml, originalText } = event.detail;

      // Add user message first showing what text was checked
      const userMessage: Message = {
        id: (Date.now() - 1).toString(),
        content: `Check grammar for: "${originalText.substring(0, 40)}${originalText.length > 40 ? '...' : ''}"`,
        sender: 'user',
        timestamp: new Date(),
      };

      // Add system message with formatted grammar corrections
      const grammarMessage: Message = {
        id: Date.now().toString(),
        content: formattedHtml,
        sender: 'ai',
        timestamp: new Date(),
        isHTML: true, // Flag to render as HTML
      };

      setMessages(prevMessages => [...prevMessages, userMessage, grammarMessage]);
    };

    // Add event listener
    document.addEventListener('grammarCorrection', handleGrammarCorrection as EventListener);

    // Clean up
    return () => {
      document.removeEventListener('grammarCorrection', handleGrammarCorrection as EventListener);
    };
  }, []);

  // Listen for rephrase result events
  useEffect(() => {
    const handleRephraseResult = (event: CustomEvent) => {
      const { formattedHtml, originalText } = event.detail;

      // Add user message first showing what text was rephrased
      const userMessage: Message = {
        id: (Date.now() - 1).toString(),
        content: `Rephrase text: "${originalText.substring(0, 40)}${originalText.length > 40 ? '...' : ''}"`,
        sender: 'user',
        timestamp: new Date(),
      };

      // Add system message with formatted rephrased text
      const rephraseMessage: Message = {
        id: Date.now().toString(),
        content: formattedHtml,
        sender: 'ai',
        timestamp: new Date(),
        isHTML: true, // Flag to render as HTML
      };

      setMessages(prevMessages => [...prevMessages, userMessage, rephraseMessage]);
    };

    // Add event listener
    document.addEventListener('rephraseResult', handleRephraseResult as EventListener);

    // Clean up
    return () => {
      document.removeEventListener('rephraseResult', handleRephraseResult as EventListener);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    const conversationHistory = messages.map(message => `${message.sender}: ${message.content}`).join('\n');
    const prompt = PROMPT_CHAT.replace('{{CONVERSATION_HISTORY}}', conversationHistory).replace('{{USER_REQUEST}}', inputMessage);

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage(""); // Clear input
    setIsAiLoading(true);

    // Fetch AI response
    const aiResponse = await chatRequest(prompt, undefined, customEndpoint, selectedModel);
    setIsAiLoading(false);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse || "Sorry, I couldn't process your request.",
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, aiMessage]);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-72 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col animate-fade-in">
      <Tabs defaultValue="ai" className="flex-1 flex flex-col">
        <div className="px-3 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800">
          <TabsList className="grid grid-cols-2 h-8">
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3.5 w-3.5 mr-1" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai" className="flex-1 flex flex-col p-0">
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-3" style={{ maxHeight: 'calc(100vh - 190px)' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-lg ${message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-tr-none'
                        : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
                        }`}
                    >
                      {message.isHTML ? (
                        <div className="text-sm grammar-correction" dangerouslySetInnerHTML={{ __html: message.content }} />
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 rounded-tl-none">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <Brain className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={isAiLoading}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isAiLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1">
          <ScrollArea className="h-full p-3">
            <div className="p-3">
              {/*
              <div className="flex items-center mb-2">
                <Sliders className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">AI Style Settings</span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Casual</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Formal</span>
                </div>
                <Slider
                  value={formalityLevel}
                  onValueChange={setFormalityLevel}
                  max={100}
                  step={10}
                  className="mb-1"
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Concise</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Descriptive</span>
                </div>
                <Slider
                  value={descriptiveLevel}
                  onValueChange={setDescriptiveLevel}
                  max={100}
                  step={10}
                  className="mb-1"
                />
              </div>

              <div className="mb-4">
                <div className="mb-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Writing Style</label>
                </div>
                <Select defaultValue="academic">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="blog">Blog Voice</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                */}

              <div className="dark:border-gray-800">
                <div className="flex items-center mb-2">
                  <Brain className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">AI Model Settings</span>
                </div>

                <div className="mb-4">
                  <div className="mb-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Model Provider</label>
                  </div>
                  <Select value={modelProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(modelProviders).map(([id, provider]) => (
                        <SelectItem key={id} value={id}>{provider.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <div className="mb-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Model</label>
                  </div>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentProviderModels().map(model => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Auto Grammar Correction</label>
                    <Switch
                      checked={useAutocorrecting}
                      onCheckedChange={setUserAutocorrecting}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    When enabled, words will be automatically checked and corrected for grammar errors as you type
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Text Continuations</label>
                    <Switch
                      checked={enableContinuations}
                      onCheckedChange={setEnableContinuations}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enable AI-powered text continuations to suggest completions as you type.
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Word Replacements</label>
                    <Switch
                      checked={enableReplacements}
                      onCheckedChange={setEnableReplacements}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enable smart word replacement suggestions to improve your writing.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Custom Inference Endpoint</label>
                </div>
                <Input
                  placeholder="Enter custom endpoint..."
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RightSidebar;
