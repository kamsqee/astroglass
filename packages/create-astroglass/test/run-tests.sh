#!/bin/bash
# ─── CLI Test Runner ───
# Iterates test/matrix.json: scaffold → install → build for each test case.
# Results are logged per-test in test/results/{id}/.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(cd "$PKG_DIR/../.." && pwd)"
CLI="$PKG_DIR/dist/index.js"
MATRIX="$SCRIPT_DIR/matrix.json"
RESULTS_DIR="$SCRIPT_DIR/results"
TEST_WORKSPACE="$SCRIPT_DIR/.workspace"

# Use the local repo checkout as the template source so tests always
# build against the current commit, not a potentially stale GitHub cache.
export ASTROGLASS_TEMPLATE_DIR="$REPO_ROOT"

# Parallelism limits
SCAFFOLD_PARALLEL=3
INSTALL_PARALLEL=2
BUILD_PARALLEL=2

# ─── Preflight ───
if [ ! -f "$CLI" ]; then
  echo "ERROR: CLI not built. Run 'pnpm build' first."
  exit 1
fi

if [ ! -f "$MATRIX" ]; then
  echo "ERROR: matrix.json not found. Run 'npx tsx test/generate-matrix.ts' first."
  exit 1
fi

# Clean previous runs
rm -rf "$RESULTS_DIR" "$TEST_WORKSPACE"
mkdir -p "$RESULTS_DIR" "$TEST_WORKSPACE"

# Parse test count
TEST_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$MATRIX','utf8')).length)")
echo "Running $TEST_COUNT test cases..."
echo ""

# ─── Stage 1: Scaffold ───
echo "═══ Stage 1: Scaffolding ($SCAFFOLD_PARALLEL parallel) ═══"
PIDS=()
RUNNING=0

