import { useState } from "react";

type ComposerProps = {
  onSubmit: (content: string) => void;
  postsLeft: number;
  disabled?: boolean;
};

export default function Composer({ onSubmit, postsLeft, disabled }: ComposerProps) {
  const [text, setText] = useState("");

  function handlePost() {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your moment..."
        rows={2}
        className="w-full resize-none bg-transparent text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
        disabled={disabled}
      />
      <div className="mt-3 flex items-center justify-between">
        {/* 残り投稿数 */}
        <span className="text-sm text-neutral-400">
          {postsLeft} / 6 posts left
        </span>

        {/* 投稿ボタン */}
        <button
          onClick={handlePost}
          disabled={disabled || !text.trim()}
          className="rounded-xl bg-white text-neutral-900 px-4 py-2 text-sm font-semibold shadow disabled:opacity-40"
        >
          Post
        </button>
      </div>
    </div>
  );
}
