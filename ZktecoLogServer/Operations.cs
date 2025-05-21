using ZktecoLogServer;
using System.Threading.Tasks;
using System.Threading;
using System;
using ZKT;

public class Operations
{
    private readonly LogBroadcaster _broadcaster;
    private Pullsdk _sdk = new();

    public Operations(LogBroadcaster broadcaster)
    {
        _broadcaster = broadcaster;
    }

    public void StartRealTimeLog()
    {
        Console.WriteLine("Launching RTLog threads...");
        var controllerIps = new[]
        {
            "192.168.1.200", "192.168.1.201", "192.168.1.202",
             "192.168.1.205", "192.168.1.206",
            "192.168.1.207", "192.168.1.208" , "192.168.1.209"
        };

        foreach (var ip in controllerIps)
        {
            var copyIp = ip; // prevent closure issue


            Task.Run(() => ListenToRTLog(copyIp));
        }
    }

    private void ListenToRTLog(string ip)
    {
        string connectionStr = $"protocol=TCP,ipaddress={ip},port=4370,timeout=4000,passwd=";
        IntPtr handle = Pullsdk.Connect(connectionStr);
        Console.WriteLine($"Connecting to {ip}...");

        if (handle == IntPtr.Zero)
        {
            Console.WriteLine($"[ERROR] Failed to connect to {ip}. Code: {Pullsdk.PullLastError()}");
            return;
        }

        Console.WriteLine($"[✓] Connected to {ip} for RTLog");

        try
        {
            while (true)
            {
                byte[] buffer = new byte[64 * 1024];
                int ret = Pullsdk.GetRTLog(handle, ref buffer[0], buffer.Length);
                Console.WriteLine($"[{ip}] Polling for logs...");

                if (ret > 0)
                {
                    string logData = System.Text.Encoding.Default.GetString(buffer).Trim();

                    // Some logs might be concatenated, split lines
                    var lines = logData.Split('\n', StringSplitOptions.RemoveEmptyEntries);

                    foreach (var rawLine in lines)
                    {
                        string line = rawLine.Trim();
                        string[] parts = line.Split(',');

                        if (parts.Length >= 7)
                        {
                            string timestamp = parts[0];
                            string pin = parts[1];
                            string card = parts[2];
                            string door = parts[3];
                            string eventType = parts[4];

                            // ✅ Only access-related events
                            if (card != "0")
                            {
                                var structuredLog = new
                                {
                                    ip,
                                    timestamp,
                                    card,
                                    door,
                                    status = "Access Event",
                                    raw = line
                                };

                                // ✅ Send to frontend
                                _broadcaster.Broadcast(ip, System.Text.Json.JsonSerializer.Serialize(structuredLog)).Wait();
                                Console.WriteLine($"[✓] Access Event @ {ip} - Card {card}, Door {door}");
                            }
                        }
                    }
                }

                Thread.Sleep(1000);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EXCEPTION] RTLog for {ip}: {ex.Message}");
        }
        finally
        {
            Pullsdk.Disconnect(handle);
            Console.WriteLine($"[x] Disconnected from {ip}");
        }
    }

}