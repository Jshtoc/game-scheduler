"use client";

import { useState } from "react";
import TwEmoji from "@/components/ui/TwEmoji";
import FriendsList from "@/components/friends/FriendsList";
import FriendRequests from "@/components/friends/FriendRequests";
import SendFriendRequest from "@/components/friends/SendFriendRequest";

type Tab = "friends" | "requests" | "send";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "friends", label: "친구 목록", icon: "👥" },
  { key: "requests", label: "받은 요청", icon: "📬" },
  { key: "send", label: "친구 추가", icon: "➕" },
];

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <TwEmoji emoji="🤝" size={36} />
          <h1 className="text-3xl font-bold tracking-tight">친구</h1>
        </div>

        <div className="mb-6 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <TwEmoji emoji={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {activeTab === "friends" && (
            <FriendsList key={`friends-${refreshKey}`} />
          )}
          {activeTab === "requests" && (
            <FriendRequests
              key={`requests-${refreshKey}`}
              onUpdate={handleRefresh}
            />
          )}
          {activeTab === "send" && (
            <SendFriendRequest onSent={handleRefresh} />
          )}
        </div>
      </div>
    </div>
  );
}
