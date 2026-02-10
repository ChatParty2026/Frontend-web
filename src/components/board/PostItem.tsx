import { useState } from "react";
import { Clock, Trash2, ThumbsUp, MessageSquare } from "lucide-react";
import type { Post } from "./Board"; // Board에서 Post 인터페이스 export 필요
import type { AuthUser } from "../../types/auth";

const MAX_DISPLAY_LENGTH = 350;

interface PostItemProps {
  post: Post;
  user: AuthUser | null;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onCommentClick: (post: Post) => void;
}

const PostItem = ({
  post,
  user,
  onDelete,
  onLike,
  onCommentClick,
}: PostItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongContent = post.content.length > MAX_DISPLAY_LENGTH;

  // 텍스트 토글 핸들러
  const handleToggleExpand = (e: React.MouseEvent) => {
    if (!isLongContent) return;
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative p-6 rounded-[2.5rem] bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
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

            {user?.nickname === post.author && (
              <button
                onClick={() => onDelete(post.id)}
                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="삭제하기"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 본문 영역: 더 보기 로직 적용 */}
          <div
            className={`${isLongContent ? "cursor-pointer" : ""} group/content`}
            onClick={handleToggleExpand}
          >
            <p className="text-gray-400 text-base leading-relaxed font-medium whitespace-pre-wrap">
              {isExpanded || !isLongContent
                ? post.content
                : `${post.content.slice(0, MAX_DISPLAY_LENGTH)}...`}
            </p>
            {isLongContent && (
              <button className="text-xs text-purple-400 font-bold mt-2 inline-block opacity-60 group-hover/content:opacity-100 transition-opacity cursor-pointer">
                {isExpanded ? "접기" : "더 보기"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center gap-2 pl-12">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-purple-500/10 text-gray-500 hover:text-purple-400 transition-all group/btn"
        >
          <ThumbsUp
            className={`w-4 h-4 ${post.likes > 0 ? "text-purple-500 fill-purple-500/20" : ""}`}
          />
          <span className="text-xs font-black">{post.likes}</span>
        </button>
        <button
          onClick={() => onCommentClick(post)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-pink-500/10 text-gray-500 hover:text-pink-400 transition-all group/btn cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-black">{post.comments}</span>
        </button>
      </div>
    </div>
  );
};

export default PostItem;
