# Webhooks in Madoc

Webhooks are available in Madoc to do 2 functions - respond to external events with a defined internal process OR to send external events when an internal process happens.

The following internal events are supported:
- `test-event` - manually triggered from the admin for testing

They are defined in `webhook-events.ts`.

In Madoc, if an internal event happens a webhook call can be triggered using:
```ts
api.webhooks.executeWebhook(eventId, { some: 'payload '});
```

This will ONLY work for users with a `site.admin` role OR the server.

### Madoc provided Webhooks

On the server (only) a webhook URL can be generated.

```ts
const url = await ctx.webhookExtension.generateWebhookUrl(
  site,
  'my-event',
  1000, // expiry
  false // true -> internal docker gateway URL
)
```

This URL can be posted to and will trigger the `test-event` webhook internally.

### Madoc configured webhooks

When a webhook is triggered by Madoc, either internally using the `executeWebhook` or externally using the generated URL it will do three things:
- Look up the database for configured external webhooks
- Look up plugin registry for any configured hooks
- Look for in-code hooks

Using the `event_id` it will produce a list of actions to run, either running code or making a further external webhook call outside of Madoc.

This essentially allows for webhooks in Madoc to further trigger webhooks outside of Madoc in addition to running some code internally.

Webhooks cannot conditionally be called for specific contexts or subjects - but that could be added in the future. At the moment the only distinction is the `event_id` and every configured webhook or hook will be called when that event comes in.
