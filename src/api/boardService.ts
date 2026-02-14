import axiosInstance from "./axios";

export type PostType = "NORMAL" | "THREAD";

export interface CreatePostRequest {
  type: PostType;
  title?: string;
  content: string;
}


export interface PostResponse {
  id: string;           // postId 대신 id
  author: string;       // userId/nickname 대신 author
  authorAvatar: string;
  type: PostType;
  title: string | null;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;    // createdDate 대신 timestamp
}

export const createPost = async (
  data: CreatePostRequest,
): Promise<PostResponse> => {
  const response = await axiosInstance.post<PostResponse>("/post", data);
  return response.data;
};
//최신 게시글 가져오기
export const getLatestPosts = async (type?: PostType, limit: number = 10): Promise<PostResponse[]> => {
  const response = await axiosInstance.get<PostResponse[]>("/post/latest", {
    params: { type, limit }
  });
  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await axiosInstance.delete(`/post/${postId}`);
};

export interface CreateCommentRequest {
  postId: number;
  content: string;
}

export interface CommentResponse {
  commentId: number;
  postId: number;
  userId: number;
  content: string;
  createdDate: string;
}

// 댓글 작성 API
export const createComment = async (
  data: CreateCommentRequest,
): Promise<CommentResponse> => {
  const response = await axiosInstance.post("/comment", data);
  return response.data;
};
