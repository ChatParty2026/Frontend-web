import { X, Gamepad2 } from "lucide-react";
import kakaoLogo from "../../assets/icons/kakao.svg";

export const LoginModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-sm rounded-3xl bg-base-100 p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 btn btn-ghost btn-circle btn-sm hover:rotate-90 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더: 홈 화면의 로고 디자인 반영 */}
        <div className="mb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <Gamepad2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            채티 시작하기
          </h2>
          <p className="mt-2 text-sm text-base-content/60 font-medium">
            친구들과 채팅하며 게임을 즐겨보세요!
          </p>
        </div>

        {/* 소셜 버튼 그룹: DaisyUI 버튼 스타일과 조화 */}
        <div className="flex flex-col gap-4">
          {/* 카카오 */}
          <button className="btn border-none w-full bg-[#FEE500] text-[#191919] hover:bg-[#FADA00] rounded-xl h-14 font-bold shadow-sm">
            <img src={kakaoLogo} className="w-6 h-6" alt="Kakao" />
            카카오로 로그인
          </button>

          {/* 구글 */}
          <button className="btn btn-outline w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-14 font-bold shadow-sm">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5"
              alt="Google"
            />
            구글로 로그인
          </button>

          {/* 네이버 */}
          <button className="btn border-none w-full bg-[#03C75A] text-white hover:bg-[#02b351] rounded-xl h-14 font-bold shadow-sm">
            <span className="text-xl font-black italic mr-1">N</span>
            네이버로 로그인
          </button>
        </div>

        {/* 푸터 */}
        <div className="mt-10 pt-6 border-t border-base-200 text-center">
          <p className="text-[11px] text-base-content/40 leading-relaxed">
            로그인 시 서비스{" "}
            <span className="link link-hover text-primary">이용약관</span> 및
            <span className="link link-hover text-primary ml-1">
              개인정보 처리방침
            </span>
            에 <br />
            자동으로 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
