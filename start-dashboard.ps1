Set-Location "C:\ailo-marketer"

$BundledNode = "C:\Users\ksh55\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$NodeExe = if (Test-Path $BundledNode) { $BundledNode } else { "node" }

$Existing = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($Existing) {
  Write-Host "AILO dashboard is already running at http://127.0.0.1:4173"
  exit 0
}

$Psi = New-Object System.Diagnostics.ProcessStartInfo
$Psi.FileName = $NodeExe
$Psi.Arguments = "src/server.js"
$Psi.WorkingDirectory = "C:\ailo-marketer"
$Psi.UseShellExecute = $false
$Psi.CreateNoWindow = $true

try {
  if ($Psi.EnvironmentVariables -and $Psi.EnvironmentVariables.ContainsKey("Path") -and $Psi.EnvironmentVariables.ContainsKey("PATH")) {
    $Psi.EnvironmentVariables.Remove("Path")
  }
} catch {
  # Some Windows hosts expose only one environment dictionary. Starting still works without this cleanup.
}

[System.Diagnostics.Process]::Start($Psi) | Out-Null
Start-Sleep -Seconds 2

$Ready = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($Ready) {
  Write-Host "AILO dashboard running at http://127.0.0.1:4173"
} else {
  Write-Error "AILO dashboard did not start. Run node src/server.js from C:\ailo-marketer to view the error."
  exit 1
}
