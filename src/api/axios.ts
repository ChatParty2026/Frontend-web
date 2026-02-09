import axios from "axios";
import type { AxiosInstance } from "axios";

// 1. 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // .env에 정의한 주소
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터 (예: 로컬 스토리지에서 토큰을 가져와 헤더에 넣을 때)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. 응답 인터셉터 (예: 에러 메시지 공통 처리)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 에러 발생:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default axiosInstance;
