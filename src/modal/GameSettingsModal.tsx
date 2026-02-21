import { X, Save, Users, Gamepad } from "lucide-react";
import { useState, useEffect } from "react";
import LiarGameSettings from "./specific/LiarGameSettings";
// 각 게임별 설정 컴포넌트 (아래에서 정의)

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
  onSave: (settings: any) => void;
  initialMaxPlayers: number;
}

const GameSettingsModal = ({ isOpen, onClose, gameType, onSave, initialMaxPlayers }: Props) => {
  // 공통 상태
  const [maxPlayers, setMaxPlayers] = useState(initialMaxPlayers);
  // 게임별 특화 설정 상태 (객체로 통합 관리)
  const [gameSettings, setGameSettings] = useState<any>({});

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) setMaxPlayers(initialMaxPlayers);
  }, [isOpen, initialMaxPlayers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      maxPlayers,
      ...gameSettings, // 게임별 특화 설정 병합
    });
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
    
      default:
        return (
          <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-gray-500">
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

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* 공통 설정: 인원수 */}
          <div className="space-y-4">
            
          </div>

          <div className="h-px bg-white/5" />

          {/* ✅ 게임별 특화 영역 (이 부분이 동적으로 바뀜) */}
          {renderGameSpecificSettings()}

          {/* 저장 버튼 */}
          <button
            type="submit"
            className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase italic hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
          >
            <Save className="w-5 h-5" /> Settings Apply
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameSettingsModal;