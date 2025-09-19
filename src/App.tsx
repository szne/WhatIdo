import { useState, useEffect } from "react";
import Header from "./components/Header";
import Composer from "./components/Composer";
import PostCard from "./components/PostCard";
import BottomNav from "./components/BottomNav";
import { formatDate } from "./utils/formatDate";
import { supabase } from "./lib/supabase"; // ← ここに変更

type Post = {
  id: number;
  content: string;
  created_at: string;
};

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [now, setNow] = useState(new Date());

  // リアルタイム時計
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 投稿取得
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

  // 投稿制限: 1日6件まで
  const today = new Date().toISOString().slice(0, 10);
  const todaysPosts = posts.filter((p) => p.created_at.startsWith(today));
  const postsLeft = 6 - todaysPosts.length;

  async function handleSubmit(content: string) {
    if (!content.trim() || postsLeft <= 0) return;
    const { error } = await supabase.from("posts").insert([{ content }]);
    if (!error) await fetchPosts();
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">
        {/* Header */}
        <Header now={now} />

        {/* Composer */}
        <Composer
          onSubmit={handleSubmit}
          postsLeft={postsLeft}
          disabled={postsLeft <= 0}
        />

        {/* Timeline */}
        <div className="mt-6 space-y-4">
          {/* 日付区切り + サマリーリンク（ダミー） */}
          <div className="text-center text-neutral-400 text-sm">
            ——— {today} <button className="underline">view summary</button> ———
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

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
