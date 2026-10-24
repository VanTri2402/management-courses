import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { askEduCoreAssistant, ChatMessage } from "@/server/services/chatbot";

export const dynamic = "force-dynamic";

const chatRequestSchema = z.object({
  message: z.string().min(1, "Tin nhắn không được để trống").max(1000, "Tin nhắn quá dài (tối đa 1000 ký tự)"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ",
        },
        { status: 400 }
      );
    }

    const { message, history } = parsed.data;

    const result = await askEduCoreAssistant(message, history as ChatMessage[]);

    return NextResponse.json({
      success: true,
      text: result.text,
      source: result.source,
    });
  } catch (error: any) {
    console.error("[POST /api/chat] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Đã có lỗi xảy ra khi xử lý phản hồi từ trợ lý AI. Vui lòng thử lại sau.",
      },
      { status: 500 }
    );
  }
}
