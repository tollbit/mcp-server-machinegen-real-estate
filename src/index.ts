#!/usr/bin/env node

/**
 * MCP server for Machine Generated Content Feed API
 * Provides tools to search, filter, and retrieve US residential real estate market reports from the Content Feed API
 * Designed for easy discovery and use by LLMs
 * 
 * Note: Report is capitalized.
 * "unique_entity_type": [
    "Report",
    "city"
  ]
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "https://feeds.parsym.com";
const FEED_ID = process.env.FEED_ID || "292";
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
  console.error("API_KEY and SECRET_KEY must be provided in environment variables");
  process.exit(1);
}

// API Client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'api-key': API_KEY,
    'secret': SECRET_KEY
  }
});

// Create MCP server
const server = new Server(
  {
    name: "real-estate-feed-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools with comprehensive descriptions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_available_entity_types",
        description: "Get a list of all available entity types in the real estate content feed that can be used for filtering content",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "list_entity_values",
        description: "Get all available values for a specific entity type (e.g., all report types, all city names",
        inputSchema: {
          type: "object",
          properties: {
            entity_type: {
              type: "string",
              description: "The entity type to get values for (e.g., 'Report', 'city')"
            }
          },
          required: ["entity_type"]
        }
      },
      {
        name: "search_by_report_type",
        description: "Search for real estate content by report type. Use list_report_types first if you're unsure about the exact report type to use.",
        inputSchema: {
          type: "object",
          properties: {
            report_type: {
              type: "string",
              description: "Report type to search for (e.g., 'Market Report', 'Price Analysis', etc.)"
            },
            page_num: {
              type: "integer",
              description: "Page number for pagination (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page (1-50)",
              default: 10
            }
          },
          required: ["report_type"]
        }
      },
      {
        name: "lookup_cities",
        description: "Get the exact city name formats available in the database before searching. Use this to find the correct city name format for use with search_by_city.",
        inputSchema: {
          type: "object",
          properties: {
            partial_name: {
              type: "string",
              description: "Partial city name to find matches for (e.g., 'New York', 'Los Angeles')"
            }
          },
          required: ["partial_name"]
        }
      },
      {
        name: "search_by_city",
        description: "Search for real estate content by city name. IMPORTANT: The API requires exact city name matching. Use lookup_cities first to find the correct name format to use.",
        inputSchema: {
          type: "object",
          properties: {
            city_name: {
              type: "string",
              description: "Exact city name to search for (must match format in database exactly)"
            },
            page_num: {
              type: "integer",
              description: "Page number for pagination (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page (1-50)",
              default: 10
            }
          },
          required: ["city_name"]
        }
      },
      {
        name: "list_report_types",
        description: "Get a list of all available report types in the database",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "search_reports_by_date_range",
        description: "Search for real estate content published within a specific date range",
        inputSchema: {
          type: "object",
          properties: {
            start_date: {
              type: "string",
              description: "Start date in YYYY-MM-DD format"
            },
            end_date: {
              type: "string",
              description: "End date in YYYY-MM-DD format"
            },
            page_num: {
              type: "integer",
              description: "Page number for pagination (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page (1-50)",
              default: 10
            }
          },
          required: ["start_date", "end_date"]
        }
      },
      {
        name: "advanced_content_search",
        description: "Advanced search for real estate content with multiple filter criteria",
        inputSchema: {
          type: "object",
          properties: {
            published_date_from: {
              type: "string",
              description: "Start date in YYYY-MM-DD format"
            },
            published_date_to: {
              type: "string",
              description: "End date in YYYY-MM-DD format"
            },
            page_num: {
              type: "integer",
              description: "Page number for pagination (0-based)",
              default: 0
            },
            page_size: {
              type: "integer",
              description: "Number of items per page (1-50)",
              default: 10
            },
            entity_details: {
              type: "array",
              description: "List of entity filters to apply (e.g., report type, city)",
              items: {
                type: "object",
                properties: {
                  entity_type: {
                    type: "string",
                    description: "Type of entity to filter by (e.g., 'Report', 'city')"
                  },
                  entity_value: {
                    type: "string",
                    description: "Value of the entity to filter by. IMPORTANT: The API requires exact city name matching when filtering by city. Use lookup_cities first to find the correct name format to use."
                  }
                },
                required: ["entity_type", "entity_value"]
              }
            }
          },
          required: ["page_num", "page_size"]
        }
      },
      {
        name: "get_latest_market_report_by_city",
        description: "Get the latest market report for a specific city. Use lookup_cities first if you're unsure of the exact city name.",
        inputSchema: {
          type: "object",
          properties: {
            city_name: {
              type: "string",
              description: "City name (e.g., 'New York', 'Los Angeles')"
            }
          },
          required: ["city_name"]
        }
      },
      {
        name: "get_latest_price_analysis_by_city",
        description: "Get the latest price analysis report for a specific city",
        inputSchema: {
          type: "object",
          properties: {
            city_name: {
              type: "string",
              description: "City name (e.g., 'New York', 'Los Angeles')"
            }
          },
          required: ["city_name"]
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const toolName = request.params.name;
    const args = request.params.arguments as any;

    switch (toolName) {
      case "list_available_entity_types": {
        const response = await apiClient.get(`/api/content/entity_types/${FEED_ID}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }

      case "list_entity_values": {
        const response = await apiClient.get(`/api/content/entity_values/${FEED_ID}`, {
          params: { entity_type: args.entity_type }
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }
      
      case "lookup_cities": {
        // First get all city entities
        const response = await apiClient.get(`/api/content/entity_values/${FEED_ID}`, {
          params: { entity_type: "city" }
        });
        
        // Filter cities that match the partial name (case insensitive)
        const partialNameLower = args.partial_name.toLowerCase();
        const matchedCities = response.data.unique_entity_value.filter(
          (city: string) => city.toLowerCase().includes(partialNameLower)
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "success",
              matched_cities: matchedCities,
              count: matchedCities.length,
              usage_note: "Use one of these exact city names with the search_by_city tool"
            }, null, 2)
          }]
        };
      }

      case "search_by_report_type": {
        const response = await apiClient.post('/api/content/feed', {
          feed_id: parseInt(FEED_ID),
          page_num: args.page_num || 0,
          page_size: args.page_size || 10,
          entity_details: [
            {
              entity_type: "Report",
              entity_value: args.report_type
            }
          ]
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }

      case "search_by_city": {
        const response = await apiClient.post('/api/content/feed', {
          feed_id: parseInt(FEED_ID),
          page_num: args.page_num || 0,
          page_size: args.page_size || 10,
          entity_details: [
            {
              entity_type: "city",
              entity_value: args.city_name
            }
          ]
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }

      case "search_reports_by_date_range": {
        const response = await apiClient.post('/api/content/feed', {
          feed_id: parseInt(FEED_ID),
          published_date_from: args.start_date,
          published_date_to: args.end_date,
          page_num: args.page_num || 0,
          page_size: args.page_size || 10
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }

      case "advanced_content_search": {
        const response = await apiClient.post('/api/content/feed', {
          feed_id: parseInt(FEED_ID),
          published_date_from: args.published_date_from,
          published_date_to: args.published_date_to,
          page_num: args.page_num,
          page_size: args.page_size,
          entity_details: args.entity_details
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }

      case "get_latest_market_report_by_city": {
        const response = await apiClient.post('/api/content/feed', {
          feed_id: parseInt(FEED_ID),
          page_num: 0,
          page_size: 1,
          entity_details: [
            {
              entity_type: "city",
              entity_value: args.city_name
            },
            {
              entity_type: "Report",
              entity_value: "Monthly Report: Major Cities"
            }
          ]
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }

      case "get_latest_price_analysis_by_city": {
        const response = await apiClient.post('/api/content/feed', {
          feed_id: parseInt(FEED_ID),
          page_num: 0,
          page_size: 1,
          entity_details: [
            {
              entity_type: "city",
              entity_value: args.city_name
            },
            {
              entity_type: "Report",
              entity_value: "Monthly Report: Major Cities"
            }
          ]
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      }
      
      case "list_report_types": {
        // Get all report types from the Report entity
        const response = await apiClient.get(`/api/content/entity_values/${FEED_ID}`, {
          params: { entity_type: "Report" }
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "success",
              report_types: response.data.unique_entity_value,
              count: response.data.unique_entity_value.length,
              usage_note: "Use one of these exact report types with search_by_report_type tool"
            }, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
    console.error("Tool error:", errorMessage);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "error",
          message: errorMessage,
          details: error.response?.data || null
        }, null, 2)
      }]
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.exit(1);
});
