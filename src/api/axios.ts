import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { GuestLoginResponse } from "../types/auth";

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

// 재발급 중인지 확인하는 플래그와 대기열
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// 대기열에 있는 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도한 적이 없는 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 토큰 재발급 중이라면 대기열로 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      return new Promise((resolve, reject) => {
        // 인스턴스가 아닌 '기본 axios'로 재발급 요청 (인터셉터 무한 루프 방지)
        axios
          .post<GuestLoginResponse>(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            },
          )
          .then(({ data }) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            axiosInstance.defaults.headers.common["Authorization"] =
              `Bearer ${data.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

            processQueue(null, data.accessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            // 리프레시 실패 시 로그아웃 처리
            localStorage.clear();
            window.location.href = "/";
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    console.error("API 에러 발생:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default axiosInstance;
