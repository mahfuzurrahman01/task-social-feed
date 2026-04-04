"use client";

import { useState, FormEvent } from "react";
import { Comment, Reply } from "@/types/feed";
import { useAuth } from "@/contexts/AuthContext";
import WhoLikedModal from "./WhoLikedModal";
import ReplyItem from "./ReplyItem";
import { timeAgo } from "@/lib/time";

interface Props {
  comment: Comment;
}

export default function CommentItem({ comment: initial }: Props) {
  const { user } = useAuth();
  const [comment, setComment] = useState(initial);
  const [showWhoLiked, setShowWhoLiked] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [postingReply, setPostingReply] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setComment((prev) => ({
        ...prev,
        likedByMe: data.data.liked,
        _count: { ...prev._count, likes: data.data.likeCount },
      }));
    }
  }

  async function loadReplies() {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setLoadingReplies(true);
    const res = await fetch(`/api/comments/${comment.id}/replies`);
    if (res.ok) {
      const data = await res.json();
      setReplies(data.data.replies);
    }
    setLoadingReplies(false);
    setShowReplies(true);
  }

  async function submitReply(e: FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setPostingReply(true);
    const res = await fetch(`/api/comments/${comment.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText }),
    });
    if (res.ok) {
      const data = await res.json();
      setReplies((prev) => [data.data.reply, ...prev]);
      setShowReplies(true);
      setComment((prev) => ({
        ...prev,
        _count: { ...prev._count, replies: prev._count.replies + 1 },
      }));
      setReplyText("");
      setShowReplyBox(false);
    }
    setPostingReply(false);
  }

  return (
    <div className="_comment_main">
      <div className="_comment_image">
        <a href="#" className="_comment_image_link">
          <img
            src={comment.author.avatar ?? "/assets/images/txt_img.png"}
            alt={comment.author.firstName}
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
                  {comment.author.firstName} {comment.author.lastName}
                </h4>
              </a>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{comment.content}</span>
            </p>
          </div>
          {comment._count.likes > 0 && (
            <div className="_total_reactions">
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </span>
                <span className="_reaction_heart">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </span>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                onClick={() => setShowWhoLiked(true)}
              >
                <span className="_total">{comment._count.likes}</span>
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
                      color: comment.likedByMe ? "#377DFF" : undefined,
                      fontWeight: comment.likedByMe ? 600 : undefined,
                    }}
                    onClick={toggleLike}
                    disabled={!user}
                  >
                    <span>Like.</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                    onClick={() => setShowReplyBox(!showReplyBox)}
                  >
                    <span>Reply.</span>
                  </button>
                </li>
                <li><span className="_time_link">.{timeAgo(comment.createdAt)}</span></li>
              </ul>
            </div>
          </div>

          {/* Reply input box */}
          {showReplyBox && user && (
            <div className="_feed_inner_comment_box" style={{ marginTop: "8px" }}>
              <form className="_feed_inner_comment_box_form" onSubmit={submitReply}>
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img
                      src={user.avatar ?? "/assets/images/comment_img.png"}
                      alt=""
                      className="_comment_img"
                    />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitReply(e as unknown as FormEvent);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_icon">
                  <button
                    type="submit"
                    className="_feed_inner_comment_box_icon_btn"
                    disabled={postingReply}
                    style={{ opacity: postingReply ? 0.6 : 1 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                      <path fill="#666" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Replies */}
        {comment._count.replies > 0 && !showReplies && (
          <button
            type="button"
            className="_previous_comment_txt"
            onClick={loadReplies}
            disabled={loadingReplies}
            style={{ marginTop: "8px" }}
          >
            {loadingReplies ? "Loading..." : `View ${comment._count.replies} ${comment._count.replies === 1 ? "reply" : "replies"}`}
          </button>
        )}
        {showReplies && (
          <>
            {replies.map((r) => (
              <ReplyItem key={r.id} reply={r} />
            ))}
            <button
              type="button"
              className="_previous_comment_txt"
              onClick={() => setShowReplies(false)}
              style={{ marginTop: "4px" }}
            >
              Hide replies
            </button>
          </>
        )}
      </div>

      {showWhoLiked && (
        <WhoLikedModal commentId={comment.id} onClose={() => setShowWhoLiked(false)} />
      )}
    </div>
  );
}
