#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/generate-teaser.sh <article-slug> [--force]
# Generates de/en/tr HeyGen avatar teaser videos for an article.
# Skips languages where the video already exists (unless --force).
# Requires .env with HEYGEN_API_KEY, HEYGEN_AVATAR_ID, HEYGEN_VOICE_ID_{DE,EN,TR}, ANTHROPIC_API_KEY

SLUG="${1:-}"
FORCE=false
[ "${2:-}" = "--force" ] && FORCE=true

if [ -z "$SLUG" ]; then
  echo "Usage: $0 <article-slug> [--force]" >&2
  exit 1
fi

# Load env
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
  set -a; source "$ENV_FILE"; set +a
fi

# Validate required vars
for var in HEYGEN_API_KEY HEYGEN_AVATAR_ID HEYGEN_VOICE_ID_DE HEYGEN_VOICE_ID_EN HEYGEN_VOICE_ID_TR ANTHROPIC_API_KEY; do
  if [ -z "${!var:-}" ]; then
    echo "Error: $var is not set. Copy .env.example to .env and fill in values." >&2
    exit 1
  fi
done

VIDEO_DIR="static/resource/video"
CONTENT_FILE="content/de/blog/${SLUG}.de.md"

if [ ! -f "$CONTENT_FILE" ]; then
  echo "Error: Content file not found: $CONTENT_FILE" >&2
  exit 1
fi

# Extract teaser_script from front matter, or use first paragraph of body
extract_script() {
  local script
  script=$(awk '/^---/{p++} p==1{print} p==2{exit}' "$CONTENT_FILE" | grep '^teaser_script:' | sed 's/^teaser_script: *//' | tr -d '"')
  if [ -n "$script" ]; then
    echo "$script"
    return
  fi
  awk 'BEGIN{fm=0} /^---/{fm++; next} fm>=2 && /^[^[:space:]]/{print; exit}' "$CONTENT_FILE"
}

translate_script() {
  local text="$1"
  local target_lang="$2"
  curl -s https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d "$(jq -n \
      --arg model "claude-haiku-4-5-20251001" \
      --arg text "$text" \
      --arg lang "$target_lang" \
      '{model:$model,max_tokens:512,messages:[{role:"user",content:"Translate the following text to \($lang). Return only the translated text, no explanation.\n\n\($text)"}]}')" \
  | jq -r '.content[0].text'
}

submit_heygen_video() {
  local script="$1"
  local voice_id="$2"
  curl -s -X POST https://api.heygen.com/v2/video/generate \
    -H "X-Api-Key: $HEYGEN_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg avatar_id "$HEYGEN_AVATAR_ID" \
      --arg voice_id "$voice_id" \
      --arg script "$script" \
      '{
        video_inputs: [{
          character: {type:"avatar", avatar_id:$avatar_id, avatar_style:"normal"},
          voice: {type:"text", input_text:$script, voice_id:$voice_id},
          background: {type:"color", value:"#000000"}
        }],
        dimension: {width:720, height:1280},
        aspect_ratio: null
      }')" \
  | jq -r '.data.video_id'
}

poll_heygen_video() {
  local video_id="$1"
  local max_attempts=60
  local attempt=0
  echo "  Polling for video_id=$video_id ..." >&2
  while [ $attempt -lt $max_attempts ]; do
    local status
    status=$(curl -s "https://api.heygen.com/v1/video_status.get?video_id=${video_id}" \
      -H "X-Api-Key: $HEYGEN_API_KEY" | jq -r '.data.status')
    if [ "$status" = "completed" ]; then
      curl -s "https://api.heygen.com/v1/video_status.get?video_id=${video_id}" \
        -H "X-Api-Key: $HEYGEN_API_KEY" | jq -r '.data.video_url'
      return 0
    elif [ "$status" = "failed" ]; then
      echo "  Error: HeyGen video generation failed." >&2
      return 1
    fi
    sleep 10
    attempt=$((attempt + 1))
  done
  echo "  Error: Timed out waiting for HeyGen video." >&2
  return 1
}

# Extract base script (German)
SCRIPT_DE=$(extract_script)
if [ -z "$SCRIPT_DE" ]; then
  echo "Error: Could not extract teaser script from $CONTENT_FILE" >&2
  exit 1
fi
echo "Script (DE): $SCRIPT_DE"

declare -A SCRIPTS VOICE_IDS
SCRIPTS[de]="$SCRIPT_DE"
VOICE_IDS[de]="$HEYGEN_VOICE_ID_DE"
VOICE_IDS[en]="$HEYGEN_VOICE_ID_EN"
VOICE_IDS[tr]="$HEYGEN_VOICE_ID_TR"

# Translate to EN and TR
echo "Translating to EN..."
SCRIPTS[en]=$(translate_script "$SCRIPT_DE" "English")
echo "Translating to TR..."
SCRIPTS[tr]=$(translate_script "$SCRIPT_DE" "Turkish")

# Generate videos per language
for lang in de en tr; do
  OUT_FILE="$VIDEO_DIR/${SLUG}-${lang}.mp4"
  if [ -f "$OUT_FILE" ] && [ "$FORCE" = false ]; then
    echo "[$lang] Skipping — $OUT_FILE already exists (use --force to regenerate)"
    continue
  fi
  echo "[$lang] Submitting to HeyGen..."
  VIDEO_ID=$(submit_heygen_video "${SCRIPTS[$lang]}" "${VOICE_IDS[$lang]}")
  if [ -z "$VIDEO_ID" ] || [ "$VIDEO_ID" = "null" ]; then
    echo "[$lang] Error: HeyGen submission failed." >&2
    continue
  fi
  echo "[$lang] Waiting for video (id=$VIDEO_ID)..."
  VIDEO_URL=$(poll_heygen_video "$VIDEO_ID")
  echo "[$lang] Downloading from $VIDEO_URL ..."
  curl -sL "$VIDEO_URL" -o "$OUT_FILE"
  echo "[$lang] Saved to $OUT_FILE"
done

echo "Done. Set video_teaser: true in $CONTENT_FILE front matter."
