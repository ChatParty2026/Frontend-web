import { X, Save, Gamepad } from "lucide-react";
import { useState, useEffect } from "react";
import LiarGameSettings from "./specific/LiarGameSettings";
import MafiaGameSettings from "./specific/MafiaGameSettings";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
  onSave: (settings: any) => void;
  // 🎯 서버에서 받아온 초기 설정값을 받습니다.
  initialSettings?: any;
}

const GameSettingsModal = ({ isOpen, onClose, gameType, onSave, initialSettings = {} }: Props) => {
  // 게임별 특화 설정 상태 (객체로 통합 관리)
  const [gameSettings, setGameSettings] = useState<any>(initialSettings);

  // 모달이 열릴 때마다 부모(대기실)에서 준 최신 설정값으로 덮어씌움
  useEffect(() => {
    if (isOpen) {
      setGameSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(gameSettings); // maxPlayers도 gameSettings 안에서 관리되어 한 번에 전송됨
  };

  // ✅ 게임 타입에 따라 설정 UI를 리턴하는 함수
  const renderGameSpecificSettings = () => {
    const props = { 
      settings: gameSettings, 
      onChange: (newSettings: any) => setGameSettings((prev: any) => ({ ...prev, ...newSettings })) 
    };

    switch (gameType) {
      case "LIAR":
        return <LiarGameSettings {...props} />;
      case "MAFIA":
        return <MafiaGameSettings {...props} />;

      default:
        return (
          <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-gray-500 font-bold">
            준비 중인 게임입니다.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* 헤더 */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
            <Gamepad className="w-5 h-5 text-purple-500" /> {gameType} SETTINGS
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* ✅ 게임별 특화 영역 */}
          {renderGameSpecificSettings()}

          {/* 저장 버튼 */}
          <button
            type="submit"
            className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase italic hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] mt-4"
          >
            <Save className="w-5 h-5" /> Settings Apply
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameSettingsModal;