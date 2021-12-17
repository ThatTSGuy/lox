import { readFileSync } from 'fs';
import { createInterface, Interface } from 'readline';
import { colorize, Colors } from './utility';

import { Scanner } from './Scanner';
import { Token } from './Token';

// import './generateAst';
import { AstPrinter } from './AstPrinter';

export class Lox {
    private hadError: boolean = false;

    constructor() {
        const args: string[] = process.argv.slice(2);

        if (args.length > 1) {
            console.log("Usage: lox [script]");
            process.exit(64);
        } else if (args.length == 1) {
            this.runFile(args[0]);
        } else {
            this.runPrompt();
        }
    }

    private runFile(path: string) {
        const source: string = readFileSync(path, "utf8");
        this.run(source);

        // Indicate an error in the exit code.
        if (this.hadError) process.exit(65);
    }

    private runPrompt() {
        console.log(colorize(Colors.CYAN, 'Lox'), 'REPL');

        const readline: Interface = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> ',
        })

        readline.prompt();

        readline.on('line', (line: string) => {
            if (line == null) process.exit(0);

            this.run(line);
            this.hadError = false;

            readline.prompt();
        })
    }

    private run(source: string) {
        const scanner: Scanner = new Scanner(this, source);
        const tokens: Token[] = scanner.scanTokens();

        for (let token of tokens) {
            console.log(token.toString());
        }
    }

    report(line: number, message: string, where?: string) {
        console.log(colorize(Colors.RED, `[line ${line}] Error${where ? ' at ' + where : ''}: ${message}`));
        this.hadError = true;
    }
}

// new Lox();

import { Expression, ExpressionType } from './Expression';
import { TokenType } from './TokenType';

let expr = new ExpressionType.Binary(
    new ExpressionType.Unary(
        new Token(TokenType.MINUS, '-', null, 1),
        new ExpressionType.Literal(123)),
    new Token(TokenType.STAR, '*', null, 1),
    new ExpressionType.Grouping(
        new ExpressionType.Literal(45.67)));

console.log(new AstPrinter().print(expr));