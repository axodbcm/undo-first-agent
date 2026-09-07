$ErrorActionPreference = "Stop"

Write-Host "Undo-First Agent / T3N local connection"
Write-Host "The API key will not be printed or written to a file."

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectRoot

$secureKey = Read-Host "Paste your T3N API key (input is hidden)" -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
  $env:T3N_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  $env:T3N_ENV = "sandbox"
  npm run t3n:check
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  Remove-Variable secureKey -ErrorAction SilentlyContinue
  Remove-Variable keyPointer -ErrorAction SilentlyContinue
  Remove-Item Env:T3N_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:T3N_ENV -ErrorAction SilentlyContinue
}
