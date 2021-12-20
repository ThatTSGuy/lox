import { match } from "assert";
import exp = require("constants");
import { Expression, ExpressionType } from "./Expression";
import { Token } from "./token";
import { TokenType } from "./TokenType";

export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private expression(): Expression {
        return this.equality();
    }

    private equality(): Expression {
        let expr: Expression = this.comparison();

        while (this.matchAndAdvance(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expression = this.comparison();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private comparison(): Expression {
        let expr: Expression = this.term();

        while (this.matchAndAdvance(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expression = this.term();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private term(): Expression {
        let expr: Expression = this.factor();

        while (this.matchAndAdvance(TokenType.MINUS, TokenType.PLUS)) {
            const operator: Token = this.previous();
            const right: Expression = this.term();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private factor(): Expression {
        let expr: Expression = this.unary();

        while (this.matchAndAdvance(TokenType.SLASH, TokenType.STAR)) {
            const operator: Token = this.previous();
            const right: Expression = this.term();
            expr = new ExpressionType.Binary(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expression {
        if (this.matchAndAdvance(TokenType.BANG, TokenType.MINUS)) {
            const operator: Token = this.previous();
            const right: Expression = this.unary();
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
    
        if (this.matchAndAdvance(TokenType.LEFT_PAREN)) {
          const expr: Expression = this.expression();
          this.consumeTo(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
          return new ExpressionType.Grouping(expr);
        }

        // Satisfy TS
        return new ExpressionType.Literal('Error');
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

    private consumeTo(type: TokenType, message: string) {

    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    private advance() {
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
}