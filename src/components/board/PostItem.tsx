import { useState } from "react";
import { Clock, Trash2, ThumbsUp, MessageSquare } from "lucide-react";
import type { Post } from "./Board"; 
import type { AuthUser } from "../../types/auth";
import { formatRelativeTime } from "../../utils/dateUtils";

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

  return (
    <div className="relative p-6 rounded-[2.5rem] bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="avatar">
          {/* 작성자 아바타 적용 및 Fallback 처리 */}
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 ring-1 ring-white/10">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('dicebear')) {
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`;
                }
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <span className={`font-bold text-sm uppercase italic ${user?.nickname === post.author ? "text-purple-400" : "text-gray-200"}`}>
                {post.author}
              </span>
              <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(post.timestamp)}
              </span>
            </div>

            {/* 내 글인 경우에만 삭제 버튼 표시 (닉네임 비교) */}
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

          <div className={`${isLongContent ? "cursor-pointer" : ""} relative`}>
            <div
              className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                isExpanded ? "max-h-[2000px]" : "max-h-[4.5em]"
              }`}
            >
              <p className="text-gray-400 text-base leading-relaxed font-medium whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {isLongContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-purple-400 font-bold mt-2 inline-block opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isExpanded ? "접기" : "더 보기"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-12">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-purple-500/10 text-gray-500 hover:text-purple-400 transition-all"
        >
          <ThumbsUp
            className={`w-4 h-4 ${post.likes > 0 ? "text-purple-500 fill-purple-500/20" : ""}`}
          />
          <span className="text-xs font-black">{post.likes}</span>
        </button>
        <button
          onClick={() => onCommentClick(post)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-pink-500/10 text-gray-500 hover:text-pink-400 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-black">{post.comments}</span>
        </button>
      </div>
    </div>
  );
};

export default PostItem;