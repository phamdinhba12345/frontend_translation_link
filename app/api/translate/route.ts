import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Nới lỏng giới hạn timeout của Vercel (mặc định 15s, tối đa 60s cho gói Free)

// Địa chỉ backend Flask (xem lại hướng dẫn chạy backend trong README)
const BACKEND_URL =
  process.env.VIDEO_TRANSLATOR_BACKEND_URL || "http://127.0.0.1:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Có lỗi không xác định từ backend." },
        { status: res.status },
      );
    }

    // Backend trả đường dẫn tương đối (vd: /outputs/xxx.mp4) -> ghép thành URL đầy đủ
    // để trình duyệt (đang chạy ở origin khác, port 3000) có thể phát/tải video.
    if (data.dubbed_video_url) {
      data.dubbed_video_url = `${BACKEND_URL}${data.dubbed_video_url}`;
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Không kết nối được tới backend xử lý video. Hãy đảm bảo backend Flask (app.py) đang chạy tại " +
          BACKEND_URL,
      },
      { status: 500 },
    );
  }
}
