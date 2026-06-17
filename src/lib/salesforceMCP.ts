
export interface MCPResponse {
  tools?: Array<{
    name: string;
    description: string;
    inputSchema: any;
  }>;
  resources?: Array<{
    uri: string;
    name: string;
    description: string;
  }>;
}

export class SalesforceMCPService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SALESFORCE_MCP_URL || 'https://api.salesforce.com/platform/mcp/v1/sandbox/platform';
    this.apiKey = import.meta.env.VITE_SALESFORCE_API_KEY || '';
  }

  async listTools() {
    try {
      const response = await fetch(`${this.baseUrl}/tools`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch MCP tools');
      return await response.json();
    } catch (error) {
      console.error('Error listing MCP tools:', error);
      return null;
    }
  }

  async callTool(name: string, arguments_: any) {
    try {
      const response = await fetch(`${this.baseUrl}/tools/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          arguments: arguments_
        })
      });
      if (!response.ok) throw new Error(`Failed to call tool: ${name}`);
      return await response.json();
    } catch (error) {
      console.error(`Error calling MCP tool ${name}:`, error);
      throw error;
    }
  }

  /**
   * Fetches the SObject metadata from the specific endpoint provided by the user
   */
  async getSObjectMetadata() {
    try {
      const url = 'https://api.salesforce.com/platform/mcp/v1/sandbox/platform/sobject-all';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch SObject metadata');
      return await response.json();
    } catch (error) {
      console.error('Error fetching SObject metadata:', error);
      return null;
    }
  }
}

export const salesforceMCP = new SalesforceMCPService();
