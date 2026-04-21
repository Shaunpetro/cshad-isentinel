# v1.263_001/scripts/verify-no-test-data.sh
#!/bin/bash

# ================================================
# PSHAD Sentinel — Test Artifact Scanner
# Run before any release or phase completion
# Rule 9: No test artifacts in production code
# ================================================

echo "🔍 Scanning for test artifacts in src/ ..."
echo ""

FOUND=0

# Search patterns that indicate test/mock data
PATTERNS=(
  "MOCK"
  "DUMMY"
  "PLACEHOLDER"
  "FAKE"
  "TODO:remove"
  "lorem ipsum"
  "test@test"
  "example\.com"
  "123456789"
  "sampleData"
  "mockData"
  "dummyData"
  "fakeNews"
  "fakeTip"
)

for pattern in "${PATTERNS[@]}"; do
  RESULTS=$(grep -rn --include="*.ts" --include="*.tsx" "$pattern" src/ 2>/dev/null)
  if [ -n "$RESULTS" ]; then
    echo "⚠️  Found '$pattern':"
    echo "$RESULTS"
    echo ""
    FOUND=1
  fi
done

# Check for mock data files
if [ -d "src/mocks" ]; then
  echo "⚠️  src/mocks/ directory exists — should be deleted before release"
  FOUND=1
fi

if [ -d "src/__fixtures__" ]; then
  echo "⚠️  src/__fixtures__/ directory exists — should be deleted before release"
  FOUND=1
fi

echo ""
if [ $FOUND -eq 0 ]; then
  echo "✅ No test artifacts found. Clean for release."
else
  echo "❌ Test artifacts detected. Clean up before proceeding."
  exit 1
fi