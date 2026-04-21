# v1.263_001/scripts/verify-no-test-data.ps1

# ================================================
# PSHAD Sentinel — Test Artifact Scanner (Windows)
# Run before any release or phase completion
# Rule 9: No test artifacts in production code
# ================================================

Write-Host "🔍 Scanning for test artifacts in src/ ..." -ForegroundColor Cyan
Write-Host ""

$found = $false
$patterns = @(
    "MOCK",
    "DUMMY",
    "PLACEHOLDER",
    "FAKE",
    "TODO:remove",
    "lorem ipsum",
    "test@test",
    "example\.com",
    "sampleData",
    "mockData",
    "dummyData",
    "fakeNews",
    "fakeTip"
)

foreach ($pattern in $patterns) {
    $results = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx |
        Select-String -Pattern $pattern -CaseSensitive

    if ($results) {
        Write-Host "⚠️  Found '$pattern':" -ForegroundColor Yellow
        $results | ForEach-Object { Write-Host "   $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" }
        Write-Host ""
        $found = $true
    }
}

# Check for mock directories
if (Test-Path "src/mocks") {
    Write-Host "⚠️  src/mocks/ directory exists — delete before release" -ForegroundColor Yellow
    $found = $true
}

if (Test-Path "src/__fixtures__") {
    Write-Host "⚠️  src/__fixtures__/ directory exists — delete before release" -ForegroundColor Yellow
    $found = $true
}

Write-Host ""
if (-not $found) {
    Write-Host "✅ No test artifacts found. Clean for release." -ForegroundColor Green
} else {
    Write-Host "❌ Test artifacts detected. Clean up before proceeding." -ForegroundColor Red
    exit 1
}