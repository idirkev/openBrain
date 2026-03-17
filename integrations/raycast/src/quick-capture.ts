// @ts-nocheck
import { showToast, Toast, Clipboard, getSelectedText } from "@raycast/api";
import { captureThought } from "./api";

interface CommandArguments {
  content: string;
}

export default async function QuickCaptureCommand(props: { arguments: CommandArguments }) {
  const content = props.arguments.content;

  if (!content.trim()) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Empty content",
      message: "Please provide content to capture",
    });
    return;
  }

  try {
    const result = await captureThought(content);
    await showToast({
      style: Toast.Style.Success,
      title: "Captured",
      message: `${result.type} | ${result.topics?.slice(0, 2).join(", ") || "no topics"}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Capture failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Alternative: Capture from clipboard without arguments
export async function captureFromClipboard() {
  const text = await Clipboard.readText();
  if (!text) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Clipboard empty",
    });
    return;
  }

  try {
    const result = await captureThought(text);
    await showToast({
      style: Toast.Style.Success,
      title: "Captured from clipboard",
      message: `${result.type}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Capture failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Alternative: Capture from selection without arguments
export async function captureFromSelection() {
  try {
    const text = await getSelectedText();
    const result = await captureThought(text);
    await showToast({
      style: Toast.Style.Success,
      title: "Captured from selection",
      message: `${result.type}`,
    });
  } catch {
    await showToast({
      style: Toast.Style.Failure,
      title: "No selection",
      message: "Could not get selected text",
    });
  }
}
