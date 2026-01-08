# @neohr/sdk

SDK for embedding NEO platform in your application via iframe with SSO authentication.

## Installation

### NPM
```bash
npm install @neohr/sdk
```

### Script Tag (CDN)
```html
<script src="https://unpkg.com/@neohr/sdk"></script>
```

## Quick Start

```typescript
import { createNeoSDK } from '@neohr/sdk';

const sdk = await createNeoSDK({
  neoOrigin: 'https://acme.neohr.io',
  mintToken: async () => {
    const res = await fetch('/mint', { method: 'POST' });
    const { jwt } = await res.json();
    return jwt;
  },
  redirectTo: '/people',
  container: document.getElementById('neo-container'),
  on: {
    ready: () => console.log('NEO iframe ready'),
    authenticated: () => console.log('User authenticated'),
    error: (err) => console.error('Error:', err),
    backdropVisible: () => console.log('Modal/drawer opened'),
    backdropHidden: () => console.log('Modal/drawer closed'),
  },
});
```

## Using an Existing iframe

```typescript
import { NeoSDK } from '@neohr/sdk';

const iframe = document.getElementById('my-iframe') as HTMLIFrameElement;

const sdk = new NeoSDK({
  neoOrigin: 'https://acme.neohr.io',
  mintToken: async () => {
    const res = await fetch('/mint', { method: 'POST' });
    const { jwt } = await res.json();
    return jwt;
  },
  iframe,
  redirectTo: '/people',
});

await sdk.init();
```

## Using via Script Tag

When loaded via `<script>` tag, the SDK is available as `window.NeoSDK`:

```html
<script src="https://unpkg.com/@neohr/sdk"></script>
<script>
  const sdk = new NeoSDK.NeoSDK({
    neoOrigin: 'https://acme.neohr.io',
    mintToken: async () => {
      const res = await fetch('/mint', { method: 'POST' });
      const { jwt } = await res.json();
      return jwt;
    },
    container: document.getElementById('neo-container'),
    redirectTo: '/people',
  });

  sdk.init();
</script>
```

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `neoOrigin` | `string` | Yes | NEO platform origin URL |
| `mintToken` | `() => Promise<string>` | Yes | Async function that returns a JWT from your backend |
| `redirectTo` | `string` | No | Initial path to navigate to after auth |
| `iframe` | `HTMLIFrameElement` | No | Existing iframe element to use |
| `container` | `HTMLElement` | No | Container for auto-created iframe (defaults to `document.body`) |
| `on` | `NeoSDKEventHandlers` | No | Event callbacks |

## Events

| Event | Description |
|-------|-------------|
| `ready` | Fired when the embed iframe is ready |
| `authenticated` | Fired when authentication is successful |
| `error` | Fired when token exchange fails |
| `tokenExpiring` | Fired when token is about to expire (SDK handles refresh automatically) |
| `backdropVisible` | Fired when a modal/drawer opens in NEO |
| `backdropHidden` | Fired when a modal/drawer closes in NEO |

## Methods

### `sdk.init()`
Initializes the SDK and starts the authentication flow.

### `sdk.getIframe()`
Returns the iframe element.

### `sdk.destroy(removeIframe?: boolean)`
Cleans up event listeners. Pass `true` (default) to also remove auto-created iframe.

## Backend Requirements

Your backend must implement:

1. **JWKS endpoint** at `/.well-known/jwks.json` exposing your public key
2. **Mint endpoint** (e.g., `POST /mint`) that returns a signed JWT with claims:

```json
{
  "iss": "https://your-issuer.com",
  "aud": "acme.neohr.io",
  "sub": "user-internal-id",
  "iat": 1756292417,
  "exp": 1756292447,
  "jti": "unique-uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin"
}
```

## License

MIT
