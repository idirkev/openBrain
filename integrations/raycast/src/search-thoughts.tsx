// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
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
import { searchThoughts, Thought } from "./api";

export default function SearchThoughtsCommand() {
  const [searchText, setSearchText] = useState("");
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setThoughts([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchThoughts(query, 20, 0.6);
      setThoughts(results);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(searchText);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText, performSearch]);

  async function copyThought(thought: Thought) {
    await Clipboard.copy(thought.content);
    await showToast({
      style: Toast.Style.Success,
      title: "Copied to clipboard",
    });
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  function getAccessoryTitle(thought: Thought): string {
    const parts: string[] = [];
    if (thought.similarity) {
      parts.push(`${Math.round(thought.similarity * 100)}%`);
    }
    if (thought.metadata?.topics?.length) {
      parts.push(thought.metadata.topics.slice(0, 2).join(", "));
    }
    return parts.join(" | ");
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search thoughts by meaning..."
      throttle
    >
      {thoughts.map((thought) => (
        <List.Item
          key={thought.id}
          icon={getIconForType(thought.metadata?.type)}
          title={thought.content.substring(0, 60)}
          subtitle={thought.content.length > 60 ? "..." : undefined}
          accessories={[
            { text: getAccessoryTitle(thought) },
            { date: new Date(thought.created_at) },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Details"
                icon={Icon.Eye}
                target={
                  <Detail
                    markdown={`# Thought\n\n${thought.content}\n\n---\n\n**Type:** ${thought.metadata?.type || "unknown"}  \n**Template:** ${thought.metadata?.template || "none"}  \n**Topics:** ${thought.metadata?.topics?.join(", ") || "none"}  \n**People:** ${thought.metadata?.people?.join(", ") || "none"}  \n**Created:** ${formatDate(thought.created_at)}`}
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
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
