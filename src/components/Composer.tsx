import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

type ComposerProps = {
  onSubmit: (content: string) => Promise<void> | void;
  className?: string;
};

export default function Composer({ onSubmit, className }: ComposerProps) {
  const [text, setText] = useState("");

  async function handlePost() {
    const value = text.trim();
    if (!value) return;
    await onSubmit(value);
    setText(""); // 送信後クリア
  }

  return (
    <div className={`mt-6 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur ${className ?? ""}`}>
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
          onClick={handlePost}
          className="rounded-xl bg-white text-neutral-900 px-4 py-2 text-sm font-semibold shadow disabled:opacity-40"
          disabled={!text.trim()}
        >
          Post
        </button>
      </div>
    </div>
  );
}
