import { useState } from "react";
import kakaoLogo from "../../assets/icons/kakao.svg";

const LoginModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            반가워요! 👋
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            간편하게 소셜 계정으로 시작해보세요.
          </p>
        </div>

        {/* 소셜 버튼 그룹 */}
        <div className="flex flex-col gap-3">
          {/* 카카오 */}
          <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] py-3 text-sm font-semibold text-[#191919] hover:bg-[#FADA00] transition-colors">
            <img src={kakaoLogo} className="w-5 h-5" alt="Kakao" />
            카카오로 시작하기
          </button>

          {/* 구글 */}
          <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <img
              src="https://www.google.com/favicon.ico"
              className="w-5 h-5"
              alt="Google"
            />
            구글로 시작하기
          </button>

          {/* 네이버 */}
          <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#03C75A] py-3 text-sm font-semibold text-white hover:bg-[#02b351] transition-colors">
            <span className="font-bold">N</span>
            네이버로 시작하기
          </button>
        </div>

        {/* 푸터 */}
        <p className="mt-8 text-center text-xs text-gray-400">
          로그인 시 서비스{" "}
          <span className="underline underline-offset-2 cursor-pointer">
            이용약관
          </span>{" "}
          및
          <span className="underline underline-offset-2 cursor-pointer ml-1">
            개인정보 처리방침
          </span>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
