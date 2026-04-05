"use client";

import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types/feed";
import Navbar from "@/components/layout/Navbar";
import DarkModeToggle from "@/components/layout/DarkModeToggle";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import StoryCards from "@/components/feed/StoryCards";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadPosts = useCallback(async (cursorParam?: string) => {
    if (loading) return;
    setLoading(true);
    const url = cursorParam ? `/api/posts?cursor=${cursorParam}` : "/api/posts";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const newPosts: Post[] = data.data.posts;
      setPosts((prev) => cursorParam ? [...prev, ...newPosts] : newPosts);
      setCursor(data.data.nextCursor ?? null);
      setHasMore(!!data.data.nextCursor);
    }
    setLoading(false);
    setInitialLoaded(true);
  }, [loading]);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handlePostDeleted(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="_layout _layout_main_wrapper">
      <DarkModeToggle />

      <div className="_main_layout">
        <Navbar />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
          <div className="row">
            {/* Left Sidebar */}
            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
              <LeftSidebar />
            </div>

            {/* Middle — Feed */}
            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
              <div className="_layout_middle_wrap">
                <div className="_layout_middle_inner">
                  <StoryCards />
                  <CreatePost onPostCreated={handlePostCreated} />

                  {/* Posts */}
                  {!initialLoaded && (
                    <div style={{ textAlign: "center", padding: "24px", color: "#888" }}>
                      Loading posts...
                    </div>
                  )}
                  {initialLoaded && posts.length === 0 && (
                    <div
                      className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16"
                      style={{ textAlign: "center", color: "#888" }}
                    >
                      No posts yet. Be the first to post!
                    </div>
                  )}
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
                  ))}

                  {/* Load more */}
                  {hasMore && initialLoaded && (
                    <div style={{ textAlign: "center", paddingBottom: "24px" }}>
                      <button
                        type="button"
                        className="_feed_inner_text_area_btn_link"
                        onClick={() => loadPosts(cursor ?? undefined)}
                        disabled={loading}
                        style={{ padding: "10px 28px" }}
                      >
                        {loading ? "Loading..." : "Load more"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
              <RightSidebar />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