for row in $(node -e "
  const m = JSON.parse(require('fs').readFileSync('$MATRIX','utf8'));
  m.forEach(t => console.log(JSON.stringify(t)));
"); do
  ID=$(echo "$row" | node -e "process.stdin.on('data',d=>{console.log(JSON.parse(d).id)})")
  THEMES=$(echo "$row" | node -e "process.stdin.on('data',d=>{console.log(JSON.parse(d).themes.join(','))})")
  PALETTES=$(echo "$row" | node -e "process.stdin.on('data',d=>{console.log(JSON.parse(d).palettes.join(','))})")
  LOCALES=$(echo "$row" | node -e "process.stdin.on('data',d=>{console.log(JSON.parse(d).locales.join(','))})")
  FEATURES=$(echo "$row" | node -e "process.stdin.on('data',d=>{const f=JSON.parse(d).features;console.log(f.length?f.join(','):'__NONE__')})")
  DEPLOY=$(echo "$row" | node -e "process.stdin.on('data',d=>{console.log(JSON.parse(d).deployTarget)})")

  DIR="$TEST_WORKSPACE/$ID"
  LOG_DIR="$RESULTS_DIR/$ID"
  mkdir -p "$LOG_DIR"

  FEAT_ARGS=""
  if [ "$FEATURES" = "__NONE__" ]; then
    FEAT_ARGS="--no-features"
  else
    FEAT_ARGS="--features $FEATURES"
  fi

  (
    START=$(date +%s)
    MAX_RETRIES=3
    ATTEMPT=0
    SUCCESS=false
    while [ $ATTEMPT -lt $MAX_RETRIES ]; do
      ATTEMPT=$((ATTEMPT + 1))
      if node "$CLI" "$DIR" --theme "$THEMES" --palettes "$PALETTES" --locales "$LOCALES" $FEAT_ARGS --deploy "$DEPLOY" --yes > "$LOG_DIR/scaffold.log" 2>&1; then
        SUCCESS=true
        break
      fi
      if [ $ATTEMPT -lt $MAX_RETRIES ]; then
        echo "  ⟳ scaffold: $ID attempt $ATTEMPT failed, retrying in 5s..."
        rm -rf "$DIR"
        sleep 5
      fi
    done
    if [ "$SUCCESS" = true ]; then
      echo "  ✓ scaffold: $ID ($(( $(date +%s) - START ))s)"
      echo "PASS" > "$LOG_DIR/scaffold.status"
    else
      echo "  ✗ scaffold: $ID FAILED after $MAX_RETRIES attempts"
      echo "FAIL" > "$LOG_DIR/scaffold.status"
    fi
  ) &
  PIDS+=($!)
  RUNNING=$((RUNNING + 1))

  if [ $RUNNING -ge $SCAFFOLD_PARALLEL ]; then
    wait "${PIDS[0]}"
    PIDS=("${PIDS[@]:1}")
    RUNNING=$((RUNNING - 1))
  fi
done

# Wait for remaining scaffolds
for pid in "${PIDS[@]}"; do wait "$pid"; done
echo ""

# ─── Stage 2: Install ───
echo "═══ Stage 2: Installing ($INSTALL_PARALLEL parallel) ═══"
PIDS=()
RUNNING=0

for row in $(node -e "
  const m = JSON.parse(require('fs').readFileSync('$MATRIX','utf8'));
  m.forEach(t => console.log(t.id));
"); do
  ID="$row"
  DIR="$TEST_WORKSPACE/$ID"
  LOG_DIR="$RESULTS_DIR/$ID"

  # Skip if scaffold failed
  if [ "$(cat "$LOG_DIR/scaffold.status" 2>/dev/null)" != "PASS" ]; then
    echo "  ⊘ install: $ID (skipped — scaffold failed)"
    echo "SKIP" > "$LOG_DIR/install.status"
    continue
  fi

  (
    START=$(date +%s)
    if (cd "$DIR" && npm install --loglevel=error > "$LOG_DIR/install.log" 2>&1); then
      echo "  ✓ install: $ID ($(( $(date +%s) - START ))s)"
      echo "PASS" > "$LOG_DIR/install.status"
    else
      echo "  ✗ install: $ID FAILED"
      echo "FAIL" > "$LOG_DIR/install.status"
    fi
  ) &
  PIDS+=($!)
  RUNNING=$((RUNNING + 1))

  if [ $RUNNING -ge $INSTALL_PARALLEL ]; then
    wait "${PIDS[0]}"
    PIDS=("${PIDS[@]:1}")
    RUNNING=$((RUNNING - 1))
  fi
done

for pid in "${PIDS[@]}"; do wait "$pid"; done
echo ""

# ─── Stage 3: Build ───
echo "═══ Stage 3: Building ($BUILD_PARALLEL parallel) ═══"
PIDS=()
RUNNING=0

for row in $(node -e "
  const m = JSON.parse(require('fs').readFileSync('$MATRIX','utf8'));
  m.forEach(t => console.log(t.id));
"); do
  ID="$row"
  DIR="$TEST_WORKSPACE/$ID"
  LOG_DIR="$RESULTS_DIR/$ID"

  # Skip if install failed
  if [ "$(cat "$LOG_DIR/install.status" 2>/dev/null)" != "PASS" ]; then
    echo "  ⊘ build: $ID (skipped)"
    echo "SKIP" > "$LOG_DIR/build.status"
    continue
  fi

  (
    START=$(date +%s)
    if (cd "$DIR" && npm run build > "$LOG_DIR/build.log" 2>&1); then
      echo "  ✓ build: $ID ($(( $(date +%s) - START ))s)"
      echo "PASS" > "$LOG_DIR/build.status"
    else
      echo "  ✗ build: $ID FAILED"
      echo "FAIL" > "$LOG_DIR/build.status"
    fi
  ) &
  PIDS+=($!)
  RUNNING=$((RUNNING + 1))

  if [ $RUNNING -ge $BUILD_PARALLEL ]; then
    wait "${PIDS[0]}"
    PIDS=("${PIDS[@]:1}")
    RUNNING=$((RUNNING - 1))
  fi
done

for pid in "${PIDS[@]}"; do wait "$pid"; done
echo ""
echo "═══ All stages complete. Run report: npx tsx test/report.ts ═══"
