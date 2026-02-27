"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
function createServer() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: '*' }));
    app.use(express_1.default.json({ type: ['application/json', 'text/plain'] }));
    app.use(express_1.default.text({ type: 'text/markdown' }));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use('/', routes_1.default);
    return app;
}
//# sourceMappingURL=server.js.map