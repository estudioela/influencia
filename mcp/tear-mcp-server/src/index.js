const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const { environmentStatus } = require("./tools/environment.js");

const server = new Server(
  {
    name: "tear-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);


// ================================
// LISTA DE FERRAMENTAS DISPONÍVEIS
// ================================

server.setRequestHandler(
  ListToolsRequestSchema,
  async () => ({
    tools: [
      {
        name: "tear_environment_status",
        description:
          "Retorna informações reais do ambiente atual do projeto TEAR.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  })
);


// ================================
// EXECUÇÃO DAS FERRAMENTAS
// ================================

server.setRequestHandler(
  CallToolRequestSchema,
  async (request) => {

    switch (request.params.name) {

      case "tear_environment_status":

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                environmentStatus(),
                null,
                2
              ),
            },
          ],
        };


      default:

        throw new Error(
          `Ferramenta desconhecida: ${request.params.name}`
        );
    }
  }
);


// ================================
// INICIALIZAÇÃO DO SERVIDOR MCP
// ================================

async function main() {

  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error(
    "TEAR MCP Server iniciado"
  );
}


main();