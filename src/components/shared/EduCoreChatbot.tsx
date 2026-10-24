"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, X, Send, Sparkles, RotateCcw, Bot, User as UserIcon, ExternalLink } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  "🚀 Khóa học Fullstack Next.js",
  "🤖 Lộ trình học AI & Python",
  "💰 Học phí & Quyền lợi hoàn tiền",
  "🎓 Điều kiện cấp Chứng chỉ tốt nghiệp",
];

export function EduCoreChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! 👋 Tôi là **EduCore AI Tutor** — Trợ lý ảo độc quyền của học viện EduCore Academy.\n\nTôi có thể giúp bạn tìm hiểu chi tiết về **các khóa học lập trình**, **lộ trình công nghệ**, **học phí ưu đãi** và **chính sách chứng chỉ**. Bạn cần tư vấn thông tin gì hôm nay?",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Level 2 Breakthrough: Listen for global Cmd+K trigger
  useEffect(() => {
    const handleOpenChatEvent = (e: any) => {
      const targetQuery = e.detail?.query;
      setIsOpen(true);
      if (targetQuery && typeof targetQuery === "string") {
        setTimeout(() => {
          handleSend(targetQuery);
        }, 200);
      }
    };

    window.addEventListener("educore:open-chat", handleOpenChatEvent);
    return () => window.removeEventListener("educore:open-chat", handleOpenChatEvent);
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMsg = {
      id: "u_" + Date.now(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (data.success && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: "a_" + Date.now(),
            role: "assistant",
            content: data.text,
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "err_" + Date.now(),
            role: "assistant",
            content: data.error || "Xin lỗi, đã xảy ra lỗi khi kết nối đến trợ lý AI. Vui lòng thử lại sau.",
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          role: "assistant",
          content: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome_" + Date.now(),
        role: "assistant",
        content:
          "Hội thoại đã được làm mới. Bạn cần hỗ trợ thêm thông tin khóa học hoặc lộ trình học tập nào của EduCore?",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  /**
   * Helper to parse markdown-like bold, code, links, and bullet points safely
   */
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");

    return lines.map((line, lIdx) => {
      // Empty line spacer
      if (!line.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      // Heading 3: ### Title
      if (line.startsWith("### ")) {
        const text = line.replace("### ", "");
        return (
          <h4 key={lIdx} className="font-semibold text-emerald-400 text-sm mt-2 mb-1">
            {parseInlineMarkdown(text)}
          </h4>
        );
      }

      // Bullet points
      const isBullet = line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ");
      const lineContent = isBullet ? line.replace(/^[-*•]\s+/, "") : line;

      return (
        <div key={lIdx} className={`text-xs sm:text-sm leading-relaxed ${isBullet ? "flex gap-2 items-start pl-1 my-0.5" : "my-0.5"}`}>
          {isBullet && <span className="text-emerald-500 font-bold shrink-0">•</span>}
          <div>{parseInlineMarkdown(lineContent)}</div>
        </div>
      );
    });
  };

  const parseInlineMarkdown = (text: string) => {
    // Regex for [label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseBoldAndCode(text.substring(lastIndex, match.index), `${lastIndex}`));
      }

      const label = match[1];
      const href = match[2];

      parts.push(
        <Link
          key={`link-${match.index}`}
          href={href}
          onClick={() => {
            if (window.innerWidth < 640) setIsOpen(false);
          }}
          className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-500/50 hover:decoration-emerald-400 transition-colors"
        >
          {label}
          <ExternalLink className="w-3 h-3 inline-block" />
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(parseBoldAndCode(text.substring(lastIndex), `${lastIndex}`));
    }

    return parts.length > 0 ? parts : parseBoldAndCode(text, "0");
  };

  const parseBoldAndCode = (segment: string, keyPrefix: string) => {
    // Parse **bold** and `code`
    const tokens = segment.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return tokens.map((tok, i) => {
      const k = `${keyPrefix}-${i}`;
      if (tok.startsWith("**") && tok.endsWith("**")) {
        return (
          <strong key={k} className="font-semibold text-zinc-100">
            {tok.slice(2, -2)}
          </strong>
        );
      }
      if (tok.startsWith("`") && tok.endsWith("`")) {
        return (
          <code key={k} className="px-1.5 py-0.5 text-xs bg-zinc-800 text-emerald-300 rounded font-mono">
            {tok.slice(1, -1)}
          </code>
        );
      }
      return tok;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900/95 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-medium shadow-xl backdrop-blur-md animate-bounce pointer-events-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hỏi Trợ lý AI EduCore</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Mở Trợ lý AI EduCore"
          className={`relative group w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
            isOpen
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rotate-90"
              : "bg-gradient-to-tr from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-7 h-7" />
              {/* Pulse rings */}
              <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-zinc-950 rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* Slide-in / Pop-up Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="EduCore AI Chatbot"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[82vh] bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-zinc-900 rounded-full ring-1 ring-zinc-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white tracking-tight">EduCore AI Tutor</h3>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Gemini Live
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Trợ lý tra cứu khóa học & lộ trình</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Làm mới hội thoại"
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-zinc-900/90 text-zinc-200 border border-zinc-800/80 rounded-bl-none"
                  }`}
                >
                  {renderFormattedContent(m.content)}
                  <div
                    className={`text-[10px] mt-1.5 font-mono text-right ${
                      m.role === "user" ? "text-emerald-200/70" : "text-zinc-500"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-zinc-900/80 bg-zinc-950/50">
              <p className="text-[11px] text-zinc-400 mb-1.5 font-medium">Gợi ý câu hỏi phổ biến:</p>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-zinc-800 hover:border-emerald-500/40 transition-all text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input & Footer */}
          <div className="p-3 bg-zinc-900/70 border-t border-zinc-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về khóa học, học phí, chứng chỉ..."
                disabled={isLoading}
                className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-emerald-500/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Gửi tin nhắn"
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl transition-all shadow-md shrink-0 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-zinc-500">
                🔒 Trợ lý AI chỉ giải đáp nội dung trong phạm vi EduCore Academy.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
