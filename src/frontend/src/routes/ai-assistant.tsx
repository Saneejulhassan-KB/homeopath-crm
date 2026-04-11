import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { createRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  Bot,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Mic,
  Plus,
  Search,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-assistant",
  component: AIAssistantPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = "user" | "ai";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  active?: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "Migraine Case - Ravi Kumar",
    preview: "Belladonna 30C suggested for pulsating headache...",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    active: true,
  },
  {
    id: "c2",
    title: "Constitutional Analysis",
    preview: "Sulphur 200C based on totality of symptoms...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "c3",
    title: "Anxiety Protocol",
    preview: "Argentum Nitricum 30C for anticipatory anxiety...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "c4",
    title: "Fever Management Guide",
    preview: "Ferrum Phos 6X as first-line approach...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "c5",
    title: "Case Summary - Mrs. Sharma",
    preview: "Complete case analysis with Lycopodium...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "ai",
  content:
    "Welcome to **HomeoPath AI Assistant**. I can help you with remedy suggestions, symptom analysis, and case summaries. How can I assist you today?",
  timestamp: new Date(),
};

const QUICK_ACTIONS = [
  { label: "Suggest remedy for headache", icon: Zap },
  { label: "Analyze these symptoms", icon: Brain },
  { label: "Generate case summary", icon: FileText },
  { label: "Explain homeopathy principle", icon: BookOpen },
  { label: "Find constitutional remedy", icon: Search },
];

