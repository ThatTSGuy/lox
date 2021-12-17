import { Token } from './token';

export interface Visitor {
	visitBinaryExpression(expression: ExpressionType.Binary): string;
	visitGroupingExpression(expression: ExpressionType.Grouping): string;
	visitLiteralExpression(expression: ExpressionType.Literal): string;
	visitUnaryExpression(expression: ExpressionType.Unary): string;
}

export abstract class Expression {
	abstract accept(visitor: Visitor): any;
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

		accept(visitor: Visitor): string {
			return visitor.visitBinaryExpression(this);
		}
	}

	export class Grouping extends Expression {
		expression: Expression;

		constructor(expression: Expression) {
			super();

			this.expression = expression;
		}

		accept(visitor: Visitor): string {
			return visitor.visitGroupingExpression(this);
		}
	}

	export class Literal extends Expression {
		value: Object;

		constructor(value: Object) {
			super();

			this.value = value;
		}

		accept(visitor: Visitor): string {
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

		accept(visitor: Visitor): string {
			return visitor.visitUnaryExpression(this);
		}
	}

}