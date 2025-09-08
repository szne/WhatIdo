import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Card from "./components/Card";
import BottomNav from "./components/BottomNav";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Post = {
  id: number;
  content: string;
  created_at: string;
};

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState<string>("");

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setPosts(data);
  }

  async function addPost() {
    if (!text.trim()) return;
    const { error } = await supabase.from("posts").insert([{ content: text }]);
    if (!error) {
      setText("");
      fetchPosts();
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100 glow">
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">
        <header className="mx-auto max-w-md px-4 pt-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            What I Do
          </h1>
          <p className="mt-2 text-neutral-400">Capture what you’re doing—fast.</p>
        </header>

        {/* Composer */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={2}
              className="peer w-full resize-none bg-transparent px-3 py-2 text-base text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
            />
            <button
              className="shrink-0 rounded-xl border border-white/10 bg-white/10 p-2 hover:bg-white/15 active:bg-white/20 transition-colors"
              title="Add image"
            >
              <PhotoIcon className="size-6 text-neutral-300" />
            </button>
          </div>
          <div className="mt-2 flex justify-end">
            <button
              disabled={!text.trim()}
              onClick={addPost}
              className="rounded-xl bg-white text-neutral-900 px-4 py-2 text-sm font-semibold shadow disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="mt-6 space-y-4">
          {posts.map((p) => (
            <Card
              key={p.id}
              name="Anonymous"
              subtitle={new Date(p.created_at).toLocaleString()}
              text={p.content}
              avatarColor="#56E0C5"
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
