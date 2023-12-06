//https://github.com/validator/validator/wiki/Output-%C2%BB-JSON

export type Result = {
    url: string;
    source: {
        code: string;
    }
    messages: Array<{
        type: string;
        message: string;
        extract: string;
        firstLine: number;
        firstColumn: number;
        lastLine: number;
        lastColumn: number;
    }>;
};

export type Message = {
    type: string;
    message: string;
    extract: string;
    firstLine: number;
    firstColumn: number;
    lastLine: number;
    lastColumn: number;
}