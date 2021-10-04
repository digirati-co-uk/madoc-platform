# Gateway2

Implements: https://www.nginx.com/blog/validating-oauth-2-0-access-tokens-nginx/
https://www.nginx.com/resources/wiki/start/topics/examples/full/

- Simple NGINX configuration
- Micro-management API
- Auth endpoint in Madoc TS to validate everything (is cached for minutes)
- Madoc TS will use lighter runtime (similar to queue)

## Kubernetes

Should be simple enough to translate over to Kubernetes.

https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md#external-authentication


## New service creation
When we have the shared database configurable, this will be a fairly simple process.

1) Create a nginx config and volume/copy it to `/var/nginx/custom/my-api.conf`

```nginx configuration
location /api/my-api {
  proxy_pass http://some_internal_host:8000/
  include /var/nginx/includes/jwt-auth.conf
}
```

2) Volume in or copy a database config:
```yaml
name: my_custom_api
schema: my_custom_api
password: ${{MY_API_PASSWORD}}
database: postgres
update_search_path: true
extensions:
  - uuid-ossp
  - ltree
```

3) Register any webhooks with Madoc (volume in config). This can be used to integrate with the queue and handle custom task events.
```yaml
webhooks:
  - label: My API handling crowdsourcing task completion
    event: task.status
    config:
      task_type: crowdsourcing-task
      task_status: 3
    endpoint: http://some_internal_host:8000/handle_task_status
  - label: My API handling custom task
    event: 
      - task.modified
      - task.created
    config:
      task_type: my-custom-task
    endpoint: http://some_internal_host:8000/handle_my_task
```

4) Add custom web blocks (volume in config). This can be used to add custom HTML components to the frontend page builder, constructed using HTML provided by your service.
```yaml
webblocks:
  - label: My custom webblock
    type: my_api/my_webblock
    defaultProps: 
      some_value: ''
    proxy:
      endpoint: /api/my_api/webblock/my_webblock
      context: true # If set to false, the context will not be in the cache-key
      jwt: true # If set to false, this block will be cached and no user data provided.
      format: html # Can be JSON, where scripts/styles/html can be returned
      cacheTime: 3600
      scripts:
        - http://some-required-library/bundle.js # Avoids it being loaded more than once.
    requiredContext:
      - manifest
      - canvas
    model:
      some_value: { type: 'text-field', label: 'Some Value' }
    schema:
      properties:
        some_value: { type: 'text' }
      required: ['some_value']
```

5) Add custom pages
```yaml
pages: 
  - label: My custom page
    routes: 
      - path: /my_api/custom_page/:id
        params: ['id']
      - path: /manifests/:manifestId/my_custom_page
        params: ['manifestId']
        context: true
    headless: false # If headless, this will be a full page proxy, otherwise in React
    proxy:
      endpoint: /api/my_api/pages/my_page
      context: false # If you create a custom page UNDER an existing context (e.g. /manifests/:manifestId/my_page)
      jwt: true # If set to false, this block will be cached and no user data provided.
      format: html # Can be JSON, where scripts/styles/html can be returned
      cacheTime: 3600
```

6) Add any plugins / themes / translations
7) Start the containers

This new service would require a valid JWT like the other services, and be able
to connect to its own database within the shared postgres. Listen to existing madoc events to kick off custom workflows, display your own data on custom pages, page blocks written in React or any HTML creating service. 
