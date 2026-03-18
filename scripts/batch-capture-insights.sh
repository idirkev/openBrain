#!/bin/bash
# =============================================================================
# Batch Capture: AI-Assisted Research Insights for Open Brain
# =============================================================================
# Captures 10 insights from "AI-Assisted Research in Open Brain Platforms"
# article, each mapped to a concrete upgrade or integration point in the
# openBrain / idirnet / LINK architecture.
#
# Usage:
#   ./scripts/batch-capture-insights.sh              # Run all captures
#   ./scripts/batch-capture-insights.sh --dry-run    # Preview without sending
#
# Environment:
#   SUPABASE_URL    - Supabase project URL (or reads from services/supabase/.env)
#   MCP_ACCESS_KEY  - MCP bridge auth key (or reads from .env.local)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# =============================================================================
# CONFIGURATION
# =============================================================================

DRY_RUN=0
DELAY_SECONDS=2
CAPTURED=0
FAILED=0
TOTAL=0

if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=1
    echo "[DRY RUN] No captures will be sent."
    echo ""
fi

# Load env vars if not already set
if [[ -z "${SUPABASE_URL:-}" ]]; then
    ENV_FILE="${PROJECT_ROOT}/services/supabase/.env"
    if [[ -f "$ENV_FILE" ]]; then
        SUPABASE_URL="$(grep '^SUPABASE_URL=' "$ENV_FILE" | cut -d'=' -f2-)"
        export SUPABASE_URL
    fi
fi

if [[ -z "${MCP_ACCESS_KEY:-}" ]]; then
    ENV_LOCAL="${PROJECT_ROOT}/.env.local"
    if [[ -f "$ENV_LOCAL" ]]; then
        MCP_ACCESS_KEY="$(grep '^MCP_ACCESS_KEY=' "$ENV_LOCAL" | cut -d'=' -f2-)"
        export MCP_ACCESS_KEY
    fi
fi

# Validate required vars
if [[ -z "${SUPABASE_URL:-}" ]]; then
    echo "ERROR: SUPABASE_URL not set. Export it or add to services/supabase/.env" >&2
    exit 1
fi
if [[ -z "${MCP_ACCESS_KEY:-}" ]]; then
    echo "ERROR: MCP_ACCESS_KEY not set. Export it or add to .env.local" >&2
    exit 1
fi

MCP_ENDPOINT="${SUPABASE_URL}/functions/v1/open-brain-mcp"

echo "=== Batch Capture: AI-Assisted Research Insights ==="
echo "Endpoint: ${MCP_ENDPOINT}"
echo "Source:   AI-Assisted Research in Open Brain Platforms (article)"
echo "Date:     $(date +%Y-%m-%d)"
echo ""

# =============================================================================
# CAPTURE FUNCTION
# =============================================================================

