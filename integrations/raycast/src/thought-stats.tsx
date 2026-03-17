// @ts-nocheck
import { useState, useEffect } from "react";
import {
  List,
  Action,
  ActionPanel,
  showToast,
  Toast,
  Icon,
  Color,
} from "@raycast/api";
import { getThoughtStats, ThoughtStats } from "./api";

export default function ThoughtStatsCommand() {
  const [stats, setStats] = useState<ThoughtStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setIsLoading(true);
    try {
      const result = await getThoughtStats();
      setStats(result);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load stats",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function getTypeIcon(type: string): { source: Icon; tintColor: Color } {
    switch (type) {
      case "task":
        return { source: Icon.CheckCircle, tintColor: Color.Green };
      case "idea":
        return { source: Icon.LightBulb, tintColor: Color.Yellow };
      case "reference":
        return { source: Icon.Book, tintColor: Color.Blue };
      case "person_note":
        return { source: Icon.Person, tintColor: Color.Purple };
      case "observation":
        return { source: Icon.Eye, tintColor: Color.Orange };
      default:
        return { source: Icon.Circle, tintColor: Color.SecondaryText };
    }
  }

  const items: JSX.Element[] = [];

  if (stats) {
    // Total count
    items.push(
      <List.Item
        key="total"
        icon={{ source: Icon.Document, tintColor: Color.PrimaryText }}
        title="Total Thoughts"
        subtitle={`${stats.total} thoughts captured`}
        accessories={[{ text: "All Time" }]}
      />
    );

    // By type
    if (stats.by_type && Object.keys(stats.by_type).length > 0) {
      items.push(<List.Section key="types" title="By Type" />);
      Object.entries(stats.by_type)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          const percentage = Math.round((count / stats.total) * 100);
          items.push(
            <List.Item
              key={`type-${type}`}
              icon={getTypeIcon(type)}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
              subtitle={`${count} thoughts`}
              accessories={[{ text: `${percentage}%` }]}
            />
          );
        });
    }

    // Top topics
    if (stats.top_topics && Object.keys(stats.top_topics).length > 0) {
      items.push(<List.Section key="topics" title="Top Topics" />);
      Object.entries(stats.top_topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([topic, count], index) => {
          items.push(
            <List.Item
              key={`topic-${topic}`}
              icon={{ source: Icon.Tag, tintColor: index < 3 ? Color.Blue : Color.SecondaryText }}
              title={topic}
              accessories={[{ text: `${count} mentions` }]}
            />
          );
        });
    }

    // People mentioned
    if (stats.people && Object.keys(stats.people).length > 0) {
      items.push(<List.Section key="people" title="People Mentioned" />);
      Object.entries(stats.people)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([person, count]) => {
          items.push(
            <List.Item
              key={`person-${person}`}
              icon={{ source: Icon.Person, tintColor: Color.Magenta }}
              title={person}
              accessories={[{ text: `${count} mentions` }]}
            />
          );
        });
    }
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Statistics overview..."
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={loadStats}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    >
      {items}
    </List>
  );
}
