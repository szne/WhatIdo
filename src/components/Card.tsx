type CardProps = {
  name: string;
  subtitle?: string;
  text: string;
  avatarUrl?: string;
  avatarColor?: string;
};

export default function Card({
  name,
  subtitle,
  text,
  avatarUrl,
  avatarColor,
}: CardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="flex gap-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
          {avatarUrl ? (
            <img src={avatarUrl} className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: avatarColor ?? "#888" }}
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{name}</div>
          {subtitle && (
            <div className="text-xs text-neutral-400">{subtitle}</div>
          )}
          <p className="mt-2 whitespace-pre-wrap text-neutral-200 leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}
