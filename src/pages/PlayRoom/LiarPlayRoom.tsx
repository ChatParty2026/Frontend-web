import { useState, useEffect, useCallback, memo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ShieldQuestion, Fingerprint, LogOut, Timer, Vote, Trophy, Users } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import GameChat from "../../components/atoms/GameChat";

// 🎯 플레이어 카드: 이제 해당 유저의 실제 프사(avatarUrl)를 받아서 렌더링합니다.
const PlayerCard = memo(({ nick, avatarUrl, isMe, isCurrentTurn, phase, onVote, voteCount }: any) => {
  return (
    <div 
      onClick={() => onVote(nick)} 
      className={`group relative flex items-center justify-between p-5 rounded-3xl border-2 transition-all duration-300 
        ${isCurrentTurn ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.15)]' : 'border-white/5 bg-white/[0.03] hover:border-white/20'} 
        ${phase === "DISCUSSION" ? "cursor-pointer hover:scale-[1.02] active:scale-95" : "cursor-default"}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 ${isCurrentTurn ? 'border-blue-500' : 'border-zinc-700'}`}>
          <img 
            src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nick}`} 
            className="w-full h-full object-cover" 
            alt={nick}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${nick}`; }}
          />
        </div>
        <div>
          <p className="text-base font-black truncate w-36 tracking-tight">{nick}</p>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
            {isMe ? "Me (Agent)" : "Player"}
          </p>
        </div>
      </div>
      {voteCount > 0 && (
        <div className="flex items-center justify-center bg-red-600 text-white text-xs font-black w-8 h-8 rounded-full animate-in zoom-in ring-4 ring-black shadow-lg">
          {voteCount}
        </div>
      )}
    </div>
  );
});

const LiarPlayRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { sendMessage, user } = useSocket();

  const gameInitData = location.state?.gameData;

  const getRemainingTime = useCallback((endTime: number) => {
    if (!endTime) return 0;
    const diff = Math.floor((endTime - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }, []);

  // 🎯 상태 관리: 서버에서 준 전체 플레이어 상세 정보(닉네임, 아바타 포함)
  const [playerList, setPlayerList] = useState<any[]>(gameInitData?.playerList || []);
  const [playerOrder] = useState<string[]>(gameInitData?.playerOrder || []);
  const [currentTurn, setCurrentTurn] = useState(gameInitData?.currentTurn || "");
  const [phase, setPhase] = useState(gameInitData?.phase || "INGAME");
  const [timeLeft, setTimeLeft] = useState(() => getRemainingTime(gameInitData?.endTime));
  
  const [roleInfo] = useState({
    role: gameInitData?.role || "정보 없음",
    category: gameInitData?.category || "선택 안됨",
    isLiar: gameInitData?.role?.includes("라이어") || false
  });

  const [messages, setMessages] = useState<any[]>([]);
  const [voteData, setVoteData] = useState<Record<string, number>>({});
  const [gameOverData, setGameOverData] = useState<any>(null);

  const handleIncomingAction = useCallback((e: any) => {
    const { actionType, payload, roomId: incomingRoomId } = e.detail;
    if (String(incomingRoomId) !== String(roomId)) return;

    switch (actionType) {
      case "PHASE_CHANGE":
        if (payload.phase) setPhase(payload.phase);
        if (payload.currentTurn) setCurrentTurn(payload.currentTurn);
        if (payload.endTime) setTimeLeft(getRemainingTime(payload.endTime));
        // 🎯 서버가 넘겨준 최신 플레이어 리스트(아바타 포함) 동기화
        if (payload.playerList) setPlayerList(payload.playerList);
        break;
      case "TIME_SYNC":
        if (payload.currentTurn) setCurrentTurn(payload.currentTurn);
        if (payload.endTime) setTimeLeft(getRemainingTime(payload.endTime));
        break;
      case "VOTE_RESULT":
        if (payload.status) setVoteData({ ...payload.status });
        break;
      case "GAME_OVER":
        setGameOverData(payload);
        setPhase("RESULT");
        break;
    }
  }, [roomId, getRemainingTime]);

  const handleIncomingChat = useCallback((e: any) => {
    if (String(e.detail.roomId) === String(roomId)) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          author: e.detail.sender,
          // 🎯 서버에서 보낸 프사가 없으면 playerList에서 찾아서 꽂음
          avatar: e.detail.avatar || playerList.find(p => p.nickname === e.detail.sender)?.avatar,
          message: e.detail.message,
          isSystem: e.detail.sender === "SYSTEM",
          timestamp: Date.now()
        }
      ].slice(-200));
    }
  }, [roomId, playerList]);

  useEffect(() => {
    window.addEventListener("ACTION", handleIncomingAction);
    window.addEventListener("NEW_CHAT", handleIncomingChat);
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => {
      window.removeEventListener("ACTION", handleIncomingAction);
      window.removeEventListener("NEW_CHAT", handleIncomingChat);
      clearInterval(timer);
    };
  }, [handleIncomingAction, handleIncomingChat]);

  const handleExit = useCallback((withConfirm = true) => {
    if (withConfirm && !window.confirm("정말 방을 나가시겠습니까?")) return;
    sendMessage({ type: "LEAVE", roomId, gameType: "LIAR" });
    navigate("/rooms");
  }, [roomId, sendMessage, navigate]);

  const onVote = useCallback((target: string) => {
    if (phase !== "DISCUSSION") return;
    sendMessage({ type: "ACTION", gameType: "LIAR", actionType: "VOTE", roomId, payload: { target } });
  }, [phase, roomId, sendMessage]);

  return (
    <div className={`h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden transition-all duration-700 ${roleInfo.isLiar ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]' : 'shadow-[inset_0_0_100px_rgba(59,130,246,0.1)]'}`}>
      
      {/* 🏆 결과 화면 */}
      {phase === "RESULT" && gameOverData && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
          <Trophy size={100} className={gameOverData.team === "시민" ? "text-blue-500" : "text-red-500"} />
          <h2 className={`text-7xl font-black italic mt-4 uppercase ${gameOverData.team === "시민" ? "text-blue-500" : "text-red-500"}`}>
            {gameOverData.team} WIN
          </h2>
          <div className="mt-8 p-8 bg-white/5 rounded-[3rem] border border-white/10 text-center min-w-[500px]">
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {gameOverData.winners?.map((name: string) => (
                <div key={name} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20">
                    <img 
                      src={playerList.find(p => p.nickname === name)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
                      className="w-full h-full object-cover" 
                      alt={name}
                    />
                  </div>
                  <span className="text-sm font-bold">{name}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(`/waiting/${roomId}`)} className="px-10 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-all">WAITING ROOM</button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="h-20 flex items-center justify-between px-8 bg-gradient-to-b from-black/80 to-transparent relative z-10">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-2xl ${roleInfo.isLiar ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'} shadow-xl`}>
            {roleInfo.isLiar ? <ShieldQuestion size={32} /> : <Fingerprint size={32} />}
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Mission Role</p>
            <h1 className={`text-3xl font-black italic tracking-tighter ${roleInfo.isLiar ? 'text-red-500' : 'text-blue-500'}`}>{roleInfo.role}</h1>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-5 bg-zinc-900/90 backdrop-blur-xl px-10 py-4 rounded-full border border-white/10">
           <Timer size={22} className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-blue-400"} />
           <span className={`text-3xl font-black tabular-nums ${timeLeft <= 5 ? "text-red-500" : "text-white"}`}>{timeLeft}s</span>
        </div>
        <button onClick={() => handleExit(true)} className="flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-all font-black uppercase text-xs">
          <span>Leave Room</span>
          <LogOut size={22} />
        </button>
      </header>

      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        {/* 플레이어 목록 사이드바 */}
        <aside className="w-80 flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {playerOrder.map((nick) => {
              // 🎯 playerList에서 해당 유저의 프사를 찾아서 넘겨줍니다.
              const pData = playerList.find(p => p.nickname === nick);
              return (
                <PlayerCard 
                  key={nick} 
                  nick={nick} 
                  avatarUrl={pData?.avatar} 
                  isMe={user?.nickname === nick}
                  isCurrentTurn={currentTurn === nick}
                  phase={phase}
                  onVote={onVote}
                  voteCount={voteData[nick] || 0}
                />
              );
            })}
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-white/[0.02] rounded-[3rem] border border-white/5 overflow-hidden relative">
          <GameChat 
            messages={messages} 
            currentTurn={currentTurn} 
            myNickname={user?.nickname || ""} 
            onSendMessage={(msg) => sendMessage({ 
                type: "CHAT", 
                roomId, 
                message: msg, 
                gameType: "LIAR",
                avatar: user?.avatar // 🎯 내 프사를 실어서 보냅니다.
            })} 
            isVotePhase={phase === "DISCUSSION"} 
          />
        </section>
      </main>

      <footer className="h-14 bg-black/40 flex items-center justify-center border-t border-white/5 backdrop-blur-sm">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">
          Category <span className="text-zinc-200 text-sm italic font-serif lowercase mx-4">"{roleInfo.category}"</span>
        </p>
      </footer>
    </div>
  );
};

export default LiarPlayRoom;