import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Users,
  Lock,
  PlayCircle,
  Filter,
  Crown,
} from "lucide-react";
import CreateRoomModal from "../components/rooms/CreateRoomModal";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

interface Room {
  roomId: string;
  title: string;
  gameType: "MAFIA" | "LIAR" | "JUST_CHAT";
  count: number;
  maxCount: number;
  hasPassword: boolean;
  status: "대기 중" | "게임 중";
  hostName: string;
}

type GameTypeFilter = "전체" | "MAFIA" | "LIAR" | "JUST_CHAT";

const GameRoomsView = () => {
  const navigate = useNavigate();
  const { socket, user, isConnected, sendMessage } = useSocket();

  const hasJoined = useRef(false);

  // 로비 진입 시 로비 채널 JOIN (중복 방지)
  useEffect(() => {
    if (isConnected && socket && user) {
      if (hasJoined.current) return;

      hasJoined.current = true;
      sendMessage({
        type: "JOIN",
        gameType: "MAIN",
        roomId: "main",
        sender: user.nickname,
      });
    }
  }, [isConnected, socket, user, sendMessage]);

  // ✅ [추가] 방 입장 성공 시 페이지 이동 리스너
  // 서버에서 SUCCESS 응답이 온 후 캐시가 업데이트되면 이동합니다.
  useEffect(() => {
    const handleJoinSuccess = (e: any) => {
      const { roomId, gameType } = e.detail;
      // 로비(main) 조인은 무시하고 실제 게임방 조인일 때만 이동
      if (roomId === "main") return;

      if (gameType === "JUST_CHAT") {
        navigate(`/chat/${roomId}`);
      } else {
        navigate(`/waiting/${roomId}`);
      }
    };

    window.addEventListener("JOIN_SUCCESS", handleJoinSuccess);
    return () => window.removeEventListener("JOIN_SUCCESS", handleJoinSuccess);
  }, [navigate]);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("전체");
  const [gameTypeTab, setGameTypeTab] = useState<GameTypeFilter>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);

  const GAME_TYPE_LABEL: Record<GameTypeFilter, string> = {
    전체: "전체",
    MAFIA: "마피아",
    LIAR: "라이어",
    JUST_CHAT: "잡담",
  };

  // 소켓 메시지 수신 리스너 (방 목록 업데이트)
  useEffect(() => {
    if (!socket) return;

    const handleRoomListUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ROOM_LIST_UPDATE") {
          setRooms(data.payload.rooms);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("데이터 파싱 에러:", error);
      }
    };

    socket.addEventListener("message", handleRoomListUpdate);
    return () => socket.removeEventListener("message", handleRoomListUpdate);
  }, [socket]);

  useEffect(() => {
    if (!sessionStorage.getItem("isPlaying")) {
      sessionStorage.setItem("isPlaying", "true");
    }
  }, []);

  // 방 목록 필터링 로직
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesStatus =
        statusTab === "전체" ||
        (statusTab === "대기중" && room.status === "대기 중") ||
        (statusTab === "플레이중" && room.status === "게임 중");

      const matchesGameType =
        gameTypeTab === "전체" || room.gameType === gameTypeTab;

      const matchesSearch = room.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesStatus && matchesGameType && matchesSearch;
    });
  }, [rooms, statusTab, gameTypeTab, searchQuery]);

  // ✅ [수정] 이동 로직을 제거하고 메시지만 전송
  const handleJoinRoom = (room: Room) => {
    if (!user || !isConnected) return;

    sendMessage({
      type: "JOIN",
      gameType: room.gameType,
      roomId: room.roomId,
      sender: user.nickname,
    });

    // 이제 이동은 위쪽의 JOIN_SUCCESS 리스너가 담당합니다.
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6 relative overflow-hidden font-sans">
      <div className="container mx-auto max-w-[1700px] relative z-10">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            {/* 헤더 섹션 유지 */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
              <div className="space-y-4 w-full md:w-auto">
                <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase">
                  Game Lobby
                </h1>
                {/* 필터 탭 부분 */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                    {["전체", "대기중", "플레이중"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusTab(tab)}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          statusTab === tab
                            ? "bg-white/10 text-white shadow-lg"
                            : "text-gray-500 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-purple-500" />
                    <div className="flex gap-2">
                      {(["전체", "MAFIA", "LIAR", "JUST_CHAT"] as const).map(
                        (type) => (
                          <button
                            key={type}
                            onClick={() => setGameTypeTab(type)}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                              gameTypeTab === type
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "bg-transparent border-white/10 text-gray-500 hover:border-white/20"
                            }`}
                          >
                            {GAME_TYPE_LABEL[type]}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="방 제목 검색..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all outline-none text-white"
                  />
                </div>

                <button
                  onClick={() => setIsCreateRoomModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-4 bg-white text-black rounded-2xl font-black hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0 cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>방 만들기</span>
                </button>
              </div>
            </div>

            {/* 그리드 레이아웃 수정: xl에서 5열로 변경 */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-[#121212] border border-white/5 rounded-[2rem] p-5 animate-pulse h-[200px]"
                  >
                    <div className="w-16 h-5 bg-white/5 rounded-full mb-4" />
                    <div className="w-3/4 h-6 bg-white/5 rounded-lg mb-3" />
                    <div className="w-1/2 h-4 bg-white/5 rounded-lg mb-6" />
                    <div className="flex justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="w-12 h-3 bg-white/5 rounded" />
                      <div className="w-10 h-3 bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => handleJoinRoom(room)}
                    className="group relative bg-[#121212] border border-white/5 rounded-[2rem] p-5 hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden shadow-2xl flex flex-col h-full active:scale-[0.97]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          room.status === "대기 중"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                        }`}
                      >
                        {room.status === "대기 중" ? "WAITING" : "PLAYING"}
                      </span>
                      {room.hasPassword && (
                        <Lock className="w-3.5 h-3.5 text-gray-600" />
                      )}
                    </div>

                    <div className="space-y-1 mb-2">
                      <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors line-clamp-1 leading-tight">
                        {room.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-gray-400 transition-colors">
                        <Crown className="w-3 h-3 text-yellow-500/70" />
                        <span className="text-[10px] font-medium truncate">
                          {room.hostName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">
                          {room.count}/{room.maxCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase italic px-1.5 py-0.5 rounded border border-white/5 ${
                            room.gameType === "MAFIA"
                              ? "text-red-500"
                              : room.gameType === "LIAR"
                                ? "text-blue-400"
                                : "text-purple-400"
                          }`}
                        >
                          {GAME_TYPE_LABEL[room.gameType]}
                        </span>
                        <PlayCircle className="w-5 h-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-24 bg-white/2 border border-dashed border-white/10 rounded-[2.5rem]">
                  <p className="text-gray-600 font-bold italic text-lg uppercase tracking-widest">
                    No Rooms Found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
        currentUser={user?.nickname ?? "익명"}
      />
    </div>
  );
};

export default GameRoomsView;
