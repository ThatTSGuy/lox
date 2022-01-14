import {
    Token, TokenType,
    ScanError
} from './Lox';

export class Scanner {
    private source: string;
    private tokens: Token[] = [];
    private errors: ScanError[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    private static keywords: Map<string, TokenType> = new Map();

    static {
        Scanner.keywords.set('and', TokenType.AND);
        Scanner.keywords.set('class', TokenType.CLASS);
        Scanner.keywords.set('else', TokenType.ELSE);
        Scanner.keywords.set('false', TokenType.FALSE);
        Scanner.keywords.set('for', TokenType.FOR);
        Scanner.keywords.set('fun', TokenType.FUN);
        Scanner.keywords.set('if', TokenType.IF);
        Scanner.keywords.set('nil', TokenType.NIL);
        Scanner.keywords.set('or', TokenType.OR);
        Scanner.keywords.set('print', TokenType.PRINT);
        Scanner.keywords.set('return', TokenType.RETURN);
        Scanner.keywords.set('super', TokenType.SUPER);
        Scanner.keywords.set('this', TokenType.THIS);
        Scanner.keywords.set('true', TokenType.TRUE);
        Scanner.keywords.set('var', TokenType.VAR);
        Scanner.keywords.set('while', TokenType.WHILE);
    }

    constructor(source: string) {
        this.source = source;
    }

    scanTokens(): { tokens: Token[], errors: ScanError[] } {
        while (!this.isAtEnd()) {
            // We are at the beginning of the next lexeme.
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TokenType.EOF, '', null, this.line));

        return {
            tokens: this.tokens,
            errors: this.errors,
        }
    }

    private scanToken(): void {
        const c: string = this.advance();
        switch (c) {
            // Single-character tokens.
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '/': this.addToken(TokenType.SLASH); break;
            case '^': this.addToken(TokenType.CARET); break;

            // One or two character tokens.
            case '!':
                this.addToken(this.matchAndAdvance('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.matchAndAdvance('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.matchAndAdvance('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.matchAndAdvance('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;

            // Comments.
            case '~':
                while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                break;

            // Ignore whitespace.
            case ' ':
            case '\r':
            case '\t':
                break;

            // Newlines.
            case '\n':
                this.line++;
                break;

            // Strings.
            case '"': this.consumeString(); break;

            default:
                if (this.isDigit(c)) {
                    this.consumeNumber();
                } else if (this.isAlpha(c)) {
                    this.consumeIdentifier();
                } else {
                    this.errors.push(new ScanError(`Unexpected character: ${c}`, this.line));
                }
        }
    }

    private consumeString(): void {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            this.errors.push(new ScanError('Unterminated string.', this.line));
        }

        // The closing ".
        this.advance();

        // Trim the surrounding quotes
        const value: string = this.source.substring(this.start + 1, this.current - 1);
        return this.addToken(TokenType.STRING, value);
    }

    private consumeNumber(): void {
        while (this.isDigit(this.peek())) this.advance();

        // Consume fractional part
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        const value: string = this.source.substring(this.start, this.current);
        this.addToken(TokenType.NUMBER, parseFloat(value));
    }

    private consumeIdentifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text: string = this.source.substring(this.start, this.current);
        let type: TokenType | undefined = Scanner.keywords.get(text);

        if (!type) type = TokenType.IDENTIFIER;

        this.addToken(type);
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private isDigit(c: string): boolean {
        return /\d/.test(c);
    }

    private isAlpha(c: string): boolean {
        return /[a-zA-Z_]/.test(c);
    }

    private isAlphaNumeric(c: string): boolean {
        return /[a-zA-Z_\d]/.test(c);
    }

    private advance(): string {
        this.current++;
        return this.source[this.current - 1];
    }

    private matchAndAdvance(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.peek() != expected) return false;

        this.advance();
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    private addToken(type: TokenType, literal: any = null): void {
        const text: string = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }
}