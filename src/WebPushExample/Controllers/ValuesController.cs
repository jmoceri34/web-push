using Newtonsoft.Json;
using WebPushExample.Models;
using System.Collections.Generic;
using System.Configuration;
using System.Web.Http;
using WebPush;

namespace WebPushExample.Controllers
{
    public class ValuesController : ApiController
    {
        // GET api/values
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        public void Post([FromBody]PushNotification pushNotification)
        {
            var vapidPublicKey = ConfigurationManager.AppSettings["VapidPublicKey"];
            var vapidPrivateKey = ConfigurationManager.AppSettings["VapidPrivateKey"];

            var pushSubscription = new PushSubscription(pushNotification.PushEndpoint, pushNotification.PushP256DH, pushNotification.PushAuth);
            var vapidDetails = new VapidDetails("mailto:example@example.com", vapidPublicKey, vapidPrivateKey);

            var webPushClient = new WebPushClient();
            webPushClient.SendNotification(pushSubscription, JsonConvert.SerializeObject(pushNotification), vapidDetails);
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
