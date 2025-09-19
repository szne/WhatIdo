type PostCardProps = {
  content: string;
  createdAt: string;
  author?: string; // 将来用（今は "Anonymous" デフォルト）
};

export default function PostCard({ content, createdAt, author = "User" }: PostCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="flex gap-3">
        {/* アバター（将来拡張用: 色や画像差し替え可） */}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 bg-gradient-to-br from-indigo-500 to-cyan-400" />

        {/* 投稿内容 */}
        <div className="min-w-0">
          <div className="text-sm font-semibold">{author}</div>
          <div className="text-xs text-neutral-400">{createdAt}</div>
          <p className="mt-2 whitespace-pre-wrap text-neutral-200 leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </article>
  );
}
