import { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ShieldQuestion, Fingerprint, LogOut, Timer, Trophy, Send, User } from "lucide-react";
import { useSocket } from "../../context/SocketContext";

// --- 유저별 프로필 카드 + 말풍선 컴포넌트 ---
const PlayerSection = memo(({ nick, avatarUrl, phase, onVote, voteCount, messages, isLeft, isMe, isVoted }: any) => (
  <div className={`flex items-start gap-4 w-full ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
    
    {/* 사각형 프로필 카드 */}
    <div 
      onClick={() => onVote(nick)} 
      className={`relative w-24 h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all cursor-pointer shadow-xl shrink-0
        ${isMe ? "border-yellow-500 bg-yellow-500/5" : isVoted ? "border-blue-500 bg-blue-500/10 scale-105" : "border-white/5 bg-zinc-900/80"}
        ${phase === "DISCUSSION" && !isMe ? "hover:border-blue-400 hover:scale-105" : ""}`}
    >
      {/* 내 카드 표시 배지 */}
      {isMe && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow-lg">
          YOU
        </div>
      )}

      <div className={`w-12 h-12 rounded-full overflow-hidden border-2 mb-2 bg-black ${isMe ? "border-yellow-500" : "border-zinc-700"}`}>
        <img 
          src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nick}`} 
          className="w-full h-full object-cover" 
          alt={nick} 
        />
      </div>
      <p className={`text-[11px] font-black truncate w-20 text-center ${isMe ? "text-yellow-500" : "text-zinc-300"}`}>{nick}</p>
      
      {/* 투표 받은 수 표시 */}
      {voteCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center animate-bounce ring-2 ring-black">
          {voteCount}
        </div>
      )}
    </div>

    {/* 말풍선 영역 */}
    <div className={`flex flex-col gap-2 flex-1 max-w-[220px] pt-1 ${isLeft ? "items-start" : "items-end"}`}>
      {messages[1] && (
        <div className={`p-3 rounded-2xl text-[11px] shadow-lg animate-in fade-in zoom-in duration-300 w-full border border-white/5
          ${isLeft ? "rounded-tl-none bg-zinc-800" : "rounded-tr-none bg-zinc-800"}`}>
          <span className="block opacity-40 text-[8px] font-bold mb-1 uppercase text-blue-400">Round 1</span>
          <p className="leading-snug">{messages[1]}</p>
        </div>
      )}
      {messages[2] && (
        <div className={`p-3 rounded-2xl text-[11px] shadow-lg animate-in slide-in-from-top-1 duration-300 w-full border border-blue-500/20
          ${isLeft ? "rounded-tl-none bg-blue-900/40" : "rounded-tr-none bg-blue-900/40"}`}>
          <span className="block opacity-60 text-[8px] font-bold mb-1 uppercase text-blue-300">Round 2</span>
          <p className="leading-snug">{messages[2]}</p>
        </div>
      )}
    </div>
  </div>
));

const LiarPlayRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { sendMessage, user } = useSocket(); // user 객체 추가 사용

  const gameData = location.state?.gameData;

  const [phase, setPhase] = useState(gameData?.phase || "WAITING");
  const [currentRound, setCurrentRound] = useState(gameData?.round || 1);
  const [playerOrder, setPlayerOrder] = useState<string[]>(gameData?.playerOrder || []);
  const [playerList, setPlayerList] = useState<any[]>(gameData?.playerList || []);
  const [roleInfo, setRoleInfo] = useState({ 
    role: gameData?.role || "준비 중", 
    category: gameData?.category || "-", 
    isLiar: gameData?.role?.includes("라이어") || false 
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    if (gameData?.endTime) {
      const remaining = Math.floor((gameData.endTime - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const [allRoundsData, setAllRoundsData] = useState<Record<number, Record<string, string>>>(gameData?.allRoundData || {});
  const [myInput, setMyInput] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [voteData, setVoteData] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null); // 🎯 내가 투표한 대상 저장
  const [gameOverData, setGameOverData] = useState<any>(null);

  const leftSide = playerOrder.filter((_, i) => i % 2 === 0);
  const rightSide = playerOrder.filter((_, i) => i % 2 !== 0);

  const updateGameState = useCallback((payload: any) => {
    if (!payload) return;
    if (payload.phase) setPhase(payload.phase);
    if (payload.round) setCurrentRound(payload.round);
    if (payload.playerOrder) setPlayerOrder(payload.playerOrder);
    if (payload.playerList) setPlayerList(payload.playerList);
    if (payload.role) {
      setRoleInfo({ role: payload.role, category: payload.category || "-", isLiar: payload.role.includes("라이어") });
    }
    if (payload.endTime) {
      const remaining = Math.floor((payload.endTime - Date.now()) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);
    }
    if (payload.phase === "EXPLAIN") {
      setHasSubmitted(false);
      setMyInput("");
      setMyVote(null); // 새 라운드나 단계 시작 시 투표 초기화
    }
  }, []);

  useEffect(() => {
    const handleAction = (e: any) => {
      const { actionType, payload } = e.detail;
      if (String(e.detail.roomId) !== String(roomId)) return;

      if (actionType === "PHASE_CHANGE") {
        updateGameState(payload);
        if (payload.phase === "SHOW_REVEAL") setAllRoundsData(prev => ({ ...prev, [payload.round]: payload.roundData }));
        if (payload.phase === "DISCUSSION") setAllRoundsData(payload.allRoundData);
      } else if (actionType === "VOTE_RESULT") {
        setVoteData(payload.status);
      } else if (actionType === "GAME_OVER") {
        setGameOverData(payload);
        setPhase("RESULT");
      }
    };

    window.addEventListener("ACTION", handleAction);
    const timer = setInterval(() => setTimeLeft(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => { window.removeEventListener("ACTION", handleAction); clearInterval(timer); };
  }, [roomId, updateGameState]);

  const handleVote = (target: string) => {
    if (phase !== "DISCUSSION" || target === user?.nickname) return; // 본인 투표 불가
    setMyVote(target);
    sendMessage({ type: "ACTION", actionType: "VOTE", roomId, payload: { target }, gameType: "LIAR" });
  };

  const submitDescription = () => {
    if (!myInput.trim() || hasSubmitted) return;
    sendMessage({ type: "CHAT", roomId, message: myInput, gameType: "LIAR" });
    setHasSubmitted(true);
  };

  return (
    <div className="h-screen bg-[#080808] text-white flex flex-col font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="h-20 flex items-center justify-between px-10 bg-zinc-900/80 border-b border-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${roleInfo.isLiar ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-blue-600'}`}>
            {roleInfo.isLiar ? <ShieldQuestion size={24} /> : <Fingerprint size={24} />}
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Round {currentRound} • {phase}</p>
            <h1 className="text-xl font-black italic">{roleInfo.role}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/50 px-6 py-2 rounded-2xl border border-white/10">
          <Timer size={20} className={timeLeft < 6 ? "text-red-500 animate-pulse" : "text-blue-400"} />
          <span className="text-2xl font-mono font-bold w-12 text-center">{timeLeft}s</span>
        </div>

        <button onClick={() => navigate("/rooms")} className="p-2 text-zinc-500 hover:text-red-500 transition-all"><LogOut /></button>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex justify-center items-center px-4 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-2 gap-x-16 gap-y-8 h-fit">
          
          {/* 좌측 플레이어 */}
          <div className="flex flex-col gap-8">
            {leftSide.map(nick => (
              <PlayerSection 
                key={nick} nick={nick} isLeft={true}
                isMe={nick === user?.nickname}
                isVoted={myVote === nick}
                avatarUrl={playerList.find(p => p.nickname === nick)?.avatar}
                phase={phase} 
                onVote={handleVote}
                voteCount={voteData[nick] || 0}
                messages={{ 1: allRoundsData[1]?.[nick], 2: allRoundsData[2]?.[nick] }}
              />
            ))}
          </div>

          {/* 우측 플레이어 */}
          <div className="flex flex-col gap-8">
            {rightSide.map(nick => (
              <PlayerSection 
                key={nick} nick={nick} isLeft={false}
                isMe={nick === user?.nickname}
                isVoted={myVote === nick}
                avatarUrl={playerList.find(p => p.nickname === nick)?.avatar}
                phase={phase} 
                onVote={handleVote}
                voteCount={voteData[nick] || 0}
                messages={{ 1: allRoundsData[1]?.[nick], 2: allRoundsData[2]?.[nick] }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-28 flex items-center justify-center bg-zinc-900/50 border-t border-white/5 px-10 backdrop-blur-xl">
        {phase === "EXPLAIN" ? (
          <div className="flex items-center gap-4 w-full max-w-2xl bg-white/5 p-2 rounded-3xl border border-white/10 focus-within:border-blue-500/50 transition-all">
            <input 
              disabled={hasSubmitted} value={myInput} onChange={(e)=>setMyInput(e.target.value)}
              onKeyDown={(e)=>e.key==='Enter' && submitDescription()}
              placeholder={hasSubmitted ? "다른 플레이어의 입력을 기다리는 중..." : "설명을 입력하세요..."}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-sm"
            />
            <button onClick={submitDescription} disabled={hasSubmitted} 
              className={`p-4 rounded-2xl transition-all ${hasSubmitted ? 'bg-zinc-800 text-zinc-600' : 'bg-blue-600 hover:bg-blue-500 shadow-lg'}`}>
              <Send size={20} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-1">{phase}</p>
            <p className="text-zinc-500 text-xs">
              {phase === "DISCUSSION" 
                ? (myVote ? `[${myVote}]님을 선택했습니다.` : "의심되는 유저를 선택하세요!") 
                : "정체가 공개되는 중입니다..."}
            </p>
          </div>
        )}
      </footer>

      {/* RESULT OVERLAY (기존과 동일) */}
      {phase === "RESULT" && gameOverData && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center animate-in fade-in duration-700">
          <div className="bg-zinc-900 p-12 rounded-[3rem] border border-white/10 text-center shadow-2xl scale-110">
            <Trophy size={80} className="text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
            <h2 className="text-6xl font-black mb-4 tracking-tighter italic uppercase text-white">
              {gameOverData.team === "시민" ? "Citizens Win" : "Liar Wins"}
            </h2>
            <p className="text-zinc-400 text-lg mb-10">라이어: <span className="text-red-500 font-black underline underline-offset-8">{gameOverData.liar}</span></p>
            <button onClick={() => navigate(`/waiting/${roomId}`)} className="px-12 py-4 bg-white text-black rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all">대기실로 돌아가기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiarPlayRoom;