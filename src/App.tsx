import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Post = {
  id: number;
  content: string;
  created_at: string;
};

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) setPosts(data);
  }

  async function addPost() {
    if (!text) return;

    const { error } = await supabase
      .from("posts")
      .insert([{ content: text }]);

    if (error) {
      console.error(error);
      return;
    }

    setText("");
    fetchPosts();
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h1>What you do?</h1>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={addPost}>投稿</button>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>{p.content}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
