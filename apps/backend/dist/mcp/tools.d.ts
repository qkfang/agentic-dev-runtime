export interface ToolResult {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
}
export declare const toolDefinitions: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            phase: {
                type: string;
                enum: string[];
                description: string;
            };
            scope_id?: undefined;
            agent_id?: undefined;
            notes?: undefined;
            result?: undefined;
            artifacts?: undefined;
            reason?: undefined;
            requirements_md?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scope_id: {
                type: string;
                description: string;
            };
            status?: undefined;
            phase?: undefined;
            agent_id?: undefined;
            notes?: undefined;
            result?: undefined;
            artifacts?: undefined;
            reason?: undefined;
            requirements_md?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scope_id: {
                type: string;
                description: string;
            };
            agent_id: {
                type: string;
                description: string;
            };
            status?: undefined;
            phase?: undefined;
            notes?: undefined;
            result?: undefined;
            artifacts?: undefined;
            reason?: undefined;
            requirements_md?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scope_id: {
                type: string;
                description: string;
            };
            notes: {
                type: string;
                description: string;
            };
            status?: undefined;
            phase?: undefined;
            agent_id?: undefined;
            result?: undefined;
            artifacts?: undefined;
            reason?: undefined;
            requirements_md?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scope_id: {
                type: string;
                description: string;
            };
            result: {
                type: string;
                description: string;
            };
            artifacts: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            status?: undefined;
            phase?: undefined;
            agent_id?: undefined;
            notes?: undefined;
            reason?: undefined;
            requirements_md?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scope_id: {
                type: string;
                description: string;
            };
            reason: {
                type: string;
                description: string;
            };
            status?: undefined;
            phase?: undefined;
            agent_id?: undefined;
            notes?: undefined;
            result?: undefined;
            artifacts?: undefined;
            requirements_md?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            requirements_md: {
                type: string;
                description: string;
            };
            status?: undefined;
            phase?: undefined;
            scope_id?: undefined;
            agent_id?: undefined;
            notes?: undefined;
            result?: undefined;
            artifacts?: undefined;
            reason?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            status?: undefined;
            phase?: undefined;
            scope_id?: undefined;
            agent_id?: undefined;
            notes?: undefined;
            result?: undefined;
            artifacts?: undefined;
            reason?: undefined;
            requirements_md?: undefined;
        };
        required?: undefined;
    };
})[];
export declare function handleTool(name: string, args: Record<string, unknown>): Promise<ToolResult>;
//# sourceMappingURL=tools.d.ts.map