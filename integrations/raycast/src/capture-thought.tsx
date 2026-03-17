// @ts-nocheck
import { useState } from "react";
import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  Icon,
  Clipboard,
  getSelectedText,
} from "@raycast/api";
import { captureThought } from "./api";

interface CommandArguments {
  content: string;
}

export default function CaptureThoughtCommand(props: { arguments: CommandArguments }) {
  const [content, setContent] = useState(props.arguments.content || "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { content: string }) {
    if (!values.content.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Content required",
        message: "Please enter a thought to capture",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await captureThought(values.content);
      await showToast({
        style: Toast.Style.Success,
        title: "Thought captured",
        message: `${result.type} | ${result.topics?.join(", ") || "no topics"}`,
      });
      setContent("");
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to capture",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function pasteFromClipboard() {
    const text = await Clipboard.readText();
    if (text) {
      setContent(text);
    }
  }

  async function pasteFromSelection() {
    try {
      const text = await getSelectedText();
      setContent(text);
    } catch {
      await showToast({
        style: Toast.Style.Failure,
        title: "No selection",
        message: "Could not get selected text",
      });
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Capture Thought"
            icon={Icon.Plus}
            onSubmit={handleSubmit}
          />
          <Action
            title="Paste from Clipboard"
            icon={Icon.Clipboard}
            onAction={pasteFromClipboard}
          />
          <Action
            title="Paste from Selection"
            icon={Icon.Text}
            onAction={pasteFromSelection}
            shortcut={{ modifiers: ["cmd", "shift"], key: "v" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="content"
        title="Thought"
        placeholder="What's on your mind? Use keywords like 'Decision:', 'Risk:', 'Insight:' for auto-classification..."
        value={content}
        onChange={setContent}
        enableMarkdown
      />
    </Form>
  );
}
