import { baseUrl } from "@/lib/baseUrl";
import { getSummaries, saveSummaries } from "@/lib/store";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { createMcpHandler } from "mcp-handler";
import z from "zod";

const RESOURCE_URI = "ui://summarizer/view.html";

const handler = createMcpHandler(
  (server) => {
    registerAppResource(
      server,
      "summarizer-view",
      RESOURCE_URI,
      {},
      async ()=> {
        const html = await fetch(baseUrl + "/").then(res=>res.text())
        return {
				  contents: [{
				    uri: RESOURCE_URI,
				    mimeType: RESOURCE_MIME_TYPE,
				    text: html,
				    _meta: {
				      ui: {
				        domain: baseUrl,
				        csp: {
				          connectDomains: [baseUrl],
				          resourceDomains: [baseUrl],
				        },
				      },
				    },
				  }]
				}
      }
    )
    registerAppTool(
      server,
      "get_summaries",
      {
        description: "요약정보를 조회합니다.",
        _meta: {ui: {resourceUri:RESOURCE_URI}}
      },
      async() => {
        const items = await getSummaries();
        return {
          content: [{type:"text", text: JSON.stringify(items)}]
        }
      },
    )
    server.registerTool(
      "save_summary",
      {
        description: "사용자가 요약 내용을 저장할 때 호출하는 툴",
        inputSchema: {
          title: z.string().describe("요약 제목"),
          category: z.string().describe("카테고리"),
          summary: z.string().describe("요약 내용")
        }
      },
      async ({title, category, summary}) => {
        const newItem = {
          id: crypto.randomUUID(),
          title,
          category,
          summary,
          createdAt: new Date().toISOString(),
        };
        const items = await getSummaries();
        items.push(newItem);
        await saveSummaries(items);
        return {
          content: [{type:"text", text: `저장 완료: ${title}`}]
        }
      }
    )
    server.registerTool(
      "update_summary",
      {
        description: "기존 요약 내용을 수정할 때 호출하는 툴",
        inputSchema: {
          id: z.string().describe("수정할 요약의 ID"),
          title: z.string().optional().describe("새 제목"),
          category: z.string().optional().describe("새 카테고리"),
          summary: z.string().optional().describe("새 요약 내용"),
        },
      },
      async ({ id, ...fields }) => {
        const items = await getSummaries();
        const item = items.find((s) => s.id === id);
        if (!item) {
          return {
            content: [{ type: "text", text: `오류: ID ${id} 를 찾을 수 없습니다.` }],
          };
        }
        Object.assign(item, fields);
        await saveSummaries(items);
        return {
          content: [{ type: "text", text: `수정 완료: ${item.title}` }],
        };
      }
    )
    server.registerTool(
      "delete_summary",
      {
        description: "요약을 삭제할 때 호출하는 툴",
        inputSchema: {
          id: z.string().describe("삭제할 요약의 ID"),
        },
      },
      async ({ id }) => {
        const items = await getSummaries();
        const index = items.findIndex((s) => s.id === id);
        if (index === -1) {
          return {
            content: [{ type: "text", text: `오류: ID ${id} 를 찾을 수 없습니다.` }],
          };
        }
        const [deleted] = items.splice(index, 1);
        await saveSummaries(items);
        return {
          content: [{ type: "text", text: `삭제 완료: ${deleted.title}` }],
        };
      }
    )
  },
  {},
  { basePath: "/api", maxDuration: 60}
);

export {handler as GET, handler as POST}
