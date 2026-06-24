#!/usr/bin/env bash
set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────────────

slugify() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9 ]/-/g' \
    | sed 's/ /-/g' \
    | sed 's/-\{2,\}/-/g' \
    | sed 's/^-//;s/-$//'
}

today() {
  date +%Y-%m-%d
}

count_files() {
  local dir="$1"
  if [ -d "$dir" ]; then
    find "$dir" -maxdepth 1 -name "*.md" | wc -l | tr -d ' '
  else
    echo "0"
  fi
}

ask() {
  local prompt="$1"
  local default="${2:-}"
  local response
  if [ -n "$default" ]; then
    read -r -p "$prompt [$default]: " response
    echo "${response:-$default}"
  else
    read -r -p "$prompt: " response
    echo "$response"
  fi
}

# ── Start ─────────────────────────────────────────────────────────────────────

echo ""
echo "  ── new-post ──────────────────────────────────"
echo ""

# 1. Content type
echo "  Content type:"
echo "  1) blog"
echo "  2) podcast"
echo "  3) youtube"
echo "  4) source"
echo "  5) about  (opens _index.md directly)"
echo ""
read -r -p "  Choose [1-5]: " type_choice

case "$type_choice" in
  1) TYPE="blog"    ;;
  2) TYPE="podcast" ;;
  3) TYPE="youtube" ;;
  4) TYPE="sources" ;;
  5)
    echo ""
    echo "  Edit content/about/_index.md directly — no new file needed."
    exit 0
    ;;
  *) echo "Invalid choice."; exit 1 ;;
esac

echo ""

# 2. Title + slug
TITLE=$(ask "  Title")
SLUG=$(slugify "$TITLE")
echo "  → Slug: $SLUG"

# Collision check
TARGET_DIR="content/$TYPE"
TARGET_FILE="$TARGET_DIR/$SLUG.md"

if [ -f "$TARGET_FILE" ]; then
  echo ""
  echo "  ⚠ File already exists: $TARGET_FILE"
  read -r -p "  Overwrite? (y/n): " overwrite
  if [ "$overwrite" != "y" ]; then
    SLUG=$(ask "  New slug" "$SLUG")
    TARGET_FILE="$TARGET_DIR/$SLUG.md"
  fi
fi

DATE=$(today)

# 3. Series
SERIES=$(ask "  Series / category name")

# 4. Episode number
EPISODE_DEFAULT=$(( $(count_files "$TARGET_DIR") + 1 ))
EPISODE=$(ask "  Episode number" "$EPISODE_DEFAULT")

# 5. Tags
echo ""
read -r -p "  Tags (comma-separated, or Enter to skip): " TAGS_RAW

TAGS_YAML=""
if [ -n "$TAGS_RAW" ]; then
  TAGS_YAML="tags: ["
  IFS=',' read -ra TAG_ARR <<< "$TAGS_RAW"
  for i in "${!TAG_ARR[@]}"; do
    tag=$(echo "${TAG_ARR[$i]}" | xargs)  # trim spaces
    if [ $i -gt 0 ]; then TAGS_YAML+=", "; fi
    TAGS_YAML+="$tag"
  done
  TAGS_YAML+="]"
else
  TAGS_YAML="tags: []"
fi

# ── Type-specific fields ───────────────────────────────────────────────────────

EXTRA_FRONTMATTER=""
IMAGES_YAML=""

