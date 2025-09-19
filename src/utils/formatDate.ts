// utils/formatDate.ts

export function formatDate(d: Date): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const time = d.toLocaleTimeString("en-US", {
    hour12: false, // 24時間表記
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return `${month}/${day} ${time}`;
}
