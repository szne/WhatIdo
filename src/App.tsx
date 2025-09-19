import { useState, useEffect } from "react";
import Header from "./components/Header";
import Composer from "./components/Composer";
import PostCard from "./components/PostCard";
import BottomNav from "./components/BottomNav";
import { formatDate } from "./utils/formatDate";
import { supabase } from "./lib/supabase";
import { openai } from "./lib/openai";

type Post = {
  id: number;
  content: string;
  created_at: string;
};

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [now, setNow] = useState(new Date());
  const [openSummaryDate, setOpenSummaryDate] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
  }

  function isAfterSummaryTime(): boolean {
    const now = new Date();
    return now.getHours() >= 22; // 22:00以降ならtrue
  }

  // サマリー取得 or 生成
  async function fetchOrGenerateSummary(date: string) {
  if (!isAfterSummaryTime()) {
    setSummaries((prev) => ({
      ...prev,
      [date]: "サマリーは22:00以降に生成できます。",
    }));
    return;
  }

  setLoading(true);
  try {
    // 既存サマリー確認
    const { data: existing } = await supabase
      .from("summaries")
      .select("*")
      .eq("date", date)
      .single();

    if (existing) {
      setSummaries((prev) => ({ ...prev, [date]: existing.content }));
      return;
    }

    // その日の投稿取得
    const todaysPosts = posts.filter((p) =>
      p.created_at.startsWith(date)
    );

    if (todaysPosts.length === 0) {
      setSummaries((prev) => ({
        ...prev,
        [date]: "No posts for this day.",
      }));
      return;
    }

    // AIサマリー生成
    const prompt = `
      以下は${date}の投稿です。これを100文字程度でまとめてください。
      ${todaysPosts.map((p) => `- ${p.content}`).join("\n")}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const summaryText = response.choices[0]?.message?.content ?? "";

    await supabase.from("summaries").insert([{ date, content: summaryText }]);

    setSummaries((prev) => ({ ...prev, [date]: summaryText }));
  } finally {
    setLoading(false);
  }
}


  // 日付一覧をユニークにまとめる
  const uniqueDates = Array.from(
    new Set(posts.map((p) => p.created_at.slice(0, 10)))
  );

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">
        <Header now={now} />
        <Composer
          onSubmit={(c) => supabase.from("posts").insert([{ content: c }]).then(fetchPosts)}
          postsLeft={12 - posts.filter(p => p.created_at.startsWith(new Date().toISOString().slice(0, 10))).length}
          disabled={false}
        />

        {/* 日付ごとのサマリー + 投稿 */}
        {uniqueDates.map((date) => (
          <div key={date} className="mt-8">
            {/* ヘッダー */}
            <div className="text-center text-neutral-400 text-sm flex justify-center items-center gap-2">
              ——— {date}{" "}
              <button
                onClick={() => {
                  if (openSummaryDate === date) {
                    setOpenSummaryDate(null);
                  } else {
                    setOpenSummaryDate(date);
                    fetchOrGenerateSummary(date);
                  }
                }}
                className="underline"
              >
                {openSummaryDate === date ? "close summary v" : "view summary >"}
              </button>{" "}
              ———
            </div>

            {/* サマリー部分 */}
            {openSummaryDate === date && (
              <div className="mt-3">
                {loading && <p className="text-neutral-400">Generating...</p>}
                {!loading && summaries[date] && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-neutral-200">
                    {summaries[date]}
                  </div>
                )}
              </div>
            )}

            {/* その日の投稿 */}
            <div className="mt-4 space-y-3">
              {posts
                .filter((p) => p.created_at.startsWith(date))
                .map((p) => (
                  <PostCard
                    key={p.id}
                    content={p.content}
                    createdAt={formatDate(new Date(p.created_at))}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
