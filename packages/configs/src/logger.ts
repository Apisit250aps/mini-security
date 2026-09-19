import chalk from 'chalk';

export { chalk };

export type NextFunction = () => Promise<void>;
export interface HonoContextLike {
  req: { method: string; path: string };
  res: { status: number };
}
export type HonoMiddleware = (
  c: HonoContextLike,
  next: NextFunction,
) => Promise<void>;

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

export class TerminalLogger {
  constructor(private readonly defaultScope?: string) {}

  private getTimestamp(): string {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    return chalk.gray(`[${timeStr}]`);
  }

  private formatScope(scope?: string): string {
    const s = scope ?? this.defaultScope;
    return s ? chalk.cyan(`[${s}]`) : '';
  }

  info(message: string, scope?: string): void {
    const parts = [
      this.getTimestamp(),
      chalk.bgBlue.black.bold(' INFO '),
      this.formatScope(scope),
      chalk.white(message),
    ].filter(Boolean);
    console.log(parts.join(' '));
  }

  success(message: string, scope?: string): void {
    const parts = [
      this.getTimestamp(),
      chalk.bgGreen.black.bold(' DONE '),
      this.formatScope(scope),
      chalk.green(message),
    ].filter(Boolean);
    console.log(parts.join(' '));
  }

  warn(message: string, scope?: string): void {
    const parts = [
      this.getTimestamp(),
      chalk.bgYellow.black.bold(' WARN '),
      this.formatScope(scope),
      chalk.yellow(message),
    ].filter(Boolean);
    console.warn(parts.join(' '));
  }

  error(message: string, error?: Error | string, scope?: string): void {
    const parts = [
      this.getTimestamp(),
      chalk.bgRed.white.bold(' FAIL '),
      this.formatScope(scope),
      chalk.red.bold(message),
    ].filter(Boolean);
    console.error(parts.join(' '));
    if (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`   Details: ${error.message}`));
        if (error.stack) {
          const lines = error.stack.split('\n').slice(1, 4);
          console.error(chalk.gray(`   ${lines.join('\n   ')}`));
        }
      } else {
        console.error(chalk.red(`   Details: ${String(error)}`));
      }
    }
  }

  debug(message: string, scope?: string): void {
    const parts = [
      this.getTimestamp(),
      chalk.bgMagenta.black.bold(' DBG  '),
      this.formatScope(scope),
      chalk.gray(message),
    ].filter(Boolean);
    console.log(parts.join(' '));
  }

  step(step: number | string, total: number | string, message: string): void {
    const badge = chalk.bgCyan.black.bold(` STEP ${step}/${total} `);
    console.log(`\n${badge} ${chalk.bold.white(message)}`);
  }

  auditItem(
    label: string,
    status: 'PASS' | 'FAIL' | 'WARN',
    details?: string,
  ): void {
    const statusBadge =
      status === 'PASS'
        ? chalk.green.bold('[PASS]')
        : status === 'WARN'
          ? chalk.yellow.bold('[WARN]')
          : chalk.red.bold('[FAIL]');

    const labelFormatted = chalk.white(label.padEnd(28));
    const detailsFormatted = details ? chalk.gray(details) : '';
    console.log(`   ${statusBadge} ${labelFormatted} ${detailsFormatted}`);
  }

  header(title: string, subtitle?: string): void {
    const line = chalk.gray('═'.repeat(64));
    console.log(`\n${line}`);
    console.log(chalk.bold.cyan(`  ${title}`));
    if (subtitle) {
      console.log(chalk.gray(`  ${subtitle}`));
    }
    console.log(`${line}\n`);
  }

  subHeader(title: string): void {
    console.log(`\n${chalk.bold.white(title)}`);
    console.log(chalk.gray('─'.repeat(40)));
  }

  divider(): void {
    console.log(chalk.gray('─'.repeat(64)));
  }

  scope(name: string): TerminalLogger {
    return new TerminalLogger(name);
  }
}

export const logger = new TerminalLogger();

/**
 * Creates a clean, emoji-free Hono logger middleware with chalk formatting
 */
export function createHonoLogger(): HonoMiddleware {
  return async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    const methodColor =
      method === 'GET'
        ? chalk.green.bold
        : method === 'POST'
          ? chalk.blue.bold
          : method === 'PUT'
            ? chalk.yellow.bold
            : method === 'DELETE'
              ? chalk.red.bold
              : method === 'PATCH'
                ? chalk.magenta.bold
                : chalk.white.bold;

    const statusColor =
      status >= 500
        ? chalk.bgRed.white.bold
        : status >= 400
          ? chalk.bgYellow.black.bold
          : status >= 300
            ? chalk.cyan.bold
            : chalk.green.bold;

    const durationColor =
      duration > 1000 ? chalk.red : duration > 300 ? chalk.yellow : chalk.gray;

    const time = chalk.gray(`[${new Date().toTimeString().split(' ')[0]}]`);
    const tag = chalk.bgBlue.black.bold(' HTTP ');

    console.log(
      `${time} ${tag} ${methodColor(method.padEnd(7))} ${chalk.white(path)} ${statusColor(` ${status} `)} ${durationColor(`${duration}ms`)}`,
    );
  };
}

export default logger;
