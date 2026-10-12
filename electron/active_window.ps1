Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WinTitle {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    public static string GetActive() {
        StringBuilder sb = new StringBuilder(256);
        IntPtr handle = GetForegroundWindow();
        GetWindowText(handle, sb, 256);
        return sb.ToString();
    }
}
"@
[WinTitle]::GetActive()
