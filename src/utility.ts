export enum Colors {
    BLACK = '\u001b[30m',
    RED = '\u001b[31m',
    GREEN = '\u001b[32m',
    YELLOW = '\u001b[33m',
    BLUE = '\u001b[34m',
    MAGENTA = '\u001b[35m',
    CYAN = '\u001b[36m',
    WHITE = '\u001b[37m',
    RESET = '\u001b[0m',
}

export function colorize(color: Colors, str: string): string {
    return color + str + Colors.RESET;
}