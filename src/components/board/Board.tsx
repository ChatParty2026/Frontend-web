import React, { useEffect, useState } from "react";
import { PenLine, Send } from "lucide-react";
import { getLatestPosts, createPost, deletePost } from "../../api/boardService";
import type { AuthUser } from "../../types/auth";
import PostItem from "./PostItem";
import CommentModal from "../common/CommentModal";

export interface Post {
  id: string; author: string; authorAvatar: string; type: string;
  title: string | null; content: string; likes: number; comments: number; timestamp: string;
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
      const data = await getLatestPosts(undefined, 4);
      setPosts(data.slice(0, 4));
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user || user.role !== "USER" || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await createPost({ type: "THREAD", content: newPost, title: "" });

      // ✅ [해결] 즉시 4개로 제한하여 업데이트 (늘어났다 돌아오는 현상 방지)
      setPosts((prev) => [response, ...prev].slice(0, 4));
      setNewPost("");
    } catch (error) {
      console.error("등록 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      fetchPosts(); 
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div className="w-full bg-transparent text-white">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <PenLine className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Community</h2>
        </div>

        {user?.role === "USER" && (
          <form onSubmit={handleSubmit} className="mb-10">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 focus-within:border-purple-500/50 transition-all">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="무슨 생각을 하고 계신가요?"
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 resize-none min-h-[80px] text-lg font-medium"
              />
              <div className="flex justify-end mt-2">
                <button type="submit" disabled={!newPost.trim() || isSubmitting} className="btn border-none bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 h-11 font-bold">
                  {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : "POST"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ✅ [해결] 리스트 컨테이너 최적화 */}
        <div 
          className="space-y-4" 
          style={{ 
            minHeight: '600px', // 게시글 4개 분량의 공간을 미리 확보
            overflowAnchor: 'none', // 스크롤 튐 방지
            contain: 'layout' // 보드 내부의 변화가 외부 크기에 영향을 주지 않도록 선언
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center py-20"><span className="loading loading-dots loading-lg text-purple-500"></span></div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  // 새 글인 경우(index 0)에만 애니메이션을 주어 시각적으로 부드럽게 표현
                  className={index === 0 ? "animate-in fade-in slide-in-from-top-4 duration-500 ease-out" : ""}
                >
                  <PostItem 
                    post={post} 
                    user={user} 
                    onDelete={handleDelete} 
                    onLike={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, likes: p.likes + 1} : p))} 
                    onCommentClick={(p) => { setSelectedPost(p); setIsCommentModalOpen(true); }} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CommentModal 
        isOpen={isCommentModalOpen} 
        onClose={() => setIsCommentModalOpen(false)} 
        post={selectedPost} 
        user={user} 
        onCommentSuccess={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, comments: p.comments + 1} : p))} 
      />
    </div>
  );
};

export default Board;