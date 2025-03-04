import { useEffect, useState } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneCall,
  IconPhoneEnd,
} from "@tabler/icons-react";

export const VoiceCalling = () => {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return (
    <AgoraRTCProvider client={client}>
      <div className="max-w-md mx-auto p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900 to-purple-900 h-full flex flex-col">
        <h1 className="text-3xl font-extrabold text-center mb-8">
          Voice Connect
        </h1>
        <div className="flex-grow">
          <Basics />
        </div>
        <div className="mt-6 text-center text-sm text-indigo-300">
          Powered by Agora RTC
        </div>
      </div>
    </AgoraRTCProvider>
  );
};

const appId = import.meta.env.VITE_APP_AGORA_APP_ID;

const Basics = () => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [channel, setChannel] = useState("");
  const [micOn, setMic] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);

  useJoin({ appid: appId, channel: channel, token: null }, calling);
  usePublish([localMicrophoneTrack]);

  useEffect(() => {
    setWs(new WebSocket("wss://xb8w8zh0-8000.inc1.devtunnels.ms/audiostream"));
  }, []);

  useEffect(() => {
    console.log("*************************************");
    console.log(
      localMicrophoneTrack?.setAudioFrameCallback((audioBuffer) => {
        // Get PCM data from the first channel
        const pcmData = audioBuffer.getChannelData(0);
        console.log("Raw PCM data:", pcmData);
        console.log("WebSocket state:", ws?.readyState);

        if (!ws) return;
        ws.onopen = () => {
          console.log("WebSocket connection established");
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onmessage = (event) => {
          console.log("---------------------------------------------");
          console.log("Received WebSocket response:", event.data);
          console.log("---------------------------------------------");
        };

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(pcmData);
        } else {
          console.warn("WebSocket is not open. PCM data not sent.");
        }
      })
    );
    console.log("*************************************");
  }, [localMicrophoneTrack]);

  const remoteUsers = useRemoteUsers();

  return (
    <div className="flex flex-col space-y-6">
      {isConnected ? (
        <div className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-white">Your Audio</h2>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="relative bg-slate-600/50 p-4 rounded-lg flex items-center">
              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mr-3">
                {channel.charAt(0).toUpperCase() || "Y"}
              </div>
              <LocalUser
                audioTrack={localMicrophoneTrack}
                playAudio={false}
                micOn={micOn}
              >
                <div className="text-white font-medium">You</div>
                <div className="text-gray-300 text-sm">Channel: {channel}</div>
              </LocalUser>
            </div>
          </div>

          {remoteUsers.length > 0 && (
            <div className="bg-slate-700/50 p-4 rounded-lg shadow-inner">
              <h2 className="text-lg font-medium text-white mb-3">
                Remote Users
              </h2>
              <div className="space-y-3">
                {remoteUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="bg-slate-600/50 p-4 rounded-lg flex items-center"
                  >
                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl mr-3">
                      {user.uid.toString().charAt(0)}
                    </div>
                    <RemoteUser user={user}>
                      <div className="text-white font-medium">
                        User {user.uid}
                      </div>
                      <div className="text-gray-300 text-sm">Connected</div>
                    </RemoteUser>
                    <div className="ml-auto h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={() => setMic((prev) => !prev)}
              className={`flex items-center justify-center h-14 w-14 rounded-full cursor-pointer ${
                micOn
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-red-600 hover:bg-red-700"
              } transition-colors duration-200 shadow-lg`}
            >
              {micOn ? (
                <IconMicrophone className="h-6 w-6 text-white" />
              ) : (
                <IconMicrophoneOff className="h-6 w-6 text-white" />
              )}
            </button>
            <button
              onClick={() => setCalling(false)}
              className="flex items-center justify-center h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-200 shadow-lg cursor-pointer"
            >
              <IconPhoneEnd className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6 py-10">
          <div className="w-full max-w-xs">
            <label
              htmlFor="channel"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Channel Name
            </label>
            <input
              id="channel"
              type="text"
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Enter channel name"
              value={channel}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400 transition duration-200"
            />
          </div>

          <button
            disabled={!appId || !channel}
            onClick={() => setCalling(true)}
            className={`flex items-center justify-center px-6 py-3 rounded-lg ${
              !appId || !channel
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
            } transition-colors duration-200 text-white font-medium shadow-lg`}
          >
            <IconPhoneCall className="h-5 w-5 mr-2" />
            <span>Join Channel</span>
          </button>

          {!appId && (
            <p className="text-red-400 text-sm text-center">
              App ID is missing. Please check your environment variables.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
