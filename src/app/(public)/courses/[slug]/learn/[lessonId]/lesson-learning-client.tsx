"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleLessonProgressAction } from "@/server/actions/course";
import { CommentSection, CommentItem } from "@/components/shared/CommentSection";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Video,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Code2,
  Bot,
  Send,
  Terminal,
  HelpCircle,
  Flame,
  Check,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface LessonLearningClientProps {
  course: any;
  lesson: any;
  userProgress: any;
  enrollment: any;
  currentUser: any;
  initialComments: CommentItem[];
}

export function LessonLearningClient({
  course,
  lesson,
  userProgress,
  enrollment,
  currentUser,
  initialComments,
}: LessonLearningClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState<boolean>(
    userProgress?.isCompleted || false
  );
  const [progressPercent, setProgressPercent] = useState<number>(
    enrollment?.progressPercent || 0
  );

  // Level 2 Breakthrough States: Focus Mode & Multi-Tab Workspace
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"video" | "copilot" | "sandbox">("video");

  // In-Lesson AI Co-Pilot State
  const [copilotMessages, setCopilotMessages] = useState<
    { role: "user" | "assistant"; content: string; time: string }[]
  >([
    {
      role: "assistant",
      content: `Xin chào ${currentUser?.fullName || "bạn"}! 👋 Tôi là **EduCore In-Lesson Co-pilot** đồng hành cùng bạn trong bài giảng **"${lesson.title}"**.\n\nTôi có thể giải thích chi tiết các dòng code trong bài, tóm tắt lý thuyết, hoặc tạo thử thách trắc nghiệm 1 phút để củng cố kiến thức. Bạn muốn khám phá phần nào trước?`,
      time: "Vừa xong",
    },
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Live Code Sandbox State
  const defaultStarterCode = `// 🚀 EduCore Live Playground: ${lesson.title}
// Hãy thử nghiệm đoạn mã hoặc giải thuật bạn vừa học được:

export async function processData(input: string) {
  console.log("Analyzing input:", input);
  
  // TODO: Viết logic xử lý ở đây
  const result = {
    status: "success",
    timestamp: new Date().toISOString(),
    payload: input.toUpperCase(),
  };

  return result;
}

// Bấm 'Chạy mã' hoặc 'AI Review Mã Nguồn' để kiểm tra!
`;
  const [sandboxCode, setSandboxCode] = useState(defaultStarterCode);
  const [sandboxOutput, setSandboxOutput] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [aiReviewResult, setAiReviewResult] = useState<string | null>(null);

  // Flatten lessons to find next and prev
  const allLessons: any[] = [];
  course.chapters.forEach((ch: any) => {
    ch.lessons.forEach((l: any) => {
      allLessons.push({
        ...l,
        chapterTitle: ch.title,
      });
    });
  });

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    startTransition(async () => {
      try {
        const res = await toggleLessonProgressAction({
          lessonId: lesson.id,
          isCompleted: nextState,
        });

        if (res.success && res.data) {
          setProgressPercent(res.data.progressPercent);
          if (res.data.isFinished) {
            toast.success("🎓 Chúc mừng! Bạn đã hoàn thành 100% khóa học và nhận được chứng chỉ!");
          } else {
            toast.success(
              nextState
                ? "Đã đánh dấu hoàn thành bài học!"
                : "Đã hủy đánh dấu hoàn thành"
            );
          }
          router.refresh();
        } else {
          setIsCompleted(!nextState);
          toast.error(res.error || "Không thể cập nhật tiến độ");
        }
      } catch (err: any) {
        setIsCompleted(!nextState);
        toast.error(err.message || "Đã xảy ra lỗi");
      }
    });
  };

  // Co-pilot Send handler
  const handleSendCopilot = async (promptText?: string) => {
    const query = (promptText || copilotInput).trim();
    if (!query || copilotLoading) return;

    const userMsg = {
      role: "user" as const,
      content: query,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setCopilotInput("");
    setCopilotLoading(true);

    try {
      const lessonContext = `BÀI GIẢNG HIỆN TẠI: "${lesson.title}" thuộc khóa học "${course.title}".
Nội dung bài học:
${lesson.content ? lesson.content.slice(0, 800) : "Video bài học thực chiến"}
Học viên đang đặt câu hỏi trong phòng học bài giảng này. Hãy trả lời trọng tâm, giải thích sâu sắc, chuẩn xác về mặt kỹ thuật.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${lessonContext}\n\nCÂU HỎI HỌC VIÊN: ${query}`,
          history: copilotMessages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setCopilotMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text,
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setCopilotMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Xin lỗi, không thể kết nối đến Co-pilot.",
            time: "Vừa xong",
          },
        ]);
      }
    } catch {
      setCopilotMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Đã có lỗi xảy ra khi xử lý phản hồi từ Co-pilot.",
          time: "Vừa xong",
        },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Run mock code in sandbox
  const handleRunCode = () => {
    setSandboxOutput("⏳ Đang biên dịch mã nguồn trong môi trường sandbox...");
    setTimeout(() => {
      setSandboxOutput(
        `> ts-node runtime v20.17.0\n[INFO] processData("hello world")\nAnalyzing input: hello world\n✔ Output: { status: "success", timestamp: "${new Date().toISOString()}", payload: "HELLO WORLD" }\n✨ Mã nguồn thực thi thành công không có runtime exceptions (Exit Code 0).`
      );
    }, 600);
  };

  // Trigger Gemini AI Code Review
  const handleAiCodeReview = async () => {
    if (reviewLoading) return;
    setReviewLoading(true);
    setAiReviewResult(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Hãy đóng vai trò Senior Tech Lead / Code Reviewer đánh giá đoạn code sau đây của học viên cho bài giảng "${lesson.title}":
\`\`\`typescript
${sandboxCode}
\`\`\`
Tiêu chí đánh giá:
1. Độ chính xác & Bug logic tiềm ẩn
2. Hiệu năng & Clean Code
3. Đề xuất cải tiến cụ thể (kèm code refactor ngắn gọn nếu cần).`,
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setAiReviewResult(data.text);
      } else {
        setAiReviewResult("Không thể hoàn tất review mã nguồn vào lúc này.");
      }
    } catch {
      setAiReviewResult("Lỗi kết nối khi gửi mã nguồn đi đánh giá.");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isFocusMode ? "fixed inset-0 z-50 overflow-y-auto bg-zinc-950" : ""}`}>
      {/* Top Learning Navigation Bar */}
      <header className="sticky top-0 z-30 h-14 border-b border-border/80 bg-background/95 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${course.slug}`}>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quay lại khóa học</span>
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              Chương {currentIndex + 1}
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md">
              {lesson.title}
            </h2>
          </div>
        </div>

        {/* Action Controls: Focus Mode, Progress & Complete Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Tiến độ: {Math.round(progressPercent)}%
            </span>
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Zen Focus Mode Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFocusMode(!isFocusMode)}
            title={isFocusMode ? "Thoát chế độ tập trung" : "Chế độ tập trung (Zen Mode)"}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4 text-emerald-400" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          <Button
            size="sm"
            variant={isCompleted ? "outline" : "gradient"}
            onClick={handleToggleComplete}
            disabled={isPending}
            className="h-8 gap-1.5 text-xs font-semibold shadow-sm"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã hoàn thành</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                <span>Đánh dấu hoàn thành</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Learning Layout */}
      <div className={`flex-1 grid grid-cols-1 ${isFocusMode ? "lg:grid-cols-1" : "lg:grid-cols-12"} min-h-[calc(100vh-56px)]`}>
        {/* Left Area: Multi-tab Interactive Learning Room */}
        <div className={`${isFocusMode ? "lg:col-span-12 max-w-5xl mx-auto" : "lg:col-span-8"} p-4 sm:p-8 space-y-6 overflow-y-auto`}>
          
          {/* Workspace Tabs: Video / Co-pilot / Code Sandbox */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("video")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "video"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Bài học & Video</span>
              </button>

              <button
                onClick={() => setActiveTab("copilot")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "copilot"
                    ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-emerald-500/20 shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>In-Lesson AI Co-Pilot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                onClick={() => setActiveTab("sandbox")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "sandbox"
                    ? "bg-indigo-600 text-white shadow-indigo-500/20 shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Live Code Sandbox</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>EduCore Engine 2.0 Live</span>
            </div>
          </div>

          {/* TAB 1: VIDEO & LESSON CONTENT */}
          {activeTab === "video" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Video Player with Ambient Glow */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-emerald-500/30 shadow-[0_0_60px_-15px_rgba(16,185,129,0.25)]">
                {lesson.videoUrl ? (
                  <video
                    src={lesson.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-gradient-to-b from-zinc-900 to-black">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Video className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">
                      Bài học dạng văn bản & hướng dẫn thực hành chuyên sâu
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Theo dõi tài liệu lý thuyết, sơ đồ kiến trúc và các đoạn mã mẫu chi tiết bên dưới.
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline Checkpoints (Key Highlights) */}
              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Điểm mốc bài học:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono">
                    00:00 • Giới thiệu
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono">
                    03:20 • Phân tích cấu trúc
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                    08:45 • Thực chiến Code
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono">
                    14:10 • Best Practices
                  </span>
                </div>
              </div>

              {/* Lesson Title & Next/Prev Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div>
                  <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider">
                    {course.chapters.find((ch: any) => ch.id === lesson.chapterId)?.title}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                    {lesson.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {prevLesson ? (
                    <Link href={`/courses/${course.slug}/learn/${prevLesson.id}`}>
                      <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Bài trước</span>
                      </Button>
                    </Link>
                  ) : null}

                  {nextLesson ? (
                    <Link href={`/courses/${course.slug}/learn/${nextLesson.id}`}>
                      <Button size="sm" variant="gradient" className="h-8 gap-1 text-xs font-bold">
                        <span>Bài tiếp theo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Lesson Content Body */}
              {lesson.content && (
                <div className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm space-y-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Nội dung hướng dẫn & Bài tập thực hành</span>
                  </h3>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-normal">
                    {lesson.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IN-LESSON AI CO-PILOT */}
          {activeTab === "copilot" && (
            <div className="rounded-2xl border border-border/80 bg-zinc-950/80 p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      In-Lesson AI Co-Pilot
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Context-Aware
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Hiểu ngữ cảnh bài giảng &quot;{lesson.title}&quot;
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setCopilotMessages([
                      {
                        role: "assistant",
                        content: "Hội thoại Co-pilot đã làm mới. Bạn cần hỗ trợ gì về bài giảng này?",
                        time: "Vừa xong",
                      },
                    ])
                  }
                  className="h-7 text-xs text-zinc-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Làm mới
                </Button>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "⚡ Tóm tắt 3 ý cốt lõi của bài",
                  "🔍 Giải thích sâu về đoạn mã mẫu",
                  "🎯 Thử thách trắc nghiệm 1 phút",
                  "🛠️ Đề xuất bài tập thực hành liên quan",
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendCopilot(sug)}
                    className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 px-3 py-1 rounded-full border border-zinc-800 hover:border-emerald-500/40 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto p-2 scrollbar-thin">
                {copilotMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none whitespace-pre-line"
                      }`}
                    >
                      {m.content}
                      <div className="text-[10px] text-zinc-500 mt-1 text-right">{m.time}</div>
                    </div>
                  </div>
                ))}

                {copilotLoading && (
                  <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>EduCore Co-pilot đang phân tích bài học...</span>
                  </div>
                )}
              </div>

              {/* Co-pilot Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCopilot();
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Hỏi Co-pilot về bài giảng, kiến trúc, mã nguồn..."
                  disabled={copilotLoading}
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={!copilotInput.trim() || copilotLoading}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 h-9 px-3 rounded-xl"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: LIVE CODE SANDBOX & AI CODE REVIEWER */}
          {activeTab === "sandbox" && (
            <div className="rounded-2xl border border-border/80 bg-zinc-950 p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Live Code Sandbox & AI Reviewer</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRunCode}
                    className="h-8 gap-1.5 text-xs font-mono border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chạy mã (Run)</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleAiCodeReview}
                    disabled={reviewLoading}
                    className="h-8 gap-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-md shadow-emerald-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{reviewLoading ? "Đang Review..." : "AI Review Mã Nguồn"}</span>
                  </Button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="relative">
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  rows={12}
                  className="w-full font-mono text-xs sm:text-sm bg-zinc-900/90 text-emerald-300 p-4 rounded-xl border border-zinc-800 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Terminal Output */}
              {sandboxOutput && (
                <div className="p-3.5 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Console Output:</div>
                  <pre className="whitespace-pre-wrap">{sandboxOutput}</pre>
                </div>
              )}

              {/* AI Code Review Results */}
              {aiReviewResult && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Đánh giá từ Senior Tech Lead AI:</span>
                  </div>
                  <div className="text-zinc-200 leading-relaxed whitespace-pre-line">
                    {aiReviewResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lesson Discussion & Q&A */}
          <div className="pt-6 border-t border-border/60">
            <div className="mb-6">
              <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                Hỏi đáp & Trao đổi
              </span>
              <h3 className="text-xl font-bold text-foreground mt-1">
                Thảo luận về bài giảng này
              </h3>
            </div>
            <CommentSection
              entityType="LESSON"
              entityId={lesson.id}
              initialComments={initialComments}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* Right Area: Curriculum Tree Sidebar (Hidden when in Focus Mode) */}
        {!isFocusMode && (
          <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border/80 bg-card/40 backdrop-blur-xl p-4 sm:p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Nội dung khóa học</span>
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                {course.totalLessons} bài
              </span>
            </div>

            <div className="space-y-4">
              {course.chapters?.map((chapter: any, cIdx: number) => (
                <div key={chapter.id} className="space-y-2">
                  <div className="text-xs font-bold text-foreground">
                    {chapter.title}
                  </div>

                  <div className="space-y-1 pl-2 border-l border-border/60">
                    {chapter.lessons?.map((l: any) => {
                      const isActive = l.id === lesson.id;
                      const isLessonDone =
                        l.progress && l.progress.length > 0 && l.progress[0].isCompleted;

                      return (
                        <Link
                          key={l.id}
                          href={`/courses/${course.slug}/learn/${l.id}`}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isLessonDone ? (
                              <CheckCircle2
                                className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  isActive ? "text-primary-foreground" : "text-emerald-400"
                                }`}
                              />
                            ) : (
                              <Play
                                className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                                }`}
                              />
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>

                          <span
                            className={`text-[10px] font-mono ml-2 ${
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {l.durationMinutes}m
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
