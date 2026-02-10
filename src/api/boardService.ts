import axiosInstance from "./axios";

export type PostType = "NORMAL" | "THREAD";

export interface CreatePostRequest {
  type: PostType;
  title?: string;
  content: string;
}

export interface PostResponse {
  id: number;
  userId: number;
  type: PostType;
  title: string;
  content: string;
  createdDate: string; // "2026-02-10T..."
}

export const createPost = async (
  data: CreatePostRequest,
): Promise<PostResponse> => {
  const response = await axiosInstance.post<PostResponse>("/post", data);
  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await axiosInstance.delete(`/post/${postId}`);
};
