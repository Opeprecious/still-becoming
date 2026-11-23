# Tiny local web server for previewing the site (no installs needed).
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Then open http://localhost:5173
param([int]$Port = 5173)

$root = $PSScriptRoot
$types = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
  ".svg" = "image/svg+xml"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".webp" = "image/webp"
  ".gif" = "image/gif"; ".mp4" = "video/mp4"; ".webm" = "video/webm"; ".mp3" = "audio/mpeg"; ".m4a" = "audio/mp4"
  ".wav" = "audio/wav"; ".json" = "application/json"; ".ico" = "image/x-icon"; ".woff2" = "font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
      if ($rel -eq "") { $rel = "index.html" }
      $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
      if ($path.StartsWith($root) -and (Test-Path -LiteralPath $path -PathType Leaf)) {
        $bytes = [IO.File]::ReadAllBytes($path)
        $ext = [IO.Path]::GetExtension($path).ToLower()
        $ctx.Response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" })
        $ctx.Response.Headers.Add("Cache-Control", "no-store")
        # byte ranges, so audio and video can be scrubbed
        $start = 0; $end = $bytes.Length - 1
        $range = $ctx.Request.Headers["Range"]
        if ($range -match 'bytes=(\d*)-(\d*)') {
          if ($matches[1] -ne "") { $start = [int64]$matches[1] }
          if ($matches[2] -ne "") { $end = [Math]::Min([int64]$matches[2], $bytes.Length - 1) }
          if ($start -le $end) {
            $ctx.Response.StatusCode = 206
            $ctx.Response.Headers.Add("Content-Range", "bytes $start-$end/$($bytes.Length)")
          } else { $start = 0; $end = $bytes.Length - 1 }
        }
        $ctx.Response.Headers.Add("Accept-Ranges", "bytes")
        $len = $end - $start + 1
        $ctx.Response.ContentLength64 = $len
        $ctx.Response.OutputStream.Write($bytes, $start, $len)
      } else {
        $ctx.Response.StatusCode = 404
      }
    } catch {
      $ctx.Response.StatusCode = 500
    } finally {
      $ctx.Response.Close()
    }
  }
} finally {
  $listener.Stop()
}
