import { LoxValue, Token, RuntimeError } from './Lox';

export class Enviroment {
    private values: Map<string, LoxValue> = new Map();

    get(name: Token): LoxValue {
        const value = this.values.get(name.lexeme);

        if (value) return value;

        throw new RuntimeError(`Undefined variable '${name.lexeme}'.`, name.lexeme);
    }

    define(name: string, value: LoxValue) {
        this.values.set(name, value);
    }
}