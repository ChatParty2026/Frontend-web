import { MessageSquare, ThumbsUp, Clock, PenLine } from "lucide-react";
import { useState } from "react";

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

export function Board() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPost, setNewPost] = useState("");

  // 테스트를 위한 임시 유저 데이터 (실제 연동 시 useAuth 사용)
  const user = {
    name: "나",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    const post: Post = {
      id: Date.now().toString(),
      author: user.name,
      authorAvatar: user.avatar,
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: "방금",
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post,
      ),
    );
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-6">
        <div className="flex items-center gap-2 mb-6">
          <PenLine className="w-6 h-6 text-primary" />
          <h2 className="card-title text-2xl font-bold">자유 게시판</h2>
        </div>

        {/* 글쓰기 영역 */}
        {user ? (
          <form onSubmit={handleSubmit} className="mb-8 space-y-3">
            <div className="flex gap-4">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                  <img src={user.avatar} alt={user.name} />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="새로운 소식을 공유해보세요!"
                  className="textarea textarea-bordered w-full h-24 focus:textarea-primary resize-none rounded-xl"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newPost.trim()}
                    className="btn btn-primary btn-md rounded-xl px-8"
                  >
                    게시하기
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="alert bg-base-200 mb-8 border-none rounded-xl">
            <span>로그인하시면 게시글을 작성할 수 있습니다.</span>
          </div>
        )}

        {/* 게시글 리스트 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl border border-base-200 hover:border-primary/30 hover:bg-base-200/30 transition-all group"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={post.authorAvatar} alt={post.author} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base-content">
                      {post.author}
                    </span>
                    <span className="text-xs text-base-content/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.timestamp}
                    </span>
                  </div>
                  <p className="text-base-content/80 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-4 pl-14">
                <button
                  onClick={() => handleLike(post.id)}
                  className="btn btn-ghost btn-xs rounded-lg gap-1.5 hover:text-primary transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="btn btn-ghost btn-xs rounded-lg gap-1.5 hover:text-secondary transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
