"use client";
import { useEffect, useState } from "react";

export default function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, +new Date(to) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);
  const s = Math.floor((left ?? 0) / 1000);
  const parts: [string, number | string][] =
    left === null
      ? [["Days", "--"], ["Hours", "--"], ["Minutes", "--"], ["Seconds", "--"]]
      : [
          ["Days", Math.floor(s / 86400)],
          ["Hours", Math.floor((s % 86400) / 3600)],
          ["Minutes", Math.floor((s % 3600) / 60)],
          ["Seconds", s % 60],
        ];
  return (
    <div className="countdown">
      {parts.map(([l, n]) => (
        <div key={l}>
          <b>{n}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}
