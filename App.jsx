import { useState } from "react";

function App() {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");
  const [recorder, setRecorder] = useState(null);
  const [status, setStatus] = useState("Click start and speak 🎙️");

  const startRecording = async () => {
    setText("");
    setStatus("Recording... Speak now 🗣️");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      setStatus("Processing audio ⏳");

      const audioBlob = new Blob(chunks, { type: "audio/webm" });

      const response = await fetch(
        "https://api.deepgram.com/v1/listen?punctuate=true",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
            "Content-Type": "audio/webm",
          },
          body: audioBlob,
        }
      );

      const data = await response.json();
      const transcript =
        data?.results?.channels[0]?.alternatives[0]?.transcript;

      setText(transcript || "No speech detected");
      setStatus("Done ✅");
    };

    mediaRecorder.start();
    setRecorder(mediaRecorder);
    setRecording(true);
  };

  const stopRecording = () => {
    recorder.stop();
    setRecording(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎤 Voice to Text</h1>
        <p style={styles.subtitle}>Desktop Speech Recognition using Deepgram</p>

        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            ...styles.button,
            background: recording ? "#ff4d4d" : "#4CAF50",
          }}
        >
          {recording ? "⏹ Stop Recording" : "▶ Start Recording"}
        </button>

        <p style={styles.status}>{status}</p>

        <textarea
          rows="6"
          value={text}
          readOnly
          placeholder="Your spoken text will appear here..."
          style={styles.textarea}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    width: "420px",
    padding: "30px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    textAlign: "center",
    color: "#fff",
  },
  title: {
    marginBottom: "5px",
    fontSize: "26px",
  },
  subtitle: {
    fontSize: "14px",
    opacity: 0.9,
    marginBottom: "20px",
  },
  button: {
    padding: "12px 25px",
    border: "none",
    borderRadius: "30px",
    fontSize: "16px",
    color: "#fff",
    cursor: "pointer",
    transition: "0.3s",
  },
  status: {
    marginTop: "15px",
    fontSize: "14px",
    opacity: 0.9,
  },
  textarea: {
    marginTop: "15px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    resize: "none",
    fontSize: "14px",
    outline: "none",
  },
};

export default App;
