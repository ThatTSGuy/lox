import { Visitor, Expression, ExpressionType } from './Expression';

export class AstPrinter implements Visitor {
    print(expr: Expression): string {
        return expr.accept(this);
    }

    visitBinaryExpression(expr: ExpressionType.Binary): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitGroupingExpression(expr: ExpressionType.Grouping): string {
        return this.parenthesize('group', expr.expression);
    }

    visitLiteralExpression(expr: ExpressionType.Literal): string {
        if (expr.value == null) return 'nil';
        return expr.value.toString();
    }

    visitUnaryExpression(expr: ExpressionType.Unary): string {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }

    parenthesize(name: string, ...exprs: Expression[]) {
        let output: string = '(' + name;

        for (let expr of exprs) {
            output += ' ' + expr.accept(this);
        }

        return output + ')';
    }
}