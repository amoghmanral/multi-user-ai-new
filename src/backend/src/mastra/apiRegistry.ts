import { registerApiRoute } from '@mastra/core/server';
import { ChatInputSchema, ChatOutput, chatWorkflow } from './workflows/chatWorkflow';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { createSSEStream } from '../utils/streamUtils';
import { multiUserRoutes } from './multiUserRoutes';

// Helper function to convert Zod schema to OpenAPI schema
function toOpenApiSchema(schema: Parameters<typeof zodToJsonSchema>[0]) {
  return zodToJsonSchema(schema) as Record<string, unknown>;
}

/**
 * API routes for the Mastra backend
 *
 * These routes handle chat interactions between the Cedar-OS frontend
 * and your Mastra agents. The chat UI will automatically use these endpoints.
 *
 * - /chat: Standard request-response chat endpoint
 * - /chat/stream: Server-sent events (SSE) endpoint for streaming responses
 * - Multi-user chat routes for rooms, users, and file uploads
 */
export const apiRoutes = [
  registerApiRoute('/chat/stream', {
    method: 'POST',
    openapi: {
      requestBody: {
        content: {
          'application/json': {
            schema: toOpenApiSchema(ChatInputSchema),
          },
        },
      },
    },
    handler: async (c) => {
      try {
        const body = await c.req.json();
        const {
          prompt,
          temperature,
          maxTokens,
          systemPrompt,
          additionalContext,
          resourceId,
          threadId,
        } = ChatInputSchema.parse(body);

        return createSSEStream(async (controller) => {
          const run = await chatWorkflow.createRunAsync();
          const result = await run.start({
            inputData: {
              prompt,
              temperature,
              maxTokens,
              systemPrompt,
              streamController: controller,
              additionalContext,
              resourceId,
              threadId,
            },
          });

          if (result.status !== 'success') {
            // TODO: Handle workflow errors appropriately
            throw new Error(`Workflow failed: ${result.status}`);
          }
        });
      } catch (error) {
        console.error(error);
        return c.json({ error: error instanceof Error ? error.message : 'Internal error' }, 500);
      }
    },
  }),
  
  // Room management routes
  registerApiRoute('/chat/rooms/create', {
    method: 'POST',
    handler: multiUserRoutes.createRoom,
  }),
  
  registerApiRoute('/chat/rooms/join', {
    method: 'POST',
    handler: multiUserRoutes.joinRoom,
  }),

  // User management routes
  registerApiRoute('/chat/users/get-or-create', {
    method: 'POST',
    handler: multiUserRoutes.getOrCreateUser,
  }),

  // File management routes
  registerApiRoute('/chat/files/upload', {
    method: 'POST',
    handler: async (c) => {
      try {
        // For now, return a simple response since file upload needs special handling
        return c.json({ success: false, error: 'File upload not implemented in Mastra yet' }, 400);
      } catch (error) {
        return c.json({ success: false, error: error.message }, 400);
      }
    },
  }),
  
  registerApiRoute('/chat/files/:roomId', {
    method: 'GET',
    handler: async (c) => {
      try {
        const result = await fileRoutes['GET /chat/files/:roomId'](c.req, c.res);
        return c.json(result);
      } catch (error) {
        return c.json({ success: false, error: error.message }, 400);
      }
    },
  }),
  
  registerApiRoute('/chat/files/:id/download', {
    method: 'GET',
    handler: async (c) => {
      try {
        const result = await fileRoutes['GET /chat/files/:id/download'](c.req, c.res);
        return c.json(result);
      } catch (error) {
        return c.json({ success: false, error: error.message }, 400);
      }
    },
  }),
];
