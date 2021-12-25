export class RuntimeError extends Error {
    operator: string;

    constructor(message: string, operator: string) {
        super(message);

        this.name = 'RuntimeError';
        this.operator = operator;
    }
}

export class SyntaxError extends Error {
    line: number;

    constructor(message: string, line: number) {
        super(message);

        this.name = 'SyntaxError';
        this.line = line;
    }
}

export class ScanError extends Error {
    line: number;

    constructor(message: string, line: number) {
        super(message);

        this.name = 'ScanError';
        this.line = line;
    }
}