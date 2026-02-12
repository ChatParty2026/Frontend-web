import { useState, useMemo } from "react";
import { Plus, Search, Users, Lock, PlayCircle } from "lucide-react";

interface Room {
  id: number;
  title: string;
  host: string;
  playerCount: number;
  maxPlayers: number;
  status: "WAITING" | "PLAYING";
  isPrivate: boolean;
  gameType: "마피아" | "라이어";
}

const MOCK_ROOMS: Room[] = [
  {
    id: 1,
    title: "마피아 고수만 오세요 (마이크 필수)",
    host: "김채티",
    playerCount: 4,
    maxPlayers: 8,
    status: "WAITING",
    isPrivate: false,
    gameType: "마피아",
  },
  {
    id: 2,
    title: "라이어 게임 초보 환영!",
    host: "개발왕",
    playerCount: 6,
    maxPlayers: 6,
    status: "PLAYING",
    isPrivate: true,
    gameType: "라이어",
  },
  {
    id: 3,
    title: "밤새도록 마피아 하실 분?",
    host: "리액트장인",
    playerCount: 5,
    maxPlayers: 10,
    status: "WAITING",
    isPrivate: false,
    gameType: "마피아",
  },
  {
    id: 4,
    title: "[속보] 라이어 검거 완료",
    host: "지니어스",
    playerCount: 3,
    maxPlayers: 5,
    status: "WAITING",
    isPrivate: false,
    gameType: "라이어",
  },
];

const GameRoomsView = () => {
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링 로직
  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter((room) => {
      const matchesTab =
        activeTab === "전체" ||
        (activeTab === "대기중" && room.status === "WAITING") ||
        (activeTab === "플레이중" && room.status === "PLAYING");

      const matchesSearch = room.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="container mx-auto max-w-6xl">
        {/* 상단 헤더 및 필터 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="space-y-4 w-full md:w-auto">
            <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase">
              Game Lobby
            </h1>

            {/* 탭 메뉴 */}
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit">
              {["전체", "대기중", "플레이중"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* 검색바 */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="방 제목 검색..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all outline-none"
              />
            </div>

            {/* 방 만들기 버튼 */}
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0">
              <Plus className="w-5 h-5" />
              <span>방 만들기</span>
            </button>
          </div>
        </div>

        {/* 방 목록 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="group relative bg-[#121212] border border-white/5 rounded-[2rem] p-6 hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    room.status === "WAITING"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                  }`}
                >
                  {room.status}
                </span>
                {room.isPrivate && <Lock className="w-4 h-4 text-gray-600" />}
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                {room.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">
                방장: {room.host}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {room.playerCount} / {room.maxPlayers}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase italic px-2 py-0.5 rounded ${
                      room.gameType === "마피아"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  >
                    {room.gameType}
                  </span>
                  <PlayCircle className="w-6 h-6 text-purple-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                </div>
              </div>

              {/* 네온 효과 */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
          ))}
        </div>

        {/* 결과가 없을 때 */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-600 font-bold italic text-xl uppercase tracking-widest">
              No Rooms Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoomsView;
