/**
 * SOAP client for SAM v2 API
 */

const ENDPOINTS = {
  dics: 'https://apps.samdb.ehealth.fgov.be/samv2/dics/v5',
  amp: 'https://apps.samdb.ehealth.fgov.be/samv2/consult/amp',
  vmp: 'https://apps.samdb.ehealth.fgov.be/samv2/consult/vmp',
  company: 'https://apps.samdb.ehealth.fgov.be/samv2/consult/company',
  rmb: 'https://apps.samdb.ehealth.fgov.be/samv2/consult/rmb',
} as const;

export type EndpointType = keyof typeof ENDPOINTS;

export interface SoapClientOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_OPTIONS: Required<SoapClientOptions> = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

/**
 * Delays execution for the specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Makes a SOAP request with retry logic and exponential backoff
 */
export async function soapRequest(
  endpoint: EndpointType,
  soapXml: string,
  options: SoapClientOptions = {}
): Promise<string> {
  const { timeout, retries, retryDelay } = { ...DEFAULT_OPTIONS, ...options };
  const url = ENDPOINTS[endpoint];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '',
        },
        body: soapXml,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      return responseText;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
      }

      // Wait before retrying with exponential backoff
      if (attempt < retries) {
        const backoffDelay = retryDelay * Math.pow(2, attempt);
        await delay(backoffDelay);
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Gets the URL for an endpoint
 */
export function getEndpointUrl(endpoint: EndpointType): string {
  return ENDPOINTS[endpoint];
}

/**
 * Checks if a SOAP response contains a fault
 */
export function isSoapFault(xml: string): boolean {
  return xml.includes('Fault') || xml.includes('faultcode');
}
