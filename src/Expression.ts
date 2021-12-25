import { LoxValue, Token } from './Lox';

export interface ExpressionVisitor {
	visitBinaryExpression(expression: ExpressionType.Binary): LoxValue;
	visitGroupingExpression(expression: ExpressionType.Grouping): LoxValue;
	visitLiteralExpression(expression: ExpressionType.Literal): LoxValue;
	visitUnaryExpression(expression: ExpressionType.Unary): LoxValue;
	visitVariableExpression(expression: ExpressionType.Variable): LoxValue;
}

export abstract class Expression {
	abstract accept(visitor: ExpressionVisitor): LoxValue;
}

export namespace ExpressionType {
	export class Binary extends Expression {
		left: Expression;
		operator: Token;
		right: Expression;

		constructor(left: Expression, operator: Token, right: Expression) {
			super();

			this.left = left;
			this.operator = operator;
			this.right = right;
		}

		accept(visitor: ExpressionVisitor): LoxValue {
			return visitor.visitBinaryExpression(this);
		}
	}

	export class Grouping extends Expression {
		expression: Expression;

		constructor(expression: Expression) {
			super();

			this.expression = expression;
		}

		accept(visitor: ExpressionVisitor): LoxValue {
			return visitor.visitGroupingExpression(this);
		}
	}

	export class Literal extends Expression {
		value: string | number | boolean | null;

		constructor(value: string | number | boolean | null) {
			super();

			this.value = value;
		}

		accept(visitor: ExpressionVisitor): LoxValue {
			return visitor.visitLiteralExpression(this);
		}
	}

	export class Unary extends Expression {
		operator: Token;
		right: Expression;

		constructor(operator: Token, right: Expression) {
			super();

			this.operator = operator;
			this.right = right;
		}

		accept(visitor: ExpressionVisitor): LoxValue {
			return visitor.visitUnaryExpression(this);
		}
	}

	export class Variable extends Expression {
		name: Token;

		constructor(name: Token) {
			super();

			this.name = name;
		}

		accept(visitor: ExpressionVisitor): LoxValue {
			return visitor.visitVariableExpression(this);
		}
	}

}