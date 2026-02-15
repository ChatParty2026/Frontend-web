import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Users, Lock, PlayCircle, Filter } from "lucide-react";
import CreateRoomModal from "../components/rooms/CreateRoomModal";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

// 서버 방 정보 인터페이스 정의
interface Room {
  roomId: string;
  title: string;
  gameType: "MAFIA" | "LIAR" | "JUST_CHAT";
  count: number;
  maxCount: number;
  hasPassword: boolean;
  status: "대기 중" | "게임 중";
}

type GameTypeFilter = "전체" | "MAFIA" | "LIAR" | "JUST_CHAT";

const GameRoomsView = () => {
  const navigate = useNavigate();
  const { socket, user } = useSocket();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("전체");
  const [gameTypeTab, setGameTypeTab] = useState<GameTypeFilter>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);

  // 실시간 소켓 리스너 등록
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

  // 필터링 로직
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

  // 방 클릭 시 이동 핸들러
  const handleJoinRoom = (room: Room) => {
    if (room.gameType === "JUST_CHAT") {
      navigate(`/chat/${room.roomId}`);
    } else {
      navigate(`/waiting/${room.roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 relative overflow-hidden font-sans">
      <div className="container mx-auto max-w-[1600px] relative z-10">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            {/* 상단 컨트롤 영역 (제목, 필터, 검색, 버튼) */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
              <div className="space-y-6 w-full md:w-auto">
                <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase">
                  Game Lobby
                </h1>

                <div className="flex flex-col gap-4">
                  {/* 상태 탭 */}
                  <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit">
                    {["전체", "대기중", "플레이중"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusTab(tab)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          statusTab === tab
                            ? "bg-white/10 text-white shadow-lg"
                            : "text-gray-500 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* 게임 타입 필터 */}
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
                            {type}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 검색 및 방 만들기 */}
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

            {/* 메인 방 목록 그리드 */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                // 로딩 중: Skeleton UI
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-6 animate-pulse"
                  >
                    <div className="w-20 h-6 bg-white/5 rounded-full mb-6" />
                    <div className="w-3/4 h-8 bg-white/5 rounded-lg mb-4" />
                    <div className="w-1/2 h-4 bg-white/5 rounded-lg mb-8" />
                    <div className="flex justify-between pt-6 border-t border-white/5 mt-auto">
                      <div className="w-16 h-4 bg-white/5 rounded" />
                      <div className="w-12 h-4 bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredRooms.length > 0 ? (
                // 데이터 있음: 실제 방 카드
                filteredRooms.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => handleJoinRoom(room)}
                    className="group relative bg-[#121212] border border-white/5 rounded-[2.5rem] p-6 hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden shadow-2xl flex flex-col h-full active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          room.status === "대기 중"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                        }`}
                      >
                        {room.status === "대기 중" ? "WAITING" : "PLAYING"}
                      </span>
                      {room.hasPassword && (
                        <Lock className="w-4 h-4 text-gray-600" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors line-clamp-2 min-h-[3.5rem]">
                      {room.title}
                    </h3>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {room.count} / {room.maxCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase italic px-2 py-0.5 rounded border border-white/10 ${
                            room.gameType === "MAFIA"
                              ? "text-red-500"
                              : room.gameType === "LIAR"
                                ? "text-blue-400"
                                : "text-purple-400"
                          }`}
                        >
                          {room.gameType}
                        </span>
                        <PlayCircle className="w-6 h-6 text-purple-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // 결과 없음
                <div className="col-span-full text-center py-32 bg-white/2 border border-dashed border-white/10 rounded-[3rem]">
                  <p className="text-gray-600 font-bold italic text-xl uppercase tracking-widest">
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
