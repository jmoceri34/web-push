using Newtonsoft.Json;

namespace WebPushExample.Models
{
    public class PushNotification
    {
        [JsonProperty(PropertyName = "title")]
        public string Title { get; set; }

        [JsonProperty(PropertyName = "message")]
        public string Message { get; set; }

        [JsonProperty(PropertyName = "url")]
        public string Url { get; set; }

        public string PushEndpoint { get; set; }

        public string PushP256DH { get; set; }

        public string PushAuth { get; set; }
    }
}