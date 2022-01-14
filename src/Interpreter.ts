import {
    Token, TokenType,
    Expression, ExpressionType, ExpressionVisitor,
    Statement, StatementType, StatementVisitor,
    LoxValue, Enviroment,
    RuntimeError,
} from './Lox';

export class Interpreter implements ExpressionVisitor, StatementVisitor {
    private enviroment: Enviroment = new Enviroment();

    interpret(statements: Statement[]) {
        try {
            for (let statement of statements) {
                this.execute(statement);
            }
        } catch (error: any) {
            console.log(error);
            console.log(error.name, error.message);
        }
    }

    private evaluate(expression: Expression): LoxValue {
        return expression.accept(this);
    }

    private execute(statement: Statement) {
        statement.accept(this);
    }
    
    visitExprStatement(statement: StatementType.Expr) {
        this.evaluate(statement.expression);
        return null;
    }

    visitPrintStatement(statement: StatementType.Print) {
        const value = this.evaluate(statement.expression);
        console.log(`[OUT] ${this.stringify(value)}`);
        return null;
    }

    visitVariableStatement(statement: StatementType.Variable): LoxValue {
        let value = null;
        if (statement.initializer != null) {
            value = this.evaluate(statement.initializer);
        }

        this.enviroment.define(statement.name.lexeme, value);
        return null;
    }

    visitLiteralExpression(expression: ExpressionType.Literal): LoxValue {
        return expression.value;
    }

    visitGroupingExpression(expression: ExpressionType.Grouping): LoxValue {
        return this.evaluate(expression.expression);
    }

    visitUnaryExpression(expression: ExpressionType.Unary): LoxValue {
        const right: LoxValue = this.evaluate(expression.right);

        switch (expression.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperands(expression.operator, right);
                return -Number(right);
        }

        // Unreachable
        return null;
    }

    visitVariableExpression(expression: ExpressionType.Variable): LoxValue {
        return this.enviroment.get(expression.name);
    }

    visitBinaryExpression(expression: ExpressionType.Binary): LoxValue {
        const left: LoxValue = this.evaluate(expression.left);
        const right: LoxValue = this.evaluate(expression.right)

        switch (expression.operator.type) {
            case TokenType.GREATER:
                this.checkNumberOperands(expression.operator, left, right);
                return Number(left) > Number(right);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expression.operator, left, right);
                return Number(left) >= Number(right);
            case TokenType.LESS:
                this.checkNumberOperands(expression.operator, left, right);
                return Number(left) < Number(right);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expression.operator, left, right);
                return Number(left) <= Number(right);

            case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);

            case TokenType.MINUS:
                this.checkNumberOperands(expression.operator, left, right);
                return Number(left) - Number(right);
            case TokenType.PLUS:
                if (typeof left == 'number' && typeof right == 'number') {
                    return left + right;
                }

                if (typeof left == 'string' && typeof right == 'string') {
                    return left + right;
                }

                throw new RuntimeError('Operands must be of same type: String | Number', expression.operator.lexeme);
            case TokenType.SLASH:
                this.checkNumberOperands(expression.operator, left, right);
                return Number(left) / Number(right);
            case TokenType.STAR:
                this.checkNumberOperands(expression.operator, left, right);
                return Number(left) * Number(right);
            case TokenType.CARET:
                this.checkNumberOperands(expression.operator, left, right);
                return Math.pow(Number(left), Number(right));
        }

        // Unreachable
        return null;
    }

    private checkNumberOperands(operator: Token, ...operands: LoxValue[]) {
        for (let operand of operands) {
            if (typeof operand != 'number') throw new RuntimeError('Operands must be of same type: Number', operator.lexeme);
        }
    }

    private isTruthy(object: LoxValue): boolean {
        if (object == null) return false;
        if (typeof object == 'boolean') return Boolean(object);
        return true;
    }

    private isEqual(a: LoxValue, b: LoxValue): boolean {
        return a == b;
    }

    stringify(value: LoxValue): string {
        if (value == null) return 'nil';

        return value.toString();
    }
}

// BNF Playground: https://bnfplayground.pauliankline.com/?bnf=%3Cexpression%3E%20%20%20%20%20%3A%3A%3D%20%3Cterm%3E%0A%3Cterm%3E%20%20%20%20%20%20%20%20%20%20%20%3A%3A%3D%20%3Cfactor%3E%20(%20(%20%22-%22%20%7C%20%22%2B%22%20)%20%3Cfactor%3E%20)*%0A%3Cfactor%3E%20%20%20%20%20%20%20%20%20%3A%3A%3D%20%3Cunary%3E%20(%20(%20%22%2F%22%20%7C%20%22*%22%20)%20%3Cunary%3E%20)*%0A%3Cunary%3E%20%20%20%20%20%20%20%20%20%20%3A%3A%3D%20(%20%22-%22%20%3Cunary%3E%20)%2B%20%7C%20%3Cprimary%3E%0A%3Cprimary%3E%20%20%20%20%20%20%20%20%3A%3A%3D%20%3Cnumber%3E%20%7C%20%22(%22%20%3Cexpression%3E%20%22)%22%0A%0A%3Cnumber%3E%20%3A%3A%3D%20%5B0-9%5D%2B&name=