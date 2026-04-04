"use client";

import { useEffect, useState } from "react";
import { Author } from "@/types/feed";

interface Props {
  postId?: string;
  commentId?: string;
  replyId?: string;
  onClose: () => void;
}

export default function WhoLikedModal({ postId, commentId, replyId, onClose }: Props) {
  const [users, setUsers] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLikes() {
      let url = "";
      if (postId) url = `/api/posts/${postId}/likes`;
      else if (commentId) url = `/api/comments/${commentId}/like`;
      else if (replyId) url = `/api/replies/${replyId}/like`;
      if (!url) return;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data.likes);
      }
      setLoading(false);
    }
    fetchLikes();
  }, [postId, commentId, replyId]);

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" style={{ fontSize: "16px", fontWeight: 600 }}>
              People who liked this
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {loading ? (
              <p style={{ color: "#888", fontSize: "14px" }}>Loading...</p>
            ) : users.length === 0 ? (
              <p style={{ color: "#888", fontSize: "14px" }}>No likes yet.</p>
            ) : (
              users.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <img
                    src={u.avatar ?? "/assets/images/profile.png"}
                    alt={u.firstName}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>
                    {u.firstName} {u.lastName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
