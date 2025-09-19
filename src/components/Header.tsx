type HeaderProps = {
  now: Date;
};

export default function Header({ now }: HeaderProps) {
  // フォーマット: 9/21 23:04:15
  const formatted = `${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString()}`;

  return (
    <header className="mx-auto max-w-md px-4 pt-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        What I Do
      </h1>
      <p className="mt-2 text-neutral-400">
        Captured in time — {formatted}
      </p>
    </header>
  );
}