// ─── Response engine ──────────────────────────────────────────────────────────

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.match(/headache|migraine/)) {
    return "Based on the symptom presentation of headache, consider:\n\n**Belladonna 30C** — throbbing, sudden onset, worse from light/noise\n\n**Bryonia 200C** — splitting pain, worse from motion, wants to stay still\n\n**Natrum Mur 30C** — sun headaches, with visual aura, starts in morning\n\nPlease conduct a full case-taking to confirm the constitutional remedy. Modalities and mental generals are essential for accurate selection.";
  }
  if (lower.match(/anxiety|stress|fear|panic/)) {
    return "For anxiety and stress presentations in homeopathy:\n\n**Aconite 30C** — sudden fright/panic, fear of death, restlessness\n\n**Argentum Nitricum 30C** — anticipatory anxiety, hurried feeling, craving sweets\n\n**Gelsemium 30C** — exam/performance anxiety, trembling, weakness\n\nA constitutional remedy based on the totality of symptoms would be most beneficial for long-term management.";
  }
  if (lower.match(/cold|fever|flu|temperature/)) {
    return "Common remedies for cold and fever:\n\n**Ferrum Phos 6X** — early stages, no specific symptoms, gradual onset\n\n**Aconite 30C** — sudden high fever with restlessness, after cold exposure\n\n**Belladonna 30C** — high fever with flushed face, throbbing, delirium\n\nMonitor temperature and constitutional symptoms carefully. Seek medical attention if fever exceeds 103°F.";
  }
  if (lower.match(/case summary|case analysis|summarize/)) {
    return "**Case Summary Analysis:**\n\n**Patient Profile:** Based on the information provided\n\n**Chief Complaint:** As described\n\n**Key Symptoms:** Constitutional analysis required\n\n**Suggested Approach:**\n1. Complete case-taking using Hahnemannian method\n2. Repertorization using Kent/Boger method\n3. Constitutional remedy selection based on totality\n4. Follow-up schedule: 4–6 weeks\n\n*Note: This is an AI-assisted analysis. Clinical judgment should always take precedence.*";
  }
  return "Thank you for your query. In homeopathy, we treat the whole person rather than isolated symptoms. To provide accurate remedy suggestions, I would need:\n\n1. **Complete symptom picture** — onset, location, sensation, modalities\n2. **Mental and emotional state** — fears, dreams, temperament\n3. **Physical generals** — thermals, thirst, sleep, appetite\n4. **Modalities** — better/worse factors\n\nPlease share more details for a thorough constitutional analysis.";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMsgTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatConvTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      // eslint-disable-next-line react/no-array-index-key
      elements.push(<span key={`br-${i}`} className="block h-2" />);
      continue;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const inner = part.slice(2, -2);
        return (
          <strong
            key={`bold-${i}-${inner}`}
            className="font-semibold text-foreground"
          >
            {inner}
          </strong>
        );
      }
      return part;
    });
    // eslint-disable-next-line react/no-array-index-key
    elements.push(
      <span key={`line-${i}`} className="block">
        {rendered}
      </span>,
    );
  }
  return <>{elements}</>;
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-start gap-3 max-w-[70%]"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 0.8,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} max-w-full`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "glass border border-primary/30"
        }`}
      >
        {isUser ? "You" : <Sparkles className="w-4 h-4 text-primary" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md"
            : "glass-card rounded-tl-sm text-foreground"
        }`}
      >
        <div className="text-sm leading-relaxed">
          {isUser ? msg.content : <RenderMarkdown text={msg.content} />}
        </div>
        <p
          className={`text-[10px] mt-1.5 ${
            isUser
              ? "text-primary-foreground/60 text-right"
              : "text-muted-foreground"
          }`}
        >
          {formatMsgTime(msg.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  open: boolean;
  onToggle: () => void;
}

function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  open,
  onToggle,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        animate={{ width: open ? 260 : 0 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="relative flex-shrink-0 h-full overflow-hidden md:relative fixed left-0 top-0 z-30 md:z-auto"
        style={{ minWidth: open ? 0 : 0 }}
      >
        <div className="h-full w-[260px] flex flex-col glass border-r border-white/10 dark:border-white/5">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-display font-semibold text-sm text-foreground">
                Conversations
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={onToggle}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* New chat */}
          <div className="px-3 py-3">
            <Button
              variant="outline"
              className="w-full gap-2 text-sm border-primary/30 text-primary hover:bg-primary/10 transition-smooth"
              onClick={onNewChat}
              data-ocid="new-chat-btn"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* List */}
          <ScrollArea className="flex-1 px-2 pb-4">
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  onKeyDown={(e) => e.key === "Enter" && onSelect(conv.id)}
                  data-ocid={`conv-item-${conv.id}`}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-smooth group ${
                    conv.id === activeId
                      ? "bg-primary/15 border border-primary/25"
                      : "hover:bg-white/5 dark:hover:bg-white/5"
                  }`}
                >
                  <p className="text-xs font-medium text-foreground truncate leading-tight">
                    {conv.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5 leading-tight">
                    {conv.preview}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatConvTime(conv.timestamp)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function AIAssistantPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState("c1");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const shouldScrollRef = useRef(false);
  shouldScrollRef.current = true;

  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Update conversation preview
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, preview: text } : c)),
    );

    await new Promise((res) => setTimeout(res, 1500));

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "ai",
      content: getAIResponse(text),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    textareaRef.current?.focus();
  }, [input, isTyping, activeConvId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `c-${Date.now()}`,
      title: "New Conversation",
      preview: "Start typing to begin...",
      timestamp: new Date(),
      active: true,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  const handleQuickAction = (label: string) => {
    setInput(label);
    textareaRef.current?.focus();
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden"
      data-ocid="ai-assistant-page"
    >
      {/* Page title row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border/40 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle conversation sidebar"
          data-ocid="sidebar-toggle-btn"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-base text-foreground leading-tight">
              AI Assistant
            </h1>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Homeopathy intelligence · Demo mode
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-amber-500 dark:text-amber-400 bg-amber-500/10 rounded-full px-3 py-1 border border-amber-500/20">
          <AlertCircle className="w-3 h-3" />
          Educational use only
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <ConversationSidebar
              conversations={conversations}
              activeId={activeConvId}
              onSelect={setActiveConvId}
              onNewChat={handleNewChat}
              open={sidebarOpen}
              onToggle={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-6" data-ocid="messages-area">
            <div className="max-w-3xl mx-auto space-y-5">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick actions */}
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2 flex-wrap">
                {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleQuickAction(label)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleQuickAction(label)
                    }
                    data-ocid={`quick-action-${label.replace(/\s+/g, "-").toLowerCase()}`}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass border border-white/15 dark:border-white/8 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-smooth"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input area */}
          <div
            className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-border/30"
            data-ocid="chat-input-area"
          >
            <div className="max-w-3xl mx-auto">
              <div className="glass-card rounded-2xl p-3 flex items-end gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about remedies, symptoms, or case analysis…"
                  className="flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm min-h-[42px] max-h-[140px] py-1.5 px-0 placeholder:text-muted-foreground/50"
                  rows={1}
                  data-ocid="chat-input"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-primary transition-smooth"
                    aria-label="Voice input (decorative)"
                    type="button"
                    disabled
                    data-ocid="mic-btn"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 shadow-md transition-smooth disabled:opacity-40"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    aria-label="Send message"
                    type="button"
                    data-ocid="send-btn"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              <p
                className="text-center text-[10px] text-muted-foreground/50 mt-2 leading-tight"
                data-ocid="ai-disclaimer"
              >
                AI suggestions are for educational purposes only. Always apply
                clinical judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
