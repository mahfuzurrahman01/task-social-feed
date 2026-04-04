"use client";

import { useState } from "react";
import { Reply } from "@/types/feed";
import { useAuth } from "@/contexts/AuthContext";
import WhoLikedModal from "./WhoLikedModal";
import { timeAgo } from "@/lib/time";

interface Props {
  reply: Reply;
}

export default function ReplyItem({ reply: initial }: Props) {
  const { user } = useAuth();
  const [reply, setReply] = useState(initial);
  const [showWhoLiked, setShowWhoLiked] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/replies/${reply.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setReply((prev) => ({
        ...prev,
        likedByMe: data.data.liked,
        _count: { ...prev._count, likes: data.data.likeCount },
      }));
    }
  }

  return (
    <div className="_comment_main" style={{ marginLeft: "48px", marginTop: "8px" }}>
      <div className="_comment_image">
        <a href="#" className="_comment_image_link">
          <img
            src={reply.author.avatar ?? "/assets/images/txt_img.png"}
            alt={reply.author.firstName}
            className="_comment_img1"
          />
        </a>
      </div>
      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <a href="#">
                <h4 className="_comment_name_title">
                  {reply.author.firstName} {reply.author.lastName}
                </h4>
              </a>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{reply.content}</span>
            </p>
          </div>
          {reply._count.likes > 0 && (
            <div className="_total_reactions">
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </span>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                onClick={() => setShowWhoLiked(true)}
              >
                <span className="_total">{reply._count.likes}</span>
              </button>
            </div>
          )}
          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list">
                <li>
                  <button
                    type="button"
                    style={{
                      background: "none", border: "none", padding: 0, cursor: "pointer",
                      color: reply.likedByMe ? "#377DFF" : undefined, fontWeight: reply.likedByMe ? 600 : undefined,
                    }}
                    onClick={toggleLike}
                    disabled={!user}
                  >
                    <span>Like.</span>
                  </button>
                </li>
                <li><span className="_time_link">.{timeAgo(reply.createdAt)}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {showWhoLiked && (
        <WhoLikedModal replyId={reply.id} onClose={() => setShowWhoLiked(false)} />
      )}
    </div>
  );
}
