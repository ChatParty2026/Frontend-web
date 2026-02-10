import Home from "./pages/Home";
import { useAuthInit } from "./hooks/useAuthInit";

const App = () => {
  const { user, isLoading } = useAuthInit();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white font-bold italic tracking-tighter">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          LOADING PARTY...
        </div>
      </div>
    );
  }

  return <Home />;
};

export default App;