capture_thought() {
    local content="$1"
    local label="$2"
    TOTAL=$((TOTAL + 1))

    echo "[$TOTAL] $label"

    if [[ "$DRY_RUN" -eq 1 ]]; then
        echo "  -> Would capture: ${content:0:80}..."
        echo ""
        CAPTURED=$((CAPTURED + 1))
        return 0
    fi

    # Build JSON payload using jq for safe escaping
    local payload
    payload=$(jq -n \
        --arg content "$content" \
        '{
            jsonrpc: "2.0",
            method: "tools/call",
            params: {
                name: "capture_thought",
                arguments: { content: $content }
            },
            id: 1
        }')

    local response
    local http_code
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "$MCP_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "x-brain-key: ${MCP_ACCESS_KEY}" \
        -d "$payload" \
        --max-time 30)

    http_code=$(echo "$response" | tail -1)
    local body
    body=$(echo "$response" | sed '$d')

    if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
        local thought_id
        thought_id=$(echo "$body" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.id // "unknown"' 2>/dev/null)
        echo "  -> Captured (id: ${thought_id})"
        CAPTURED=$((CAPTURED + 1))
    else
        echo "  -> FAILED (HTTP ${http_code})" >&2
        echo "  -> Response: ${body:0:200}" >&2
        FAILED=$((FAILED + 1))
    fi

    echo ""

    # Rate limit: pause between captures to avoid hammering the endpoint
    if [[ "$DRY_RUN" -eq 0 ]]; then
        sleep "$DELAY_SECONDS"
    fi
}

# =============================================================================
# INSIGHTS (10 captures)
# =============================================================================
# Each prefixed with "Insight:" to trigger the Insight template classification.
# Each ties the article finding to a specific openBrain/idirdev/LINK action.
# =============================================================================

capture_thought \
    "Insight: MCP as USB-C for AI — the article frames Model Context Protocol as a universal adapter between AI and knowledge platforms. openBrain already implements MCP via the open-brain-mcp Edge Function with 4 tools. Next step: publish an MCP server manifest (tools/list endpoint) so LINK and external Claude Code sessions can auto-discover available tools without hardcoding. This turns openBrain into a plug-and-play knowledge backend for any MCP-compatible client." \
    "MCP auto-discovery for openBrain"

capture_thought \
    "Insight: Hybrid search (text + vector) significantly outperforms pure semantic search for knowledge retrieval. openBrain currently uses only vector search via match_thoughts RPC with cosine similarity. Adding a parallel full-text search using PostgreSQL tsvector on the thoughts table and merging results with reciprocal rank fusion would improve recall for exact-match queries (names, dates, template keywords) that embeddings handle poorly. Supabase already supports tsvector natively." \
    "Hybrid search upgrade for openBrain"

capture_thought \
    "Insight: RAG-powered research pipelines are the standard pattern for turning knowledge bases into active research tools. LINK's pipeline already generates strategic analysis from openBrain data. The missing piece is retrieval-augmented generation at query time: when LINK runs a pipeline step, it should pull the top-N semantically relevant thoughts as context before each LLM call. This would ground LINK outputs in actual captured knowledge rather than relying on the model's training data alone." \
    "RAG integration for LINK pipeline"

capture_thought \
    "Insight: Entity recognition and relationship mapping extract structure from unstructured notes. openBrain's extractMetadata function uses gpt-4o-mini to pull people, topics, and action_items. Extending this to extract explicit entity relationships (e.g., 'Person X decided Y about Project Z') and storing them as edges in a lightweight graph structure (a relationships table with source_thought_id, target_thought_id, relationship_type) would enable LINK to traverse knowledge connections, not just search them." \
    "Entity relationship graph for openBrain"

capture_thought \
    "Insight: Local LLM integration (Ollama, LM Studio) enables privacy-preserving AI processing without API costs. For openBrain, running embedding generation locally via Ollama with nomic-embed-text would eliminate per-capture OpenRouter costs and keep sensitive thought content off external servers. The Edge Function could fall back to OpenRouter when local is unavailable. Relevant for the federated multi-node future where each person runs their own openBrain." \
    "Local LLM fallback for embeddings"

capture_thought \
    "Insight: Graph visualization tools like InfraNodus reveal hidden connections and structural gaps in knowledge bases. openBrain has 344+ thoughts with topic metadata but no way to visualize the topic co-occurrence network. Building a simple force-directed graph view in the Morning Briefing Dashboard that plots thoughts as nodes and shared topics as edges would surface clusters, orphaned ideas, and knowledge gaps. The data is already there in the metadata.topics arrays." \
    "Knowledge graph visualization for dashboard"

capture_thought \
    "Insight: Smart Connections (Obsidian plugin pattern) surfaces related notes automatically as you write. openBrain could implement this for the capture flow: after each new thought is ingested, run a background semantic search against existing thoughts and attach the top 3 related thought IDs to the new thought's metadata as a 'related_thoughts' field. This builds an automatic backlink network without manual tagging and makes the search_thoughts tool more useful for context building." \
    "Auto-linking related thoughts on capture"

capture_thought \
    "Insight: Multi-modal AI processing is becoming standard in knowledge platforms. openBrain currently only captures text. Adding image and audio support to the ingest-thought Edge Function (accepting base64 image payloads, running them through a vision model for description, then embedding the description) would enable capturing whiteboard photos, architecture diagrams, and voice memos. The capture_thought MCP tool could accept an optional 'attachment_url' parameter." \
    "Multi-modal capture for openBrain"

capture_thought \
    "Insight: Automated insight generation — platforms now batch-process accumulated notes to surface patterns the user missed. openBrain could add a scheduled Edge Function (daily or weekly) that retrieves recent thoughts, clusters them by embedding similarity, and generates a synthesis insight for each cluster. These generated insights would feed back into the thoughts table with type 'auto_insight' and appear in the Morning Briefing Dashboard as a 'patterns detected' section." \
    "Automated pattern detection pipeline"

capture_thought \
    "Insight: Federated learning and collaborative features let multiple knowledge bases share insights without exposing raw data. This maps directly to the idirnet multi-node vision. The concrete first step: define a thought exchange protocol where an openBrain node can publish sanitized thought summaries (topic, type, timestamp — no raw content) to idirnet's shared layer. Other nodes can then request full content via authenticated MCP calls. This preserves the 'federate by choice' principle from the architecture." \
    "Federated thought exchange protocol for idirnet"

# =============================================================================
# SUMMARY
# =============================================================================

echo "==========================================="
echo "Batch capture complete."
echo "  Total:    $TOTAL"
echo "  Captured: $CAPTURED"
echo "  Failed:   $FAILED"
echo "==========================================="

if [[ "$FAILED" -gt 0 ]]; then
    exit 1
fi
