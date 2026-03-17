// @ts-nocheck
// Voice Capture Command for Raycast + Whisper
// Usage: obv (Open Brain Voice)

import { useState, useEffect, useCallback } from "react";
import {
  Detail,
  Action,
  ActionPanel,
  showToast,
  Toast,
  Icon,
  Color,
  environment,
} from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { captureThought, Thought } from "./api";

const execAsync = promisify(exec);

// Template colors for visual feedback
const templateVisuals: Record<string, { icon: Icon; color: Color; bg: string; label: string }> = {
  Decision: { icon: Icon.Target, color: Color.Orange, bg: "#fff3e0", label: "🎯 Decision" },
  Risk: { icon: Icon.ExclamationMark, color: Color.Red, bg: "#ffebee", label: "⚠️ Risk" },
  Insight: { icon: Icon.LightBulb, color: Color.Yellow, bg: "#fff8e1", label: "💡 Insight" },
  Milestone: { icon: Icon.Flag, color: Color.Green, bg: "#e8f5e9", label: "🏔️ Milestone" },
  Spec: { icon: Icon.Document, color: Color.Purple, bg: "#f3e5f5", label: "📋 Spec" },
  "Meeting Debrief": { icon: Icon.TwoPeople, color: Color.Blue, bg: "#e3f2fd", label: "🤝 Meeting" },
  "Person Note": { icon: Icon.Person, color: Color.Magenta, bg: "#fce4ec", label: "👤 Person" },
  Budget: { icon: Icon.Coin, color: Color.Teal, bg: "#e0f2f1", label: "💰 Budget" },
  Invoice: { icon: Icon.CreditCard, color: Color.Green, bg: "#e8f5e9", label: "🧾 Invoice" },
  Funding: { icon: Icon.BankNote, color: Color.Blue, bg: "#e3f2fd", label: "🏦 Funding" },
  Legal: { icon: Icon.Bookmark, color: Color.Red, bg: "#ffebee", label: "⚖️ Legal" },
  Compliance: { icon: Icon.Shield, color: Color.Orange, bg: "#fff3e0", label: "🛡️ Compliance" },
  Contract: { icon: Icon.TextDocument, color: Color.Blue, bg: "#e3f2fd", label: "📄 Contract" },
  "AI Save": { icon: Icon.Download, color: Color.Purple, bg: "#f3e5f5", label: "🤖 AI Save" },
  Nutrition: { icon: Icon.Apple, color: Color.Green, bg: "#e8f5e9", label: "🥗 Nutrition" },
  Health: { icon: Icon.Heart, color: Color.Red, bg: "#ffebee", label: "❤️ Health" },
  Home: { icon: Icon.House, color: Color.Brown, bg: "#efebe9", label: "🏠 Home" },
  observation: { icon: Icon.Eye, color: Color.SecondaryText, bg: "#f5f5f5", label: "👁️ Observation" },
  task: { icon: Icon.CheckCircle, color: Color.Green, bg: "#e8f5e9", label: "✅ Task" },
  idea: { icon: Icon.LightBulb, color: Color.Yellow, bg: "#fff8e1", label: "💡 Idea" },
  reference: { icon: Icon.Book, color: Color.Blue, bg: "#e3f2fd", label: "📚 Reference" },
  "person_note": { icon: Icon.Person, color: Color.Magenta, bg: "#fce4ec", label: "👤 Person" },
};

// Processing stages for visual animation
interface ProcessingStage {
  icon: string;
  label: string;
  duration: number;
}

const processingStages: ProcessingStage[] = [
  { icon: "🎤", label: "Recording audio...", duration: 0 },
  { icon: "🧠", label: "Transcribing with Whisper...", duration: 1500 },
  { icon: "🏷️", label: "Classifying template...", duration: 500 },
  { icon: "🔍", label: "Generating embedding...", duration: 800 },
  { icon: "💾", label: "Saving to Open Brain...", duration: 500 },
];

