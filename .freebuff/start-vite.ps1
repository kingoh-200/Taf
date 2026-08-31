Set-Location "C:\Users\ADMIN\OneDrive\Desktop\Taf\Frontend"
$env:PORT = "5173"
& "C:\Program Files\nodejs\node.exe" "node_modules\vite\bin\vite.js" --port 5173 --host 2>&1 | Tee-Object -FilePath "C:\Users\ADMIN\OneDrive\Desktop\Taf\.freebuff\preview.log"
