import { createWriteStream, WriteStream } from 'fs';

// Lox Expression Grammar
// Literals. Numbers, strings, Booleans, and nil.
// Unary expressions. A prefix ! to perform a logical not, and - to negate a number.
// Binary expressions. The infix arithmetic (+, -, *, /) and logic operators (==, !=, <, <=, >, >=) we know and love.
// Parentheses. A pair of ( and ) wrapped around an expression.

// expression     → literal
//                | unary
//                | binary
//                | grouping ;

// literal        → NUMBER | STRING | "true" | "false" | "nil" ;
// grouping       → "(" expression ")" ;
// unary          → ( "-" | "!" ) expression ;
// binary         → expression operator expression ;
// operator       → "==" | "!=" | "<" | "<=" | ">" | ">="
//                | "+"  | "-"  | "*" | "/" ;

function defineVisitor(writer: WriteStream, baseName: string, types: string[]) {
    writer.write(`export interface ${baseName}Visitor {\n`);

    for (let type of types) {
        const typeName: string = type.split('>')[0].trim();
        writer.write(`\tvisit${typeName}${baseName}(${baseName.toLowerCase()}: ${baseName}Type.${typeName}): LoxValue;\n`);
    }

    writer.write('}\n\n');
}

function defineType(writer: WriteStream, baseName: string, className: string, fieldList: string) {
    writer.write(`\texport class ${className} extends ${baseName} {\n`);

    for (let field of fieldList.split(', ')) {
        writer.write(`\t\t${field};\n`)
    }
    writer.write('\n');

    // Constructor.
    writer.write(`\t\tconstructor(${fieldList}) {\n`)
    writer.write('\t\t\tsuper();\n\n');
    for (let field of fieldList.split(', ')) {
        const type: string = field.split(':')[0];
        writer.write(`\t\t\tthis.${type} = ${type};\n`)
    }
    writer.write('\t\t}\n\n')

    writer.write(`\t\taccept(visitor: ${baseName}Visitor): LoxValue {\n`);
    writer.write(`\t\t\treturn visitor.visit${className}${baseName}(this);\n`);
    writer.write('\t\t}\n')

    writer.write('\t}\n\n')
}

function defineAst(baseName: string, types: string[], imports: string[]) {
    const writer = createWriteStream(`./src/${baseName}.ts`, { encoding: 'utf-8' });

    writer.write(`import { LoxValue, ${imports.join(', ')} } from './Lox';\n\n`);

    defineVisitor(writer, baseName, types);

    // Abstract class
    writer.write(`export abstract class ${baseName} {\n`);
    writer.write(`\tabstract accept(visitor: ${baseName}Visitor): LoxValue;\n`);
    writer.write('}\n\n');

    writer.write(`export namespace ${baseName}Type {\n`);

    for (let type of types) {
        const className: string = type.split('>')[0].trim();
        const fields: string = type.split('>')[1].trim();
        defineType(writer, baseName, className, fields);
    }

    writer.write('}');

    writer.end();
}

defineAst('Expression', [
    'Binary   > left: Expression, operator: Token, right: Expression',
    'Grouping > expression: Expression',
    'Literal  > value: string | number | boolean | null',
    'Unary    > operator: Token, right: Expression',
    'Variable > name: Token',
], [
    'Token',
])

defineAst('Statement', [
    'Expr     > expression: Expression',
    'Print    > expression: Expression',
    'Variable > name: Token, initializer: Expression | null',
], [
    'Token', 'Expression',
])