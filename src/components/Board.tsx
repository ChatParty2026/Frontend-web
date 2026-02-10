import { createPost, deletePost } from "../api/boardService";
import {
  MessageSquare,
  ThumbsUp,
  Clock,
  PenLine,
  Send,
  UserCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "../types/auth";
import CommentModal from "./common/commentModal";

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: "게임러버",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamer",
    content: "오늘 스피드 퀴즈 정말 재밌었어요! 다들 한번 해보세요 😊",
    likes: 15,
    comments: 3,
    timestamp: "5분 전",
  },
  {
    id: "2",
    author: "초보플레이어",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=newbie",
    content:
      "그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!",
    likes: 8,
    comments: 7,
    timestamp: "15분 전",
  },
];

const Board = ({ user }: { user: AuthUser | null }) => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // API 호출
      const response = await createPost({
        type: "THREAD",
        content: newPost,
        title: "",
      });

      // 타입 카드: 유저 역할에 따른 아바타 처리
      const authorAvatar = user.role === "USER" ? user.avatar : "GUEST";

      // 성공 시 UI 업데이트
      const formattedPost = {
        id: response.id.toString(),
        author: user.nickname,
        authorAvatar: authorAvatar,
        content: response.content,
        likes: 0,
        comments: 0,
        timestamp: "방금",
      };

      setPosts((prev) => [formattedPost, ...prev]);
      setNewPost("");
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
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
      alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post,
      ),
    );
  };

  const handleOpenComment = (post: Post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const handleCommentSuccess = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post,
      ),
    );
  };

  return (
    <div className="w-full bg-transparent text-white">
      <div className="p-6 md:p-8">
        {/* 헤더 부분 */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PenLine className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight uppercase">
              Community
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">
            Feed
          </span>
        </div>

        {/* 글쓰기 영역: Glassmorphism 적용 */}
        {user ? (
          <form onSubmit={handleSubmit} className="mb-10 group">
            <div className="relative bg-white/5 border border-white/10 rounded-[2rem] p-6 focus-within:border-purple-500/50 transition-all shadow-2xl">
              <div className="flex gap-4">
                <div className="avatar hidden sm:block">
                  <div className="w-12 h-12 rounded-2xl ring-2 ring-purple-500/30">
                    {user.role === "USER" ? (
                      <img src={user.avatar} alt={user.nickname} />
                    ) : (
                      <UserCircle className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="무슨 생각을 하고 계신가요?"
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 resize-none min-h-[80px] text-lg font-medium"
                  />
                  <div className="flex justify-end items-center gap-4">
                    <span className="text-xs text-gray-600 font-bold uppercase tracking-tighter">
                      Press enter to post
                    </span>
                    <button
                      type="submit"
                      disabled={!newPost.trim()}
                      className="btn border-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl px-6 min-h-0 h-11 font-bold shadow-lg shadow-purple-500/20 disabled:opacity-30 disabled:grayscale transition-all"
                    >
                      <Send className="w-4 h-4 mr-2" />
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
              Login to join the conversation
            </p>
          </div>
        )}

        {/* 게시글 리스트 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative p-6 rounded-[2.5rem] bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-xl">
                    <img src={post.authorAvatar} alt={post.author} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-200 text-sm uppercase italic">
                        {post.author}
                      </span>
                      <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.timestamp}
                      </span>
                    </div>

                    {/* ✨ 삭제 버튼: 작성자 본인에게만 표시 */}
                    {user?.nickname === post.author && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="삭제하기"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-400 text-base leading-relaxed font-medium">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2 pl-12">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-purple-500/10 text-gray-500 hover:text-purple-400 transition-all group/btn"
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${post.likes > 0 ? "text-purple-500 fill-purple-500/20" : ""}`}
                  />
                  <span className="text-xs font-black">{post.likes}</span>
                </button>
                <button
                  onClick={() => handleOpenComment(post)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-pink-500/10 text-gray-500 hover:text-pink-400 transition-all group/btn cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-black">{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
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
