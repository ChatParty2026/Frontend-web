import { createPost, deletePost } from "../../api/boardService";
import { PenLine, Send, UserCircle } from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "../../types/auth";
import CommentModal from "../common/CommentModal";
import PostItem from "./PostItem"; // 신규 컴포넌트 임포트

export interface Post {
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
      "그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!그림 맞추기 게임 처음 해봤는데 너무 어려워요 ㅠㅠ 팁 좀 알려주세요!",
    likes: 8,
    comments: 7,
    timestamp: "15분 전",
  },
];

const MAX_CONTENT_LENGTH = 5000;

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
      const response = await createPost({
        type: "THREAD",
        content: newPost,
        title: "",
      });

      const authorAvatar = user.role === "USER" ? user.avatar : "GUEST";
      const formattedPost: Post = {
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
        </div>

        {/* 글쓰기 영역 */}
        {user?.role === "USER" ? (
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
                    maxLength={MAX_CONTENT_LENGTH}
                    placeholder="무슨 생각을 하고 계신가요?"
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 resize-none min-h-[80px] text-lg font-medium"
                  />
                  <div className="flex justify-end items-center gap-4">
                    <button
                      type="submit"
                      disabled={!newPost.trim()}
                      className="btn border-none bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 min-h-0 h-11 font-bold disabled:opacity-30 transition-all"
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

        {/* 게시글 리스트: PostItem 적용 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              user={user}
              onDelete={handleDelete}
              onLike={handleLike}
              onCommentClick={handleOpenComment}
            />
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
