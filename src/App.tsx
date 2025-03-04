import { IconPhoneCalling } from "@tabler/icons-react";
import { VoiceCalling } from "./VoiceCalling";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-gray-100 flex flex-col">
      <header className="py-6 px-8 bg-slate-800/60 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <IconPhoneCalling className="text-indigo-400" size={28} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              CAG
            </span>
          </h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl p-8">
          <VoiceCalling />
        </div>
      </main>

      <footer className="py-4 px-8 text-center text-sm text-gray-400 bg-slate-800/40 backdrop-blur-md border-t border-slate-700/50">
        <p>
          © {new Date().getFullYear()} CAG. All rights reserved. |{" "}
          <a href="#" className="text-indigo-400 hover:text-indigo-300">
            Privacy Policy
          </a>{" "}
          |{" "}
          <a href="#" className="text-indigo-400 hover:text-indigo-300">
            Terms of Service
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
