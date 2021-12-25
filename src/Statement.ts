import { LoxValue, Token, Expression } from './Lox';

export interface StatementVisitor {
	visitExprStatement(statement: StatementType.Expr): LoxValue;
	visitPrintStatement(statement: StatementType.Print): LoxValue;
	visitVariableStatement(statement: StatementType.Variable): LoxValue;
}

export abstract class Statement {
	abstract accept(visitor: StatementVisitor): LoxValue;
}

export namespace StatementType {
	export class Expr extends Statement {
		expression: Expression;

		constructor(expression: Expression) {
			super();

			this.expression = expression;
		}

		accept(visitor: StatementVisitor): LoxValue {
			return visitor.visitExprStatement(this);
		}
	}

	export class Print extends Statement {
		expression: Expression;

		constructor(expression: Expression) {
			super();

			this.expression = expression;
		}

		accept(visitor: StatementVisitor): LoxValue {
			return visitor.visitPrintStatement(this);
		}
	}

	export class Variable extends Statement {
		name: Token;
		initializer: Expression | null;

		constructor(name: Token, initializer: Expression | null) {
			super();

			this.name = name;
			this.initializer = initializer;
		}

		accept(visitor: StatementVisitor): LoxValue {
			return visitor.visitVariableStatement(this);
		}
	}

}