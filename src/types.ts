/**
 * Configuration options for initializing the NEO SDK
 */
export interface NeoSDKConfig {
  /**
   * The NEO platform origin URL (e.g., 'https://acme.neohr.io')
   */
  neoOrigin: string;

  /**
   * Async function that returns a JWT token from your backend
   */
  mintToken: () => Promise<string>;

  /**
   * Initial redirect path after authentication (e.g., '/people')
   */
  redirectTo?: string;

  /**
   * Existing iframe element to use. If not provided, one will be created.
   */
  iframe?: HTMLIFrameElement;

  /**
   * Container element to append the iframe to (if iframe not provided)
   * Defaults to document.body
   */
  container?: HTMLElement;

  /**
   * Event callbacks
   */
  on?: NeoSDKEventHandlers;
}

/**
 * Event handlers for NEO SDK events
 */
export interface NeoSDKEventHandlers {
  /**
   * Called when the embed iframe is ready
   */
  ready?: () => void;

  /**
   * Called when authentication is successful
   */
  authenticated?: () => void;

  /**
   * Called when token exchange fails
   */
  error?: (error: NeoError) => void;

  /**
   * Called when token is about to expire
   */
  tokenExpiring?: () => void;

  /**
   * Called when a modal or drawer becomes visible in NEO
   */
  backdropVisible?: () => void;

  /**
   * Called when a modal or drawer is hidden in NEO
   */
  backdropHidden?: () => void;

  /**
   * Called when the route changes in NEO
   */
  routeChange?: (path: string) => void;
}

/**
 * Error object for NEO SDK errors
 */
export interface NeoError {
  type: 'token_exchange_error' | 'mint_error' | 'provisioning_conflict_error' | 'unknown';
  message: string;
}

/**
 * Message types sent from NEO to Host
 */
export type NeoToHostMessage =
  | { type: 'neo_embed_ready' }
  | { type: 'neo_token_expired' }
  | { type: 'neo_provisioning_conflict_error' }
  | { type: 'neo_exchange_token_error' }
  | { type: 'neo_backdrop_visible' }
  | { type: 'neo_backdrop_hidden' }
  | { type: 'neo_route_change', path: string}

/**
 * Message types sent from Host to NEO
 */
export type HostToNeoMessage = {
  type: 'neo_exchange_token';
  jwt: string;
  redirectTo?: string;
};
