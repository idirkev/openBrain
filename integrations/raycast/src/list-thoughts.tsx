// @ts-nocheck
import { useState, useEffect } from "react";
import {
  List,
  Action,
  ActionPanel,
  showToast,
  Toast,
  Icon,
  Clipboard,
  Detail,
} from "@raycast/api";
import { listThoughts, Thought } from "./api";

type FilterType = "all" | "observation" | "task" | "idea" | "reference" | "person_note";

export default function ListThoughtsCommand() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    loadThoughts();
  }, [filter]);

  async function loadThoughts() {
    setIsLoading(true);
    try {
      const options: { type?: string } = {};
      if (filter !== "all") {
        options.type = filter;
      }
      const results = await listThoughts(options);
      setThoughts(results);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load thoughts",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function copyThought(thought: Thought) {
    await Clipboard.copy(thought.content);
    await showToast({
      style: Toast.Style.Success,
      title: "Copied to clipboard",
    });
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function getIconForType(type?: string): Icon {
    switch (type) {
      case "task":
        return Icon.CheckCircle;
      case "idea":
        return Icon.LightBulb;
      case "reference":
        return Icon.Book;
      case "person_note":
        return Icon.Person;
      default:
        return Icon.Circle;
    }
  }

  function getFilterDropdown() {
    return (
      <List.Dropdown
        tooltip="Filter by type"
        value={filter}
        onChange={(value) => setFilter(value as FilterType)}
      >
        <List.Dropdown.Item title="All Types" value="all" />
        <List.Dropdown.Item title="Tasks" value="task" />
        <List.Dropdown.Item title="Ideas" value="idea" />
        <List.Dropdown.Item title="References" value="reference" />
        <List.Dropdown.Item title="Person Notes" value="person_note" />
        <List.Dropdown.Item title="Observations" value="observation" />
      </List.Dropdown>
    );
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter recent thoughts..."
      searchBarAccessory={getFilterDropdown()}
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={loadThoughts}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    >
      {thoughts.map((thought) => (
        <List.Item
          key={thought.id}
          icon={getIconForType(thought.metadata?.type)}
          title={thought.content.substring(0, 60)}
          subtitle={thought.content.length > 60 ? "..." : undefined}
          accessories={[
            { tag: thought.metadata?.template || thought.metadata?.type },
            { text: formatDate(thought.created_at) },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Details"
                icon={Icon.Eye}
                target={
                  <Detail
                    markdown={`# Thought\n\n${thought.content}\n\n---\n\n**Type:** ${thought.metadata?.type || "unknown"}  \n**Template:** ${thought.metadata?.template || "none"}  \n**Topics:** ${thought.metadata?.topics?.join(", ") || "none"}  \n**People:** ${thought.metadata?.people?.join(", ") || "none"}  \n**Action Items:** ${thought.metadata?.action_items?.join(", ") || "none"}  \n**Created:** ${new Date(thought.created_at).toLocaleString()}`}
                    actions={
                      <ActionPanel>
                        <Action
                          title="Copy Content"
                          icon={Icon.Clipboard}
                          onAction={() => copyThought(thought)}
                        />
                      </ActionPanel>
                    }
                  />
                }
              />
              <Action
                title="Copy Content"
                icon={Icon.Clipboard}
                onAction={() => copyThought(thought)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