case "$TYPE" in

  blog)
    echo ""
    READTIME=$(ask "  Estimated read time (e.g. 5 min, or Enter to skip)")
    PULLQUOTE=$(ask "  Pull quote for sidebar (or Enter to skip)")

    # Images loop
    echo ""
    while true; do
      read -r -p "  Add an image or GIF? (y/n): " add_img
      if [ "$add_img" != "y" ]; then break; fi

      IMG_SRC=$(ask "  Image src (path relative to static/, e.g. resource/image/photo.jpg)")
      IMG_CAPTION=$(ask "  Caption (or Enter to skip)")
      echo "  Position:"
      echo "    1) top          — full-width above text"
      echo "    2) bottom       — full-width below text"
      echo "    3) inline-left  — floats left, text wraps right"
      echo "    4) inline-right — floats right, text wraps left"
      read -r -p "  Choose [1-4]: " pos_choice
      case "$pos_choice" in
        1) IMG_POS="top" ;;
        2) IMG_POS="bottom" ;;
        3) IMG_POS="inline-left" ;;
        4) IMG_POS="inline-right" ;;
        *) IMG_POS="top" ;;
      esac

      IMAGES_YAML+="  - src: \"$IMG_SRC\"\n"
      IMAGES_YAML+="    caption: \"$IMG_CAPTION\"\n"
      IMAGES_YAML+="    position: \"$IMG_POS\"\n"
    done

    EXTRA_FRONTMATTER=""
    [ -n "$READTIME" ]   && EXTRA_FRONTMATTER+="readtime: \"$READTIME\"\n"
    [ -n "$PULLQUOTE" ]  && EXTRA_FRONTMATTER+="pullquote: \"$PULLQUOTE\"\n"
    if [ -n "$IMAGES_YAML" ]; then
      EXTRA_FRONTMATTER+="images:\n$IMAGES_YAML"
    fi
    ;;

  podcast)
    echo ""
    DURATION=$(ask "  Duration (e.g. 42 min)")
    AUDIO_URL=$(ask "  Audio URL (full URL to hosted audio file)")
    EXTRA_FRONTMATTER="duration: \"$DURATION\"\naudio_url: \"$AUDIO_URL\"\n"
    ;;

  youtube)
    echo ""
    DURATION=$(ask "  Duration (e.g. 60 sec, 12 min)")
    YOUTUBE_ID=$(ask "  YouTube video ID (the part after ?v= in the URL)")
    EXTRA_FRONTMATTER="duration: \"$DURATION\"\nyoutube_id: \"$YOUTUBE_ID\"\n"
    ;;

  sources)
    echo ""
    SOURCE_URL=$(ask "  URL to the external source")
    EXTRA_FRONTMATTER="url: \"$SOURCE_URL\"\n"
    ;;
esac

# ── Body text ──────────────────────────────────────────────────────────────────

echo ""
echo "  Paste your text below."
echo "  Type END on a new line when finished:"
echo ""

BODY=""
while IFS= read -r line; do
  [ "$line" = "END" ] && break
  BODY+="$line"$'\n'
done

# ── Write file ─────────────────────────────────────────────────────────────────

mkdir -p "$TARGET_DIR"

{
  echo "---"
  echo "title: \"$TITLE\""
  echo "date: $DATE"
  echo "series: \"$SERIES\""
  echo "episode: $EPISODE"
  echo "$TAGS_YAML"
  printf "%b" "$EXTRA_FRONTMATTER"
  echo "---"
  echo ""
  printf "%s" "$BODY"
} > "$TARGET_FILE"

echo ""
echo "  ✓ Created: $TARGET_FILE"

# ── Git push ───────────────────────────────────────────────────────────────────

echo ""
read -r -p "  Push to GitHub now? (y/n): " do_push

if [ "$do_push" = "y" ]; then
  git add "$TARGET_FILE"
  git commit -m "Add $TYPE: $TITLE"
  if git push https://github.com/x-talks/x.git main; then
    echo ""
    echo "  ✓ Live at: https://x-talks.github.io/x/"
  else
    echo ""
    echo "  ✗ Push failed. Push manually:"
    echo "    git push https://github.com/x-talks/x.git main"
  fi
else
  echo ""
  echo "  Push manually when ready:"
  echo "    git add $TARGET_FILE"
  echo "    git commit -m \"Add $TYPE: $TITLE\""
  echo "    git push https://github.com/x-talks/x.git main"
fi

echo ""
