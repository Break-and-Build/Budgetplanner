/**
 * Tiny safe evaluator for amount-field arithmetic.
 *
 * Lets users type `1000+800` or `104.50 + 12.5` directly in a money input
 * without opening the phone's calculator. Supports +, -, *, / with standard
 * precedence, decimals, and thousand-separator commas.
 *
 * **Safe by construction:** never uses `eval` / `Function`. A tiny recursive-
 * descent parser tokenises then walks the expression, so nothing outside the
 * allowed grammar can execute.
 *
 *   evaluateExpression('1000+800')       → 1800
 *   evaluateExpression('1,500 + 3.50')   → 1503.5
 *   evaluateExpression('10 * 4 - 2')     → 38
 *   evaluateExpression('abc')            → null   (invalid → caller decides)
 *   evaluateExpression('12/0')           → null   (divide by zero)
 */

type Token =
  | { kind: 'num'; value: number }
  | { kind: 'op'; op: '+' | '-' | '*' | '/' };

/** True when the string contains a math operator that needs evaluation. */
export function looksLikeExpression(text: string): boolean {
  // A leading '-' is a sign, not a binary op — ignore it.
  const body = text.trimStart().startsWith('-') ? text.trimStart().slice(1) : text;
  return /[+\-*/]/.test(body);
}

/** Evaluate. Returns null when the input isn't a valid math expression. */
export function evaluateExpression(input: string): number | null {
  if (input == null) return null;
  // Strip commas (thousands separators) and whitespace before tokenising.
  const raw = input.replace(/,/g, '').replace(/\s+/g, '');
  if (!raw) return null;
  // Reject anything outside the allowed alphabet up front — belt-and-braces
  // over what the tokeniser would reject anyway, and makes the intent obvious.
  if (!/^[0-9+\-*/.]+$/.test(raw)) return null;

  let tokens: Token[];
  try {
    tokens = tokenize(raw);
  } catch {
    return null;
  }

  const parser = new Parser(tokens);
  try {
    const value = parser.parseExpression();
    if (!parser.atEnd()) return null;
    if (!Number.isFinite(value)) return null;
    // Round to 2 dp so 0.1+0.2 lands on 0.3 instead of 0.30000000000000004.
    return Math.round(value * 100) / 100;
  } catch {
    return null;
  }
}

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '+' || c === '-' || c === '*' || c === '/') {
      out.push({ kind: 'op', op: c });
      i++;
      continue;
    }
    // Number: run of digits + at most one '.'
    let j = i;
    let dot = false;
    while (j < src.length) {
      const d = src[j];
      if (d >= '0' && d <= '9') {
        j++;
      } else if (d === '.' && !dot) {
        dot = true;
        j++;
      } else {
        break;
      }
    }
    if (j === i) throw new Error('unexpected char');
    const chunk = src.slice(i, j);
    if (chunk === '.') throw new Error('bare dot');
    const num = parseFloat(chunk);
    if (Number.isNaN(num)) throw new Error('bad number');
    out.push({ kind: 'num', value: num });
    i = j;
  }
  return out;
}

/**
 * Recursive-descent parser.
 *   expr   = term  (('+'|'-') term)*
 *   term   = unary (('*'|'/') unary)*
 *   unary  = ('-' | '+')? factor
 *   factor = number
 */
class Parser {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  atEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  parseExpression(): number {
    let left = this.parseTerm();
    while (!this.atEnd()) {
      const t = this.tokens[this.pos];
      if (t.kind === 'op' && (t.op === '+' || t.op === '-')) {
        this.pos++;
        const right = this.parseTerm();
        left = t.op === '+' ? left + right : left - right;
      } else break;
    }
    return left;
  }

  private parseTerm(): number {
    let left = this.parseUnary();
    while (!this.atEnd()) {
      const t = this.tokens[this.pos];
      if (t.kind === 'op' && (t.op === '*' || t.op === '/')) {
        this.pos++;
        const right = this.parseUnary();
        if (t.op === '/') {
          if (right === 0) throw new Error('div by zero');
          left = left / right;
        } else {
          left = left * right;
        }
      } else break;
    }
    return left;
  }

  private parseUnary(): number {
    if (!this.atEnd()) {
      const t = this.tokens[this.pos];
      if (t.kind === 'op' && (t.op === '-' || t.op === '+')) {
        this.pos++;
        const v = this.parseUnary();
        return t.op === '-' ? -v : v;
      }
    }
    return this.parseFactor();
  }

  private parseFactor(): number {
    if (this.atEnd()) throw new Error('unexpected end');
    const t = this.tokens[this.pos];
    if (t.kind !== 'num') throw new Error('expected number');
    this.pos++;
    return t.value;
  }
}

// ── Inline dev checks — mirror the storage.ts style ──────────────────────────
declare const __DEV__: boolean | undefined;
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const eq = (input: string, expected: number | null) => {
    const got = evaluateExpression(input);
    console.assert(
      got === expected,
      `evaluateExpression(${JSON.stringify(input)}) → ${got}, expected ${expected}`,
    );
  };
  eq('1000+800', 1800);
  eq('1,500 + 3.50', 1503.5);
  eq('10 * 4 - 2', 38);
  eq('104.50', 104.5);
  eq('.5 + .25', 0.75);
  eq('-5 + 10', 5);
  eq('12/0', null);
  eq('abc', null);
  eq('1+', null);
  eq('', null);
}
