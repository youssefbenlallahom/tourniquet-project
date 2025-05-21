using Microsoft.AspNetCore.SignalR;

namespace ZktecoLogServer
{
    public class LogBroadcaster
    {
        private readonly IHubContext<LogHub> _hubContext;

        public LogBroadcaster(IHubContext<LogHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task Broadcast(string ip, string message)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLog", new { ip, message });
        }
    }
}
