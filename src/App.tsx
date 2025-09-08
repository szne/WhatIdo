import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Card from "./components/Card";
import BottomNav from "./components/BottomNav";
import Composer from "./components/Composer";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Post = { id: number; content: string; created_at: string };

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchPosts();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function formatDate(d: Date) {
    return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString()}`;
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
  }

  async function handleSubmit(content: string) {
    const { error } = await supabase.from("posts").insert([{ content }]);
    if (!error) await fetchPosts();
  }

  return (
    <div className="min-h-dvh text-neutral-100">
      <div className="relative z-10">
        <div className="mx-auto max-w-md px-4 pb-28 pt-8">
        <header className="mx-auto max-w-md px-4 pt-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            What I Do
          </h1>
          <p className="mt-2 text-neutral-400">
            Captured in time — {formatDate(now)}
          </p>
        </header>

        {/* Composer */}
        <Composer onSubmit={handleSubmit} />

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
      </div>

      <BottomNav />
    </div>
  );
}
