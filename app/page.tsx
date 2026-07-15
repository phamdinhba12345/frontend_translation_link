"use client";

import { useState } from "react";

const LANG_OPTIONS: { code: string; name: string }[] = [
  { code: "vi", name: "Tiếng Việt" },
  { code: "en", name: "Tiếng Anh" },
  { code: "ja", name: "Tiếng Nhật" },
  { code: "ko", name: "Tiếng Hàn" },
  { code: "zh-CN", name: "Tiếng Trung" },
  { code: "fr", name: "Tiếng Pháp" },
  { code: "es", name: "Tiếng Tây Ban Nha" },
  { code: "th", name: "Tiếng Thái" },
  { code: "de", name: "Tiếng Đức" },
];

type TranslateResult = {
  detected_lang: string;
  original_text: string;
  translated_text: string;
  dubbed_video_url: string | null;
  dub_error?: string;
  warning?: string | null;
};

export default function VideoTranslatorPage() {
  const [url, setUrl] = useState("");
  const [lang, setLang] = useState("vi");
  const [customLang, setCustomLang] = useState("");
  const [dubVideo, setDubVideo] = useState(true);
  const [originalAudioVolume, setOriginalAudioVolume] = useState(25); // 0-100%
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TranslateResult | null>(null);

  const isCustom = lang === "__custom__";

  async function handleSubmit() {
    const targetLang = isCustom ? customLang.trim() : lang;

    setError("");
    setResult(null);

    if (!url.trim()) {
      setError("Vui lòng nhập link video.");
      return;
    }
    if (!targetLang) {
      setError("Vui lòng chọn hoặc nhập ngôn ngữ đích.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          target_lang: targetLang,
          dub_video: dubVideo,
          keep_original_audio: originalAudioVolume > 0,
          original_audio_volume: originalAudioVolume / 100,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi không xác định.");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Có lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  console.log("result: ", result);

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-[#0f1220] to-[#1a1030] px-4 py-10 text-slate-100">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-1">
          🎬 Dịch lời nói trong video
        </h1>
        <p className="text-slate-400 mb-7">
          Dán link video (TikTok, YouTube, Facebook...), chọn ngôn ngữ đích, và
          nhận bản dịch.
        </p>

        <div className="bg-[#171b2e] border border-white/5 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <label htmlFor="url" className="block text-sm text-slate-400 mb-1.5">
            Link video
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@user/video/..."
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 text-sm mb-4.5 placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
          />

          <div className="flex gap-3 mb-1">
            <div className="flex-1">
              <label
                htmlFor="lang"
                className="block text-sm text-slate-400 mb-1.5"
              >
                Dịch sang
              </label>
              {/* <select
                id="lang"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 text-sm focus:outline-none focus:border-violet-400"
              >
                {LANG_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
                <option value="__custom__">Khác (nhập mã ngôn ngữ)...</option>
              </select> */}
              <select
                id="lang"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 text-sm text-white focus:outline-none focus:border-violet-400"
              >
                {LANG_OPTIONS.map((opt) => (
                  <option
                    key={opt.code}
                    value={opt.code}
                    className="bg-neutral-900 text-white"
                    style={{ backgroundColor: "#18181b", color: "#ffffff" }}
                  >
                    {opt.name}
                  </option>
                ))}
                <option
                  value="__custom__"
                  className="bg-neutral-900 text-white"
                  style={{ backgroundColor: "#18181b", color: "#ffffff" }}
                >
                  Khác (nhập mã ngôn ngữ)...
                </option>
              </select>
            </div>

            {isCustom && (
              <div className="flex-1">
                <label
                  htmlFor="customLang"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Mã ngôn ngữ (vd: pt, ru, id)
                </label>
                <input
                  id="customLang"
                  type="text"
                  value={customLang}
                  onChange={(e) => setCustomLang(e.target.value)}
                  placeholder="vd: pt"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 mb-4 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dubVideo}
              onChange={(e) => setDubVideo(e.target.checked)}
              className="w-4 h-4 accent-violet-500"
            />
            Lồng tiếng video (thay giọng gốc bằng giọng đọc bản dịch)
          </label>

          {dubVideo && (
            <div className="mb-5 pl-6">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <label htmlFor="volume">Âm lượng tiếng gốc</label>
                <span>
                  {originalAudioVolume === 0
                    ? "Tắt tiếng"
                    : `${originalAudioVolume}%`}
                </span>
              </div>
              <input
                id="volume"
                type="range"
                min="0"
                max="100"
                step="5"
                value={originalAudioVolume}
                onChange={(e) => setOriginalAudioVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Kéo về 0 để tắt hẳn tiếng gốc, chỉ giữ lại giọng lồng tiếng.
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-3 rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-violet-500 to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Đang xử lý..." : "Dịch video"}
          </button>

          {loading && (
            <div className="mt-4 text-sm text-slate-400 flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {dubVideo
                ? "Đang tải video, nhận diện giọng nói, dịch và lồng tiếng (có thể mất vài phút tùy độ dài video)..."
                : "Đang tải video và xử lý (có thể mất 1-3 phút tùy độ dài video)..."}
            </div>
          )}

          {error && <div className="mt-3.5 text-sm text-rose-400">{error}</div>}

          {result && (
            <div className="mt-6 space-y-3.5">
              {result.warning && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 text-sm text-amber-300">
                  {result.warning}
                </div>
              )}

              {result.dubbed_video_url && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                    Video đã lồng tiếng
                  </h3>
                  <video
                    src={result.dubbed_video_url}
                    controls
                    className="w-full rounded-lg mb-3"
                  />
                  <a
                    href={result.dubbed_video_url}
                    download
                    className="inline-block text-sm text-violet-300 hover:text-violet-200 underline underline-offset-2"
                  >
                    Tải video về máy
                  </a>
                </div>
              )}

              {result.dub_error && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 text-sm text-amber-300">
                  {result.dub_error}
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  Văn bản gốc (ngôn ngữ phát hiện: {result.detected_lang || "?"}
                  )
                </h3>
                {result.original_text || "(không có lời thoại)"}
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  Bản dịch
                </h3>
                {result.translated_text || "(không có bản dịch)"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
