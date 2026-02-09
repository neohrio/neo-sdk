import type {
  NeoSDKConfig,
  NeoSDKEventHandlers,
  NeoToHostMessage,
  HostToNeoMessage,
  NeoError,
} from './types';

export type * from './types';

/**
 * NEO SDK for embedding the NEO platform in your application
 */
export class NeoSDK {
  private config: NeoSDKConfig;
  private iframe: HTMLIFrameElement;
  private isInitialized = false;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  constructor(config: NeoSDKConfig) {
    this.config = config;
    this.iframe = config.iframe ?? this.createIframe();
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

    const container = this.config.container ?? document.body;
    container.appendChild(iframe);

    return iframe;
  }

  /**
   * Initialize the SDK and start the authentication flow
   */
  async init(): Promise<void> {
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);

    this.iframe.src = `${this.config.neoOrigin}/organization/embed/boot`;
  }

  /**
   * Navigate to a path in the NEO platform
   */
  navigate(path: string): void {
    this.iframe.contentWindow?.postMessage({
      type: 'neo_navigate',
      path,
    }, this.config.neoOrigin);
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (event.origin !== this.config.neoOrigin) {
      return;
    }

    if (event.source !== this.iframe.contentWindow) {
      return;
    }

    const data = event.data as NeoToHostMessage;

    switch (data.type) {
      case 'neo_embed_ready':
        await this.handleReady();
        break;

      case 'neo_token_expired':
        await this.handleTokenExpired();
        break;

      case 'neo_provisioning_conflict_error':
        this.handleError({
          type: 'provisioning_conflict_error',
          message: 'Failed to provision user',
        });
        break;

      case 'neo_exchange_token_error':
        this.handleError({
          type: 'token_exchange_error',
          message: 'Failed to exchange token with NEO platform',
        });
        break;

      case 'neo_backdrop_visible':
        this.config.on?.backdropVisible?.();
        break;

      case 'neo_backdrop_hidden':
        this.config.on?.backdropHidden?.();
        break;

      case 'neo_route_change':
        this.config.on?.routeChange?.(data.path);
        break;
    }
  }

  private async handleReady(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    this.config.on?.ready?.();

    await this.exchangeToken(true);
  }

  private async handleTokenExpired(): Promise<void> {
    this.config.on?.tokenExpiring?.();
    await this.exchangeToken(false);
  }

  private async exchangeToken(includeRedirect: boolean): Promise<void> {
    try {
      const jwt = await this.config.mintToken();

      const message: HostToNeoMessage = {
        type: 'neo_exchange_token',
        jwt,
        ...(includeRedirect && this.config.redirectTo
          ? { redirectTo: this.config.redirectTo }
          : {}),
      };

      this.iframe.contentWindow?.postMessage(message, this.config.neoOrigin);

      if (includeRedirect) {
        this.config.on?.authenticated?.();
      }
    } catch (error) {
      this.handleError({
        type: 'mint_error',
        message: error instanceof Error ? error.message : 'Failed to mint token',
      });
    }
  }

  private handleError(error: NeoError): void {
    this.config.on?.error?.(error);
  }

  /**
   * Get the iframe element
   */
  getIframe(): HTMLIFrameElement {
    return this.iframe;
  }

  /**
   * Clean up event listeners and optionally remove the iframe
   */
  destroy(removeIframe = true): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    if (removeIframe && !this.config.iframe) {
      this.iframe.remove();
    }

    this.isInitialized = false;
  }
}

/**
 * Create and initialize a NeoSDK instance
 */
export async function createNeoSDK(config: NeoSDKConfig): Promise<NeoSDK> {
  const sdk = new NeoSDK(config);
  await sdk.init();
  return sdk;
}

export default NeoSDK;
