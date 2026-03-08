import { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Stethoscope, Shield, Skull, LogOut, Timer, Trophy } from "lucide-react";
import { useSocket } from "../../context/SocketContext";

const ROLE_CONFIG: Record<string, { icon: any; color: string; bgColor: string }> = {
  마피아: { icon: Skull, color: "text-red-500", bgColor: "bg-red-600" },
  시민: { icon: Shield, color: "text-blue-400", bgColor: "bg-blue-600" },
  의사: { icon: Stethoscope, color: "text-emerald-400", bgColor: "bg-emerald-600" },
  경찰: { icon: Shield, color: "text-amber-400", bgColor: "bg-amber-600" },
};

const PlayerCard = memo(({
  nick,
  avatarUrl,
  phase,
  onSelect,
  voteCount,
  isLeft,
  isMe,
  isSelected,
  isDead,
  isInvestigated,
}: any) => {
  const canSelect = (phase === "NIGHT" || phase === "VOTE") && !isMe && !isDead;

  return (
    <div className={`flex items-start gap-4 w-full ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      <div
        onClick={() => canSelect && onSelect(nick)}
        className={`relative w-24 h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all shadow-xl shrink-0
          ${isMe ? "border-yellow-500 bg-yellow-500/5" : isSelected ? "border-purple-500 bg-purple-500/10 scale-105" : "border-white/5 bg-zinc-900/80"}
          ${canSelect ? "cursor-pointer hover:border-purple-400 hover:scale-105" : ""}
          ${isDead ? "opacity-50 grayscale" : ""}`}
      >
        {isMe && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow-lg">
            YOU
          </div>
        )}
        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-10">
            <Skull className="w-10 h-10 text-red-500" />
          </div>
        )}
        {isInvestigated && !isDead && (
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-black z-10">
            ?
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

        {voteCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center animate-bounce ring-2 ring-black">
            {voteCount}
          </div>
        )}
      </div>
    </div>
  );
});

const MafiaPlayRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { sendMessage, user } = useSocket();

  const gameData = location.state?.gameData;

  const [phase, setPhase] = useState(gameData?.phase || "WAITING");
  const [dayNumber, setDayNumber] = useState(gameData?.dayNumber || 1);
  const [playerOrder, setPlayerOrder] = useState<string[]>(gameData?.playerOrder || []);
  const [playerList, setPlayerList] = useState<any[]>(gameData?.playerList || []);
  const [roleInfo, setRoleInfo] = useState({
    role: gameData?.role || "준비 중",
    isMafia: gameData?.role === "마피아",
  });
  const [deadPlayers, setDeadPlayers] = useState<Set<string>>(new Set(gameData?.deadPlayers || []));
  const [investigatedPlayers, setInvestigatedPlayers] = useState<Record<string, boolean>>(gameData?.investigatedPlayers || {});

  const [guideMessage, setGuideMessage] = useState(gameData?.message || "게임 준비 중...");
  const [nightSubPhase, setNightSubPhase] = useState<string>(gameData?.nightSubPhase || "");

  const [timeLeft, setTimeLeft] = useState(() => {
    if (gameData?.endTime) {
      const remaining = Math.floor((gameData.endTime - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const [myNightTarget, setMyNightTarget] = useState<string | null>(null);
  const [hasSubmittedNight, setHasSubmittedNight] = useState(false);
  const [voteData, setVoteData] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [gameOverData, setGameOverData] = useState<any>(null);
  const [lastDeath, setLastDeath] = useState<string | null>(null);

  const leftSide = playerOrder.filter((nick) => !deadPlayers.has(nick)).filter((_, i) => i % 2 === 0);
  const rightSide = playerOrder.filter((nick) => !deadPlayers.has(nick)).filter((_, i) => i % 2 !== 0);

  const roleConfig = ROLE_CONFIG[roleInfo.role] || ROLE_CONFIG["시민"];
  const RoleIcon = roleConfig.icon;

  const updateGameState = useCallback((payload: any) => {
    if (!payload) return;

    if (payload.phase) setPhase(payload.phase);
    if (payload.dayNumber) setDayNumber(payload.dayNumber);
    if (payload.playerOrder) setPlayerOrder(payload.playerOrder);
    if (payload.playerList) setPlayerList(payload.playerList);
    if (payload.message) setGuideMessage(payload.message);
    if (payload.nightSubPhase) setNightSubPhase(payload.nightSubPhase);

    if (payload.role) {
      setRoleInfo({ role: payload.role, isMafia: payload.role === "마피아" });
    }
    if (payload.deadPlayers) {
      setDeadPlayers(new Set(payload.deadPlayers));
    }
    if (payload.lastDeath) setLastDeath(payload.lastDeath);
    if (payload.investigatedPlayers) setInvestigatedPlayers(payload.investigatedPlayers);

    if (payload.endTime) {
      const remaining = Math.floor((payload.endTime - Date.now()) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);
    }
    if (payload.phase === "NIGHT") {
      setHasSubmittedNight(false);
      setMyNightTarget(null);
      setMyVote(null);
    }
    if (payload.phase === "VOTE" || payload.phase === "DAY") {
      setMyVote(null);
    }
  }, []);

  useEffect(() => {
    const handleAction = (e: any) => {
      const { actionType, payload } = e.detail;
      if (String(e.detail.roomId) !== String(roomId)) return;

      if (actionType === "PHASE_CHANGE") {
        updateGameState(payload);
      } else if (actionType === "VOTE_RESULT") {
        setVoteData(payload.status || payload.voteData || {});
      } else if (actionType === "GAME_OVER") {
        setGameOverData(payload);
        setPhase("RESULT");
      }
    };

    window.addEventListener("ACTION", handleAction);
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => {
      window.removeEventListener("ACTION", handleAction);
      clearInterval(timer);
    };
  }, [roomId, updateGameState]);

  const needsMyNightAction = () => {
    if (phase !== "NIGHT" || hasSubmittedNight) return false;
    if (roleInfo.role === "마피아" && (nightSubPhase === "마피아" || !nightSubPhase)) return true;
    if (roleInfo.role === "의사" && (nightSubPhase === "의사" || !nightSubPhase)) return true;
    if (roleInfo.role === "경찰" && (nightSubPhase === "경찰" || !nightSubPhase)) return true;
    return false;
  };

  const handleNightTargetSelect = (target: string) => {
    if (!needsMyNightAction() || deadPlayers.has(target)) return;
    setMyNightTarget(target);
  };

  const submitNightAction = () => {
    if (!myNightTarget || hasSubmittedNight) return;
    const actionType =
      roleInfo.role === "마피아" ? "KILL_TARGET" : roleInfo.role === "의사" ? "HEAL_TARGET" : "INVESTIGATE_TARGET";
    sendMessage({
      type: "ACTION",
      actionType,
      roomId,
      payload: { target: myNightTarget },
      gameType: "MAFIA",
    });
    setHasSubmittedNight(true);
  };

  const handleVote = (target: string) => {
    if (phase !== "VOTE" || target === user?.nickname || deadPlayers.has(target)) return;
    setMyVote(target);
    sendMessage({ type: "ACTION", actionType: "VOTE", roomId, payload: { target }, gameType: "MAFIA" });
  };

  return (
    <div className="h-screen bg-[#080808] text-white flex flex-col font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-20 flex items-center justify-between px-10 bg-zinc-900/80 border-b border-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${roleConfig.bgColor} shadow-lg`}>
            <RoleIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">
              {phase === "STARTING" ? "준비 단계" : `Day ${dayNumber} • ${phase === "NIGHT" ? "밤" : phase === "DAY" ? "낮" : phase}`}
            </p>
            <h1 className="text-xl font-black italic">{roleInfo.role}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/50 px-6 py-2 rounded-2xl border border-white/10">
          <Timer size={20} className={timeLeft < 6 ? "text-red-500 animate-pulse" : "text-blue-400"} />
          <span className="text-2xl font-mono font-bold w-12 text-center">{timeLeft}s</span>
        </div>

        <button onClick={() => navigate("/rooms")} className="p-2 text-zinc-500 hover:text-red-500 transition-all">
          <LogOut />
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex justify-center items-center px-4 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-2 gap-x-16 gap-y-8 h-fit">
          <div className="flex flex-col gap-8">
            {leftSide.map((nick) => (
              <PlayerCard
                key={nick}
                nick={nick}
                isLeft={true}
                isMe={nick === user?.nickname}
                isSelected={myNightTarget === nick || myVote === nick}
                avatarUrl={playerList.find((p) => p.nickname === nick)?.avatar}
                phase={phase}
                onSelect={needsMyNightAction() ? handleNightTargetSelect : handleVote}
                voteCount={voteData[nick] || 0}
                isDead={deadPlayers.has(nick)}
                isInvestigated={investigatedPlayers[nick]}
              />
            ))}
          </div>
          <div className="flex flex-col gap-8">
            {rightSide.map((nick) => (
              <PlayerCard
                key={nick}
                nick={nick}
                isLeft={false}
                isMe={nick === user?.nickname}
                isSelected={myNightTarget === nick || myVote === nick}
                avatarUrl={playerList.find((p) => p.nickname === nick)?.avatar}
                phase={phase}
                onSelect={needsMyNightAction() ? handleNightTargetSelect : handleVote}
                voteCount={voteData[nick] || 0}
                isDead={deadPlayers.has(nick)}
                isInvestigated={investigatedPlayers[nick]}
              />
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-28 flex items-center justify-center bg-zinc-900/50 border-t border-white/5 px-10 backdrop-blur-xl z-10">
        {phase === "NIGHT" && needsMyNightAction() ? (
          <div className="flex flex-col items-center w-full max-w-2xl gap-2">
            <p className="text-purple-400 text-xs font-bold animate-pulse">
              {roleInfo.role}님, {roleInfo.role === "마피아" ? "제거할 대상을 선택하세요" : roleInfo.role === "의사" ? "치료할 대상을 선택하세요" : "조사할 대상을 선택하세요"}
            </p>
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={submitNightAction}
                disabled={!myNightTarget || hasSubmittedNight}
                className={`flex-1 py-4 rounded-2xl font-black transition-all ${
                  myNightTarget && !hasSubmittedNight
                    ? "bg-purple-600 hover:bg-purple-500 shadow-lg"
                    : "bg-zinc-800 text-zinc-600"
                }`}
              >
                {hasSubmittedNight ? "선택 완료" : myNightTarget ? `[${myNightTarget}] 선택 확정` : "대상 선택"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-in slide-in-from-bottom-2 fade-in duration-500">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-2">{phase}</p>
            <p className="text-white text-lg font-bold">{guideMessage}</p>
            {lastDeath && (phase === "DAY" || phase === "VOTE") && (
              <p className="text-red-400 text-xs mt-2 font-bold">💀 {lastDeath}님이 밤에 사망했습니다.</p>
            )}
            {phase === "VOTE" && myVote && (
              <p className="text-emerald-400 text-xs mt-2 font-bold">[{myVote}]님을 지목했습니다.</p>
            )}
          </div>
        )}
      </footer>

      {/* RESULT OVERLAY */}
      {phase === "RESULT" && gameOverData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500 p-4">
          <div className="bg-zinc-900/95 p-8 md:p-12 rounded-[3rem] border border-white/10 text-center shadow-2xl animate-in zoom-in-95 duration-500 max-w-2xl w-full">
            <Trophy size={80} className="text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
            <h2 className="text-5xl md:text-6xl font-black mb-3 tracking-tighter italic uppercase text-white">
              {gameOverData.team === "시민" ? "Citizens Win" : "Mafia Wins"}
            </h2>

            <p className="text-zinc-400 text-sm md:text-base mb-8">
              {gameOverData.mafiaList?.length > 0 && (
                <>
                  마피아: <span className="text-red-500 font-black">{gameOverData.mafiaList.join(", ")}</span>
                </>
              )}
            </p>

            <div className="bg-white/5 rounded-3xl p-6 mb-10 border border-white/5 shadow-inner">
              <h3 className="text-yellow-500 font-black text-xs tracking-[0.3em] mb-6 uppercase">Winning Team</h3>
              <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                {gameOverData.winners?.map((winnerNick: string) => {
                  const avatar = playerList.find((p) => p.nickname === winnerNick)?.avatar;
                  const isMafia = gameOverData.mafiaList?.includes(winnerNick);

                  return (
                    <div
                      key={winnerNick}
                      className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700"
                    >
                      <div
                        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 overflow-hidden shadow-lg ${
                          isMafia ? "border-red-500 bg-red-500/20" : "border-blue-500 bg-blue-500/20"
                        }`}
                      >
                        <img
                          src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winnerNick}`}
                          alt={winnerNick}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className={`font-black text-sm md:text-base ${isMafia ? "text-red-400" : "text-blue-300"}`}>
                        {winnerNick}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => navigate(`/waiting/${roomId}`)}
              className="px-12 py-4 bg-white text-black rounded-2xl font-black hover:bg-purple-500 hover:text-white transition-all transform active:scale-95 shadow-xl w-full md:w-auto"
            >
              대기실로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MafiaPlayRoom;