export default function VoiceCaptureCommand() {
  const [status, setStatus] = useState<"recording" | "processing" | "success" | "error">("recording");
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [capturedThought, setCapturedThought] = useState<Thought | null>(null);
  const [error, setError] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number[]>([0, 0, 0]);

  // Start recording on mount
  useEffect(() => {
    startRecording();
  }, []);

  // Recording timer
  useEffect(() => {
    if (status !== "recording") return;

    const timer = setInterval(() => {
      setRecordingTime((t) => {
        if (t >= 30) {
          // Auto-stop at 30 seconds
          stopRecording();
          return t;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Simulate audio waveform
  useEffect(() => {
    if (status !== "recording") return;

    const waveform = setInterval(() => {
      setAudioLevel([
        Math.random() * 80 + 20,
        Math.random() * 80 + 20,
        Math.random() * 80 + 20,
      ]);
    }, 100);

    return () => clearInterval(waveform);
  }, [status]);

  // Processing animation
  useEffect(() => {
    if (status !== "processing") return;

    let stage = 0;
    const advanceStage = () => {
      if (stage < processingStages.length - 1) {
        stage++;
        setCurrentStage(stage);
        setTimeout(advanceStage, processingStages[stage].duration);
      }
    };

    setTimeout(advanceStage, processingStages[0].duration);
  }, [status]);

  // Try to find sox in common locations
  async function findSox(): Promise<string | null> {
    const possiblePaths = [
      "sox",
      "/opt/homebrew/bin/sox",
      "/usr/local/bin/sox",
      "/usr/bin/sox",
    ];
    
    for (const soxPath of possiblePaths) {
      try {
        await execAsync(`which ${soxPath}`);
        return soxPath;
      } catch {
        continue;
      }
    }
    return null;
  }

  async function startRecording() {
    try {
      // Check if sox is installed
      const soxPath = await findSox();
      if (!soxPath) {
        throw new Error("sox not found");
      }
      
      // Haptic feedback
      if (environment.isDevelopment) {
        await execAsync("osascript -e 'beep'");
      }
    } catch {
      showToast({
        style: Toast.Style.Failure,
        title: "Recording not available",
        message: "Install sox: brew install sox",
      });
      setStatus("error");
      setError("sox not installed. Run: brew install sox");
    }
  }

  async function stopRecording() {
    setStatus("processing");
    
    const audioPath = path.join(os.tmpdir(), `ob-voice-${Date.now()}.wav`);

    try {
      // Find sox path
      const soxPath = await findSox();
      if (!soxPath) {
        throw new Error("sox not found");
      }
      
      // Record 5 seconds of audio
      await execAsync(`${soxPath} -d "${audioPath}" trim 0 5`);

      // Transcribe with Whisper
      const transcribedText = await transcribeAudio(audioPath);
      setTranscription(transcribedText);

      // Capture to Open Brain
      const result = await captureThought(transcribedText);
      
      // Fetch the full thought details
      const thought: Thought = {
        id: result.id,
        content: transcribedText,
        metadata: {
          type: result.type,
          template: undefined,
          topics: result.topics,
        },
        created_at: result.created_at,
      };

      setCapturedThought(thought);
      setStatus("success");

      // Success haptic
      if (environment.isDevelopment) {
        await execAsync("osascript -e 'beep 2'");
      }

      // Cleanup
      fs.unlinkSync(audioPath);

    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
      
      // Cleanup on error
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
  }

  async function transcribeAudio(audioPath: string): Promise<string> {
    const { getPreferenceValues } = await import("@raycast/api");
    const { openaiApiKey } = getPreferenceValues<{ openaiApiKey: string }>();

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured. Add it in Raycast preferences.");
    }

    // Use curl to send to Whisper API
    const command = `curl -s -X POST https://api.openai.com/v1/audio/transcriptions \
      -H "Authorization: Bearer ${openaiApiKey}" \
      -F file="@${audioPath}" \
      -F model="whisper-1" \
      -F language="en"`;

    const { stdout } = await execAsync(command);
    const response = JSON.parse(stdout);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.text || "";
  }

  function getWaveformBars(): string {
    const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    return audioLevel.map((level) => {
      const index = Math.floor((level / 100) * (bars.length - 1));
      return bars[Math.min(index, bars.length - 1)];
    }).join("");
  }

  function formatTime(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  }

  // RENDER: Recording State
  if (status === "recording") {
    const waveform = getWaveformBars();
    const markdown = `
# 🎤 Recording...

\`\`\`
${waveform}
${waveform}
${waveform}
\`\`\`

**${formatTime(recordingTime)}** / 00:30

Speak your thought clearly...

---

**Controls:**
- **Space** → Stop recording
- **Esc** → Cancel
`;

    return (
      <Detail
        markdown={markdown}
        actions={
          <ActionPanel>
            <Action
              title="Stop Recording"
              icon={Icon.Stop}
              onAction={stopRecording}
              shortcut={{ modifiers: [], key: "space" }}
            />
            <Action
              title="Cancel"
              icon={Icon.XmarkCircle}
              onAction={() => setStatus("error")}
              shortcut={{ modifiers: [], key: "escape" }}
            />
          </ActionPanel>
        }
      />
    );
  }

  // RENDER: Processing State
  if (status === "processing") {
    const stage = processingStages[currentStage];
    const progress = "▓".repeat(currentStage) + "░".repeat(processingStages.length - currentStage - 1);
    
    const markdown = `
# ${stage.icon} ${stage.label}

\`\`\`
${progress}
\`\`\`

${transcription ? `**Preview:** "${transcription.substring(0, 100)}..."` : ""}

---

Processing your voice capture...
`;

    return <Detail markdown={markdown} />;
  }

  // RENDER: Success State
  if (status === "success" && capturedThought) {
    const type = capturedThought.metadata?.type || "observation";
    const template = capturedThought.metadata?.template;
    const key = template || type;
    const visual = templateVisuals[key] || templateVisuals.observation;
    const topics = capturedThought.metadata?.topics || [];

    const markdown = `
# ✅ Captured!

## ${visual.label}

---

**Content:**
${capturedThought.content}

---

**Metadata:**
- **Type:** ${type}
- **Topics:** ${topics.map((t) => `#${t}`).join(" ") || "None detected"}
- **ID:** ${capturedThought.id}

---

_Captured at ${new Date(capturedThought.created_at).toLocaleString()}_
`;

    return (
      <Detail
        markdown={markdown}
        actions={
          <ActionPanel>
            <Action
              title="Capture Another"
              icon={Icon.Microphone}
              onAction={() => {
                setStatus("recording");
                setRecordingTime(0);
                setTranscription("");
                setCapturedThought(null);
                startRecording();
              }}
              shortcut={{ modifiers: ["cmd"], key: "n" }}
            />
            <Action
              title="Copy Content"
              icon={Icon.Clipboard}
              onAction={async () => {
                const { Clipboard } = await import("@raycast/api");
                await Clipboard.copy(capturedThought.content);
                await showToast({
                  style: Toast.Style.Success,
                  title: "Copied to clipboard",
                });
              }}
            />
            <Action
              title="View in Open Brain"
              icon={Icon.Eye}
              onAction={() => {
                // Could open dashboard URL
                showToast({
                  style: Toast.Style.Success,
                  title: "Opening dashboard...",
                });
              }}
            />
          </ActionPanel>
        }
      />
    );
  }

  // RENDER: Error State
  const errorMarkdown = `
# ⚠️ Capture Failed

**Error:** ${error}

---

**What to try:**
1. Check your internet connection
2. Verify OpenAI API key in preferences
3. Install sox: \`brew install sox\`
4. Try again with shorter recording

---

${transcription ? `**Your transcription was saved:**\n"${transcription}"` : ""}
`;

  return (
    <Detail
      markdown={errorMarkdown}
      actions={
        <ActionPanel>
          <Action
            title="Retry"
            icon={Icon.RotateClockwise}
            onAction={() => {
              setStatus("recording");
              setRecordingTime(0);
              setError("");
              startRecording();
            }}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
          <Action
            title="Capture as Text"
            icon={Icon.Text}
            onAction={() => {
              // Push to text capture form
              showToast({
                style: Toast.Style.Success,
                title: "Switching to text capture...",
              });
            }}
          />
        </ActionPanel>
      }
    />
  );
}
