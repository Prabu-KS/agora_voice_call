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

export const VoiceCalling = () => {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return (
    <AgoraRTCProvider client={client}>
      <Basics />
    </AgoraRTCProvider>
  );
};

const appId = import.meta.env.VITE_APP_AGORA_APP_ID;

const Basics = () => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [channel, setChannel] = useState("");
  const [micOn, setMic] = useState(true);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);

  useJoin({ appid: appId, channel: channel, token: null }, calling);
  usePublish([localMicrophoneTrack]);

  useEffect(() => {
    console.log("*************************************");
    console.log(
      localMicrophoneTrack?.setAudioFrameCallback((audioBuffer) => {
        // Get PCM data from the first channel
        const pcmData = audioBuffer.getChannelData(0);
        console.log("Raw PCM data:", pcmData);

        const ws = new WebSocket(
          "wss://xb8w8zh0-8000.inc1.devtunnels.ms/audiostream"
        );

        ws.onopen = () => {
          console.log("WebSocket connection established");
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ event: "media", media: { payload: pcmData } })
          );
        } else {
          console.warn("WebSocket is not open. PCM data not sent.");
        }
      })
    );
    console.log("*************************************");
  }, [localMicrophoneTrack]);

  const remoteUsers = useRemoteUsers();

  return (
    <>
      <div>
        {isConnected ? (
          <div>
            <div>
              <LocalUser
                audioTrack={localMicrophoneTrack}
                playAudio={false} // Plays the local user's audio track. You use this to test your mic before joining a channel.
                micOn={micOn}
              >
                <samp>You</samp>
              </LocalUser>
            </div>
            {remoteUsers.map((user) => (
              <div key={user.uid}>
                <RemoteUser user={user}>
                  <samp>{user.uid}</samp>
                </RemoteUser>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <input
              onChange={(e) => setChannel(e.target.value)}
              placeholder="<Your channel Name>"
              value={channel}
            />

            <button
              disabled={!appId || !channel}
              onClick={() => setCalling(true)}
            >
              <span>Join Channel</span>
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div style={{ padding: "20px" }}>
          <div>
            <button onClick={() => setMic((a) => !a)}>
              {micOn ? "Disable mic" : "Enable mic"}
            </button>
            <button onClick={() => setCalling((a) => !a)}>
              {calling ? "End calling" : "Start calling"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
