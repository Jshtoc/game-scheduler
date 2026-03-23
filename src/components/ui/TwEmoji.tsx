"use client";

import { parse } from "twemoji-parser";

interface TwEmojiProps {
  emoji: string;
  size?: number;
  className?: string;
}

export default function TwEmoji({ emoji, size = 24, className }: TwEmojiProps) {
  const parsed = parse(emoji);

  if (parsed.length === 0) {
    return null;
  }

  const { url, text } = parsed[0];

  return (
    <img
      src={url}
      alt={text}
      width={size}
      height={size}
      draggable={false}
      className={className}
    />
  );
}
