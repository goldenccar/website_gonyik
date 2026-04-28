Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
WshShell.Run "cmd /c npx tsx server/index.ts", 0, False
WScript.Sleep 3000
WshShell.Run "http://localhost:3001"
Set WshShell = Nothing
