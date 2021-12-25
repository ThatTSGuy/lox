import {
    Token, TokenType,
    Expression, ExpressionType,
    Statement, StatementType,
    SyntaxError,
} from './Lox';

export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): Statement[] {
        const statements: Statement[] = [];
        while (!this.isAtEnd()) {
            let statement = this.declaration();
            if (statement) statements.push(statement);
        }

        return statements;
    }

    private statement(): Statement {
        if (this.matchAndAdvance(TokenType.PRINT)) return this.printStatement();
    
        return this.expressionStatement();
    }

    private expression(): Expression {
        return this.equality();
    }

    private declaration(): Statement | null {
        try {
            if (this.matchAndAdvance(TokenType.VAR)) return this.variableDeclaration();

            return this.statement();
        } catch (error) {
            this.synchronize();
            return null;
        }
    }

    private expressionStatement(): Statement {
        const expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new StatementType.Expr(expression);
    }

    private printStatement(): Statement {
        const value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new StatementType.Print(value);
    }

    private variableDeclaration(): Statement {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.');

        let initializer = null;
        if (this.matchAndAdvance(TokenType.EQUAL)) {
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        return new StatementType.Variable(name, initializer);
    }

    private equality(): Expression {
        let expr = this.comparison();

        while (this.matchAndAdvance(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private comparison(): Expression {
        let expr = this.term();

        while (this.matchAndAdvance(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private term(): Expression {
        let expr = this.factor();

        while (this.matchAndAdvance(TokenType.MINUS, TokenType.PLUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private factor(): Expression {
        let expr = this.unary();

        while (this.matchAndAdvance(TokenType.SLASH, TokenType.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expression {
        if (this.matchAndAdvance(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new ExpressionType.Unary(operator, right);
        }

        return this.primary();
    }

    private primary(): Expression {
        if (this.matchAndAdvance(TokenType.FALSE)) return new ExpressionType.Literal(false);
        if (this.matchAndAdvance(TokenType.TRUE)) return new ExpressionType.Literal(true);
        if (this.matchAndAdvance(TokenType.NIL)) return new ExpressionType.Literal(null);

        if (this.matchAndAdvance(TokenType.NUMBER, TokenType.STRING)) {
            return new ExpressionType.Literal(this.previous().literal);
        }

        if (this.matchAndAdvance(TokenType.IDENTIFIER)) {
            return new ExpressionType.Variable(this.previous());
        }

        if (this.matchAndAdvance(TokenType.LEFT_PAREN)) {
            const expr: Expression = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new ExpressionType.Grouping(expr);
        }

        throw new SyntaxError('Expect expression', this.peek().line);
    }

    private matchAndAdvance(...types: TokenType[]): boolean {
        for (let type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private consume(type: TokenType, message: string) {
        if (this.check(type)) return this.advance();

        throw new SyntaxError(message, this.peek().line);
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private synchronize(): void {
        // Consume invalid token.
        this.advance();

        // Discard tokens until we find a statement boundary.
        while (!this.isAtEnd()) {
            if (this.previous().type == TokenType.SEMICOLON) return;

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }
}