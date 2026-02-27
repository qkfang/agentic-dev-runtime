import { createServer } from './api/server';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const app = createServer();

app.listen(PORT, () => {
  console.log(`Control Plane API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Scopes: http://localhost:${PORT}/scopes`);
});
