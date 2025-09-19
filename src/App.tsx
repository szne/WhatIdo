import { useState, useEffect } from "react";
import Header from "./components/Header";
import Composer from "./components/Composer";
import PostCard from "./components/PostCard";
import BottomNav from "./components/BottomNav";
import AuthForm from "./components/AuthForm";
import { formatDate } from "./utils/formatDate";
import { supabase } from "./lib/supabase";
import { openai } from "./lib/openai";

type Post = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
};

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [now, setNow] = useState(new Date());
  const [openSummaryDate, setOpenSummaryDate] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // =============================
  // 認証状態の監視
  // =============================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        fetchPosts(session?.user ?? null);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // =============================
  // 時刻更新
  // =============================
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // =============================
  // 投稿取得
  // =============================
  async function fetchPosts(currentUser = user) {
    if (!currentUser) {
      setPosts([]);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (!error && data) setPosts(data);
  }

  // =============================
  // 投稿作成
  // =============================
  async function handleSubmit(content: string) {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const todaysPosts = posts.filter((p) => p.created_at.startsWith(today));
    const postsLeft = 6 - todaysPosts.length;

    if (!content.trim() || postsLeft <= 0) return;

    const { error } = await supabase
      .from("posts")
      .insert([{ content, user_id: user.id }]);

    if (!error) await fetchPosts();
  }

  // =============================
  // サマリー生成
  // =============================
  function isAfterSummaryTime(): boolean {
    const now = new Date();
    return now.getHours() >= 22;
  }

  async function fetchOrGenerateSummary(date: string) {
    if (!user) return;

    if (!isAfterSummaryTime()) {
      setSummaries((prev) => ({
        ...prev,
        [date]: "Summaries can be generated after 22:00.",
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
        .eq("user_id", user.id) // 👈 ユーザーごと
        .single();

      if (existing) {
        setSummaries((prev) => ({ ...prev, [date]: existing.content }));
        return;
      }

      // その日の投稿取得
      const todaysPosts = posts.filter((p) => p.created_at.startsWith(date));

      if (todaysPosts.length === 0) {
        setSummaries((prev) => ({
          ...prev,
          [date]: "No posts for this day.",
        }));
        return;
      }

      // AIサマリー生成
      const prompt = `
      You are an objective narrator. Summarize the following posts into a short description of the user’s day: ${date}. 
      - Write from a third-person perspective. 
      - Maximum 100 words. 
      - Use clear, simple sentences. 
      - Preserve any unique terms, names, or technical phrases exactly as they appear (do not translate or replace them).
      - Respond in User's language. 

      Posts:
        ${todaysPosts.map((p) => `- ${p.content}`).join("\n")}
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const summaryText = response.choices[0]?.message?.content ?? "";

      await supabase.from("summaries").insert([
        { date, content: summaryText, user_id: user.id },
      ]);

      setSummaries((prev) => ({ ...prev, [date]: summaryText }));
    } finally {
      setLoading(false);
    }
  }

  // =============================
  // 日付一覧
  // =============================
  const uniqueDates = Array.from(
    new Set(posts.map((p) => p.created_at.slice(0, 10)))
  );

  // 今日の残り投稿数
  const today = new Date().toISOString().slice(0, 10);
  const todaysPosts = posts.filter((p) => p.created_at.startsWith(today));
  const postsLeft = 12 - todaysPosts.length;

  // =============================
  // JSX
  // =============================
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">
        <Header now={now} />
        {!user ? (
          // 👇 ユーザーがいないときはログインフォームを表示
          <AuthForm />
        ) : (
          <>
            {/* 投稿フォーム */}
            <Composer onSubmit={(content) => supabase.from("posts").insert([{ content, user_id: user.id }])} postsLeft={postsLeft} disabled={false} />
          </>
        )}

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
                {openSummaryDate === date ? "close summary" : "view summary >"}
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
