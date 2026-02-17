import React, { useEffect, useState } from "react";
import { PenLine, Send } from "lucide-react";
import { getLatestPosts, createPost, deletePost } from "../../api/boardService";
import type { AuthUser } from "../../types/auth";
import PostItem from "./PostItem";
import CommentModal from "../common/CommentModal";

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  type: string;
  title: string | null;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const MAX_CONTENT_LENGTH = 5000;

const Board = ({ user }: { user: AuthUser | null }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getLatestPosts(undefined, 10);
      setPosts(data);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ROLE_USER 권한이 있는 정식 사용자만 글쓰기 가능
    if (!newPost.trim() || !user || user.role !== "USER" || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await createPost({
        type: "THREAD",
        content: newPost,
        title: "",
      });

      setPosts((prev) => [response, ...prev]);
      setNewPost("");
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("삭제 권한이 없거나 서버 오류가 발생했습니다.");
    }
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleOpenComment = (post: Post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const handleCommentSuccess = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
  };

  return (
    <div className="w-full bg-transparent text-white">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PenLine className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight uppercase">
              Community
            </h2>
          </div>
        </div>

        {/* 글쓰기 영역: user.avatar를 직접 사용 */}
        {user?.role === "USER" ? (
          <form onSubmit={handleSubmit} className="mb-10 group">
            <div className="relative bg-white/5 border border-white/10 rounded-[2rem] p-6 focus-within:border-purple-500/50 transition-all shadow-2xl">
              <div className="flex gap-4">
                <div className="avatar hidden sm:block">
                  <div className="w-12 h-12 rounded-2xl ring-2 ring-purple-500/30 overflow-hidden bg-gray-800">
                    <img 
                      src={user.avatar} 
                      alt={user.nickname} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname}`;
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    maxLength={MAX_CONTENT_LENGTH}
                    placeholder="무슨 생각을 하고 계신가요?"
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 resize-none min-h-[80px] text-lg font-medium"
                  />
                  <div className="flex justify-end items-center gap-4">
                    <button
                      type="submit"
                      disabled={!newPost.trim() || isSubmitting}
                      className="btn border-none bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 min-h-0 h-11 font-bold disabled:opacity-30 transition-all"
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      POST
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-[2rem] text-center mb-10">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
              Login as a member to join the conversation
            </p>
          </div>
        )}

        {/* 게시글 리스트 영역 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="loading loading-dots loading-lg text-purple-500"></span>
              <p className="text-gray-500 animate-pulse">데이터를 불러오는 중입니다...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                user={user}
                onDelete={handleDelete}
                onLike={handleLike}
                onCommentClick={handleOpenComment}
              />
            ))
          ) : (
            <div className="text-center py-20 border border-white/5 rounded-[2rem] bg-white/2">
              <p className="text-gray-600 font-medium">작성된 게시글이 없습니다.</p>
              <p className="text-gray-700 text-sm mt-1">첫 번째 주인공이 되어보세요! 🚀</p>
            </div>
          )}
        </div>
      </div>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={selectedPost}
        user={user}
        onCommentSuccess={handleCommentSuccess}
      />
    </div>
  );
};

export default Board;