import { X, Send, Image as ImageIcon, Smile, MapPin } from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";
import type { AuthUser } from "../../types/auth";
import { createComment } from "../../api/boardService";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    author: string;
    authorAvatar: string;
    content: string;
    timestamp: string;
  } | null;
  user: AuthUser | null;
  onCommentSuccess?: (postId: string) => void;
}

const CommentModal = ({
  isOpen,
  onClose,
  post,
  user,
  onCommentSuccess,
}: CommentModalProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !post) return null;

  const handlePostComment = async () => {
    if (!comment.trim() || !user || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createComment({ postId: Number(post.id), content: comment });

      setComment("");
      if (onCommentSuccess) onCommentSuccess(post.id);
      onClose();
    } catch (error: any) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-xl bg-[#181818] rounded-[1.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            취소
          </button>
          <h3 className="text-base font-bold">댓글</h3>
          <div className="w-8" /> {/* 밸런스를 위한 더미 */}
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 원본 게시글 */}
          <div className="flex gap-4 relative">
            {/* 수직선 효과 */}
            <div className="absolute left-6 top-12 bottom-0 w-[2px] bg-white/10" />

            <div className="avatar z-10">
              <div className="w-12 h-12 rounded-full ring-1 ring-white/10">
                <img src={post.authorAvatar} alt={post.author} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">{post.author}</span>
                <span className="text-xs text-white/40">{post.timestamp}</span>
              </div>
              <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          </div>

          {/* 댓글 입력창 (작성 중인 유저) */}
          <div className="flex gap-4 mt-8">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring-1 ring-white/10 bg-zinc-800">
                {user?.role === "USER" ? (
                  <img src={user.avatar} alt={user.nickname} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-white/20" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm mb-1">
                {user?.nickname || "GUEST"}
              </div>
              <textarea
                autoFocus
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`${post.author}님에게 댓글 남기기...`}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 resize-none min-h-[100px] text-sm p-0"
              />

              {/* 아이콘 도구 모음 */}
              {/* <div className="flex items-center gap-4 mt-2 text-white/30">
                <ImageIcon className="w-5 h-5 cursor-pointer hover:text-white/60" />
                <Smile className="w-5 h-5 cursor-pointer hover:text-white/60" />
                <MapPin className="w-5 h-5 cursor-pointer hover:text-white/60" />
              </div> */}
            </div>
          </div>
        </div>

        {/* 하단 푸터 (게시 버튼) */}
        <div className="p-4 flex items-center justify-end border-t border-white/5 bg-[#181818]">
          <button
            onClick={handlePostComment}
            disabled={!comment.trim() || isSubmitting}
            className="btn border-none bg-white text-black hover:bg-zinc-200 rounded-full px-6 min-h-0 h-10 font-bold disabled:opacity-30 transition-all"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "게시"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CommentModal;
