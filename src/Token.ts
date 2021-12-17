import { TokenType } from './TokenType';

export class Token {
    type: TokenType;
    lexeme: string;
    literal: any;
    line: number;

    constructor(type: TokenType, lexeme: string, literal: any, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString(): string {
        // Yes, I know it's not pretty.
        return `<TOKEN> [${padSpace(TokenType[this.type] + ']', 12)} '${padSpace(this.lexeme + "'", 10)} '${padSpace((this.literal || 'null') + "'", 10)}`;
    }
}

function padSpace(str: string, length: number): string {
    return str + ' '.repeat(length - str.length);
}