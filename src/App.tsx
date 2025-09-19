import { useState, useEffect } from "react";
import Header from "./components/Header";
import Composer from "./components/Composer";
import PostCard from "./components/PostCard";
import BottomNav from "./components/BottomNav";
import { formatDate } from "./utils/formatDate";
import { supabase } from "./lib/supabase";
import { openai } from "./lib/openai"; // ← 追加

type Post = {
  id: number;
  content: string;
  created_at: string;
};

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [now, setNow] = useState(new Date());
  const [summary, setSummary] = useState<string>(""); // AIサマリー

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

  const today = new Date().toISOString().slice(0, 10);
  const todaysPosts = posts.filter((p) => p.created_at.startsWith(today));
  const postsLeft = 12 - todaysPosts.length;

  async function handleSubmit(content: string) {
    if (!content.trim() || postsLeft <= 0) return;
    const { error } = await supabase.from("posts").insert([{ content }]);
    if (!error) await fetchPosts();
  }

  // AIサマリー生成
  async function generateSummary() {
    if (todaysPosts.length === 0) {
      setSummary("No posts today.");
      return;
    }

    const prompt = `
      以下は今日の投稿です。これをもとに、一日の出来事を短く要約してください。
      - 出力は100文字以内の要約で。

      投稿一覧:
      ${todaysPosts.map((p) => `- ${p.content}`).join("\n")}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 軽量で速いモデルを利用
        messages: [{ role: "user", content: prompt }],
      });
      setSummary(response.choices[0]?.message?.content ?? "");
    } catch (e) {
      console.error(e);
      setSummary("サマリー生成に失敗しました。");
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">
        <Header now={now} />
        <Composer onSubmit={handleSubmit} postsLeft={postsLeft} disabled={postsLeft <= 0} />
        {/* AIサマリー表示 */}
        <div className="mt-6">
          <button
            onClick={generateSummary}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-600"
          >
            Generate Summary
          </button>
          {summary && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-neutral-200">
              {summary}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-4">
          <div className="text-center text-neutral-400 text-sm">
            ——— {today} ———
          </div>
          {posts.map((p) => (
            <PostCard
              key={p.id}
              content={p.content}
              createdAt={formatDate(new Date(p.created_at))}
            />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
