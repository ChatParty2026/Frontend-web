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
    // 배경: 밤처럼 아주 어둡게 (90%), 블러 효과 강화
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-all duration-500">
      {/* 클럽 네온 효과 (배경 글로우) */}
      <div className="absolute w-64 h-64 bg-purple-600/30 rounded-full blur-[120px] -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-64 h-64 bg-pink-600/30 rounded-full blur-[120px] -bottom-10 -right-10 animate-pulse"></div>

      {/* 모달 컨테이너: 다크 모드 스타일 + 유리 질감(Glassmorphism) */}
      <div className="relative w-full max-w-sm rounded-[2.5rem] bg-[#121212] p-8 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)] border border-white/10 animate-in fade-in zoom-in duration-300">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white hover:rotate-90 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 헤더 */}
        <div className="mb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] mb-4">
            <Gamepad2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white italic">
            CHATTY{" "}
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-medium">
            오늘 밤, 뜨겁게 게임 한 판? 🕹️
          </p>
        </div>

        {/* 소셜 버튼 그룹 */}
        <div className="flex flex-col gap-4">
          <button className="btn border-none w-full bg-[#FEE500] text-[#191919] hover:bg-[#FADA00] rounded-2xl h-14 font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95">
            <img src={kakaoLogo} className="w-6 h-6" alt="Kakao" />
            카카오로 입장하기
          </button>

          <button className="btn border-none w-full bg-white text-gray-900 hover:bg-gray-100 rounded-2xl h-14 font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5"
              alt="Google"
            />
            구글로 입장하기
          </button>

          <button className="btn border-none w-full bg-[#03C75A] text-white hover:bg-[#02b351] rounded-2xl h-14 font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95">
            <span className="text-xl font-black italic mr-1">N</span>
            네이버로 입장하기
          </button>
        </div>

        {/* 푸터 */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 tracking-widest uppercase">
            Join the party with one click
          </p>
        </div>
      </div>
    </div>
  );
};
