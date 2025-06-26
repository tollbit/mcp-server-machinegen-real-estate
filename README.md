# MCP Server for Machine Generated Content Feed API

This is a Model Context Protocol (MCP) server that integrates with the Machine Generated Content Feed API from [parsym.com](https://www.parsym.com/feeds) for feed #292 US Residential Real Estate Market Reports.

## Features

- Get entity types available for feed #292
- Get entity values for feed #292 and entity type
- Fetch real estate content with optional filters for dates, pagination, and entities

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file with the following variables:

```
API_BASE_URL=https://contentfeedapi.machinegenerated.com
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
```

You must obtain a valid API key and secret from the service provider.

## Usage

### Running the server directly

```bash
npm start
```

### Integration with Claude Desktop

1. Open Claude Desktop Settings
2. Add a new MCP server configuration
3. Set the command to the absolute path of the built server executable

Example configuration:

```json
{
  "mcp-server-machinegen": {
    "command": "/absolute/path/to/mcp-server-machinegen/build/index.js"
  }
}
```

## Available Tools

The server provides the following tools based on the Content Feed API:

### 1. `list_available_entity_types`
Gets entity types available for feed ID 292.

### 2. `list_entity_values`
Gets entity values for feed ID 292 and entity type.
- Parameters:
  - `entity_type` (optional) - Entity type to filter values by

### 3. `search_by_report_type`
Searches for real estate content by report type.
- Parameters:
  - `report_type` (required) - Report type to search for (e.g., 'Market Report', 'Price Analysis')
  - `page_num` (optional) - Page number (0-indexed, default: 0)
  - `page_size` (optional) - Number of items per page (default: 10)

### 4. `lookup_cities`
Gets the exact city name formats available in the database before searching.
- Parameters:
  - `partial_name` (required) - Partial city name to find matches for

### 5. `search_by_city`
Searches for real estate content by city name.
- Parameters:
  - `city_name` (required) - Exact city name to search for
  - `page_num` (optional) - Page number (0-indexed, default: 0)
  - `page_size` (optional) - Number of items per page (default: 10)

### 6. `list_report_types`
Gets a list of all available report types in the database.

### 7. `search_reports_by_date_range`
Searches for real estate content published within a specific date range.
- Parameters:
  - `start_date` (required) - Start date in YYYY-MM-DD format
  - `end_date` (required) - End date in YYYY-MM-DD format
  - `page_num` (optional) - Page number (0-indexed, default: 0)
  - `page_size` (optional) - Number of items per page (default: 10)

### 8. `advanced_content_search`
Advanced search for real estate content with multiple filter criteria.
- Parameters:
  - `published_date_from` (optional) - Start date in YYYY-MM-DD format
  - `published_date_to` (optional) - End date in YYYY-MM-DD format
  - `page_num` (required) - Page number (0-indexed)
  - `page_size` (required) - Number of items per page
  - `entity_details` (optional) - List of entity filters to apply

### 9. `get_latest_market_report_by_city`
Gets the latest market report for a specific city.
- Parameters:
  - `city_name` (required) - City name (e.g., 'New York', 'Los Angeles')

### 10. `get_latest_price_analysis_by_city`
Gets the latest price analysis report for a specific city.
- Parameters:
  - `city_name` (required) - City name (e.g., 'New York', 'Los Angeles')

## Entity Types

The server works with the following entity types:
- **Report**: Different types of real estate reports (e.g., Market Report, Price Analysis)
- **city**: City names for filtering content by location

## Using with MCP Clients

This server is compatible with any MCP client that supports tools, including:

- Claude Desktop App
- Cursor
- Continue
- Many others

Refer to the [Model Context Protocol documentation](https://modelcontextprotocol.io) for more information on MCP clients.

## Development

To run the server in development mode with automatic rebuilding:

```bash
npm run watch
```

## API Documentation

The full API documentation is available at [contentfeedapi.machinegenerated.com/swagger.json](https://contentfeedapi.machinegenerated.com/swagger.json).

## License

ISC
