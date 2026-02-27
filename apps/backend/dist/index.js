"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./api/server");
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const app = (0, server_1.createServer)();
app.listen(PORT, () => {
    console.log(`Control Plane API running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Scopes: http://localhost:${PORT}/scopes`);
});
//# sourceMappingURL=index.js.map