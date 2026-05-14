import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-serverless-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              try {
                const apiPath = req.url.split('?')[0];
                const filePath = path.resolve(__dirname, `.${apiPath}.ts`);
                
                if (fs.existsSync(filePath)) {
                  // Import the handler
                  const { default: handler } = await server.ssrLoadModule(filePath);
                  
                  // Simple mock of req.body for POST requests
                  if (req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => { body += chunk; });
                    req.on('end', async () => {
                      try {
                        const parsedBody = body ? JSON.parse(body) : {};
                        const mockReq = { ...req, body: parsedBody };
                        const mockRes = {
                          status(code: number) {
                            res.statusCode = code;
                            return this;
                          },
                          json(data: any) {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(data));
                          }
                        };
                        await handler(mockReq, mockRes);
                      } catch (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                      }
                    });
                    return;
                  }
                  
                  // For GET or other methods
                  const mockRes = {
                    status(code: number) {
                      res.statusCode = code;
                      return this;
                    },
                    json(data: any) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    }
                  };
                  await handler(req, mockRes);
                  return;
                }
              } catch (error) {
                console.error('API Dev Server Error:', error);
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
