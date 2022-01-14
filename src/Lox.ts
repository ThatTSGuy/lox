import { Token, TokenType } from './Token';
import { Scanner } from './Scanner';

import { Expression, ExpressionType, ExpressionVisitor } from './Expression';
import { Statement, StatementType, StatementVisitor } from './Statement';
import { Parser } from './Parser';

import { LoxValue } from './LoxValue';
import { Enviroment } from './Enviroment';
import { Interpreter } from './Interpreter';

import { RuntimeError, SyntaxError, ScanError } from './Errors';

export {
    Token, TokenType,
    Expression, ExpressionType, ExpressionVisitor,
    Statement, StatementType, StatementVisitor,
    LoxValue, Enviroment,
    Scanner, Parser, Interpreter,
    RuntimeError, SyntaxError, ScanError,
}

import { readFileSync } from 'fs';
import { createInterface, Interface } from 'readline';
import { colorize, Colors } from './Utility';

class Lox {
    private interpreter: Interpreter = new Interpreter();

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
        // TO-DO
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

            readline.prompt();
        })
    }

    private run(source: string) {
        const scanner = new Scanner(source);
        const scanResult = scanner.scanTokens();

        // If there were errors during scanning, log them and return
        if (scanResult.errors.length != 0) {
            for (let error of scanResult.errors) console.log(`${colorize(Colors.RED, 'error')} - Lox ${error.name}: ${error.message}`);
            return;
        }

        const parser = new Parser(scanResult.tokens);
        const statements = parser.parse();

        this.interpreter.interpret(statements);
    }
}

new Lox();