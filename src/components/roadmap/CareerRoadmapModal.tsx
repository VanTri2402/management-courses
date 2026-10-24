"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Code2,
  Cpu,
  Palette,
  Cloud,
  ChevronRight,
  Send,
  Bot,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CareerRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CareerRoadmapModal({ isOpen, onClose }: CareerRoadmapModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<"fullstack" | "ai" | "uiux">("fullstack");
  const [customGoal, setCustomGoal] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiSynthesizedPlan, setAiSynthesizedPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const tracks = {
    fullstack: {
      title: "Lộ Trình Fullstack Cloud Architect",
      badge: "6 - 9 Tháng • Chuẩn Doanh Nghiệp",
      desc: "Làm chủ từ giao diện hiện đại với Next.js 14 đến hạ tầng phân tán Kubernetes & DevOps quy mô hàng triệu người dùng.",
      nodes: [
        {
          id: 1,
          step: "01. NỀN TẢNG CỐT LÕI",
          title: "Fullstack TypeScript: Từ Khởi Đầu Đến Kỹ Sư Chuyên Nghiệp",
          slug: "fullstack-typescript-zero-to-pro",
          duration: "40 Giờ • Beginner",
          skills: ["TypeScript Strict Mode", "Async/Await", "OOP & Functional Programming", "Prisma ORM"],
          status: "recommended",
        },
        {
          id: 2,
          step: "02. KIẾN TRÚC DOANH NGHIỆP",
          title: "Next.js 14 Enterprise Architecture: Quy Mô Hàng Triệu Người Dùng",
          slug: "nextjs-14-enterprise-architecture",
          duration: "60 Giờ • Advanced",
          skills: ["App Router & Server Actions", "Edge Middleware RBAC", "Neon Postgres Serverless", "On-demand Cache"],
          status: "core",
        },
        {
          id: 3,
          step: "03. HẠ TẦNG & SCALE",
          title: "Cloud Native DevOps: Kubernetes, Docker & CI/CD Pipelines",
          slug: "cloud-native-devops-kubernetes-docker",
          duration: "55 Giờ • Intermediate",
          skills: ["Docker Multi-stage", "Kubernetes Pods & Ingress", "GitHub Actions CI/CD", "Zero-downtime Deploy"],
          status: "capstone",
        },
      ],
    },
    ai: {
      title: "Lộ Trình Kỹ Sư Trí Tuệ Nhân Tạo (AI & LLMs)",
      badge: "4 - 6 Tháng • Xu Hướng 2026",
      desc: "Xây dựng các hệ thống AI Agents tự động, RAG Pipelines, Vector Database và tích hợp bộ công cụ Gemini API tân tiến.",
      nodes: [
        {
          id: 1,
          step: "01. NỀN TẢNG PYTHON & VECTOR DB",
          title: "Fullstack TypeScript: Từ Khởi Đầu Đến Kỹ Sư Chuyên Nghiệp",
          slug: "fullstack-typescript-zero-to-pro",
          duration: "40 Giờ • Nền tảng lập trình",
          skills: ["Cấu trúc dữ liệu", "REST API", "Database Vector Fundamentals", "Async Processing"],
          status: "recommended",
        },
        {
          id: 2,
          step: "02. KỸ NGHỆ LLM & RAG",
          title: "Kỹ Nghệ Generative AI & Large Language Models: Xây Dựng AI Agents Thực Chiến",
          slug: "generative-ai-large-language-models-agents",
          duration: "50 Giờ • Advanced",
          skills: ["Google Gemini API", "RAG Pipelines", "Function Calling", "Autonomous AI Agents"],
          status: "core",
        },
        {
          id: 3,
          step: "03. TRIỂN KHAI PRODUCTION",
          title: "Cloud Native DevOps: Kubernetes, Docker & CI/CD Pipelines",
          slug: "cloud-native-devops-kubernetes-docker",
          duration: "55 Giờ • Cloud Infra",
          skills: ["Dockerize Model Services", "GPU Cluster Setup", "Auto-scaling AI Endpoints"],
          status: "capstone",
        },
      ],
    },
    uiux: {
      title: "Lộ Trình UI/UX Designer & Creative Frontend",
      badge: "3 - 5 Tháng • Đẳng cấp Awwwards",
      desc: "Nghệ thuật Scrollytelling, Design Systems đồng nhất, Micro-interactions tinh tế và chuyển động thị giác đẳng cấp quốc tế.",
      nodes: [
        {
          id: 1,
          step: "01. THIẾT KẾ ĐỒNG NHẤT & CHUYỂN ĐỘNG",
          title: "Awwwards UI/UX & Micro-Interactions Masterclass",
          slug: "awwwards-ui-ux-micro-interactions-masterclass",
          duration: "35 Giờ • All Levels",
          skills: ["Design Systems", "Framer Motion", "Lenis Smooth Scroll", "Dark Tech Cyber Aesthetics"],
          status: "core",
        },
        {
          id: 2,
          step: "02. THỰC THI KIẾN TRÚC WEB",
          title: "Next.js 14 Enterprise Architecture: Quy Mô Hàng Triệu Người Dùng",
          slug: "nextjs-14-enterprise-architecture",
          duration: "60 Giờ • Advanced",
          skills: ["Component Architecture", "Tailwind Variables", "Dynamic Layout Rendering", "Responsive Design"],
          status: "capstone",
        },
      ],
    },
  };

  const handleSynthesizeCustomRoadmap = async () => {
    if (!customGoal.trim() || isSynthesizing) return;
    setIsSynthesizing(true);
    setAiSynthesizedPlan(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Tôi là học viên EduCore. Mục tiêu của tôi là: "${customGoal}". Hãy đóng vai trò Trưởng ban Đào tạo EduCore Academy, tổng hợp và đề xuất cho tôi một Lộ trình học tập cá nhân hóa chi tiết, chọn lọc từ các khóa học hiện có của EduCore, phân chia các giai đoạn theo tuần và giải thích vì sao tôi nên theo thứ tự này.`,
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setAiSynthesizedPlan(data.text);
      } else {
        setAiSynthesizedPlan("Không thể tạo lộ trình vào lúc này. Vui lòng thử lại sau.");
      }
    } catch {
      setAiSynthesizedPlan("Đã có lỗi xảy ra khi kết nối đến AI Synthesizer.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const currentTrack = tracks[selectedTrack];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Bản Đồ Lộ Trình Nghề Nghiệp AI (Career Graph)
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Level 2 Adaptive
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Lộ trình chuẩn hóa theo tiêu chuẩn tuyển dụng các tập đoàn công nghệ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng lộ trình"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Track Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setSelectedTrack("fullstack");
                setAiSynthesizedPlan(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedTrack === "fullstack"
                  ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50"
                  : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Code2 className="w-4 h-4" />
                <span className="text-xs font-bold">Fullstack Cloud</span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                Next.js 14, Neon Postgres, Docker & K8s
              </p>
            </button>

            <button
              onClick={() => {
                setSelectedTrack("ai");
                setAiSynthesizedPlan(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedTrack === "ai"
                  ? "bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50"
                  : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold">AI & LLMs Engineer</span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                Gemini API, RAG Pipeline & AI Agents
              </p>
            </button>

            <button
              onClick={() => {
                setSelectedTrack("uiux");
                setAiSynthesizedPlan(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedTrack === "uiux"
                  ? "bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50"
                  : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Palette className="w-4 h-4" />
                <span className="text-xs font-bold">Creative UI/UX</span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                Awwwards Motion, Scrollytelling & Design
              </p>
            </button>
          </div>

          {/* Track Banner */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">{currentTrack.title}</h3>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {currentTrack.badge}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{currentTrack.desc}</p>
          </div>

          {/* Interactive Skill Nodes Sequence */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-cyan-500 before:to-zinc-800">
            {currentTrack.nodes.map((node, i) => (
              <div key={node.id} className="relative group">
                {/* Node Bullet Marker */}
                <div className="absolute -left-6 sm:-left-8 top-3 w-6 h-6 rounded-full bg-zinc-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-[10px] font-mono font-bold shadow-md shadow-emerald-500/30">
                  {i + 1}
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-emerald-500/50 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        {node.step}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {node.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 shrink-0">
                      {node.duration}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {node.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-mono"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/courses/${node.slug}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm shadow-emerald-600/30 shrink-0"
                    >
                      <span>Vào học ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Custom Roadmap Synthesizer */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold">Bạn có mục tiêu hoặc quỹ thời gian riêng?</h4>
            </div>
            <p className="text-xs text-zinc-400">
              Nhập mục tiêu cụ thể của bạn (VD: <em>&quot;Muốn trở thành Fullstack Dev trong 4 tháng, mỗi tuần học 12 tiếng&quot;</em>), AI sẽ tự động phân bổ lộ trình cá nhân hóa cho bạn!
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Nhập mục tiêu nghề nghiệp của bạn..."
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-emerald-500/60 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <Button
                size="sm"
                onClick={handleSynthesizeCustomRoadmap}
                disabled={!customGoal.trim() || isSynthesizing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 rounded-xl shrink-0"
              >
                {isSynthesizing ? "Đang tạo..." : "AI Tạo Lộ Trình"}
              </Button>
            </div>

            {aiSynthesizedPlan && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 text-xs text-zinc-200 leading-relaxed whitespace-pre-line animate-in fade-in">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>Đề xuất Lộ trình Cá nhân hóa từ EduCore AI:</span>
                </div>
                {aiSynthesizedPlan}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
