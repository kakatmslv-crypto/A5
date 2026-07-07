export interface CFunction {
  name: string;
  returnType: string;
  params: { type: string; name: string; isPointer: boolean }[];
  body: string;
}

export interface PointerRef {
  type: 'pointer';
  targetVarName: string;
  targetFrameIndex: number;
}

export interface StackFrame {
  functionName: string;
  variables: Record<string, any>; // stores raw values or PointerRefs
}

export class CInterpreter {
  private sourceCode: string;
  private functions: Record<string, CFunction> = {};
  private stack: StackFrame[] = [];
  private globals: Record<string, any> = {};
  private outputBuffer: string[] = [];
  
  // Input handling
  private inputQueue: string[] = [];
  private waitingForInputCallback: ((promptLabel: string) => void) | null = null;
  private onOutputUpdate: ((output: string) => void) | null = null;
  private onFinished: ((success: boolean) => void) | null = null;
  private onStackUpdate: ((stack: any[]) => void) | null = null;
  
  // Execution state
  private pcStack: { frameIdx: number; statementIdx: number; statements: string[] }[] = [];
  private isRunning: boolean = false;
  private currentFrameIndex: number = -1;

  constructor(sourceCode: string) {
    this.sourceCode = sourceCode;
    this.parseFunctions();
  }

  private parseFunctions() {
    this.functions = {};
    
    // Clean comments first
    let cleanCode = this.sourceCode;
    // Remove single line comments
    cleanCode = cleanCode.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');

    // Function regex: captures returnType, name, parameters, body
    // e.g., long Sum(int a, int b) { ... }
    const functionRegex = /\b(int|long|void|float|double)\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g;
    let match;

    while ((match = functionRegex.exec(cleanCode)) !== null) {
      const returnType = match[1];
      const name = match[2];
      const paramsStr = match[3];
      const body = match[4];

      const params: { type: string; name: string; isPointer: boolean }[] = [];
      if (paramsStr.trim() && paramsStr.trim() !== 'void') {
        const paramParts = paramsStr.split(',');
        for (let part of paramParts) {
          part = part.trim();
          // Extract type and name, checking for pointer asterisk
          // e.g., "int *b" or "int a"
          const m = part.match(/\b(int|long|void|float|double)\s*(\*?)\s*(\w+)/);
          if (m) {
            params.push({
              type: m[1],
              isPointer: m[2] === '*',
              name: m[3]
            });
          }
        }
      }

      this.functions[name] = {
        name,
        returnType,
        params,
        body
      };
    }
  }

  public registerOnOutput(callback: (output: string) => void) {
    this.onOutputUpdate = callback;
  }

  public registerOnFinished(callback: (success: boolean) => void) {
    this.onFinished = callback;
  }

  public registerOnScanf(callback: (promptLabel: string) => void) {
    this.waitingForInputCallback = callback;
  }

  public registerOnStackUpdate(callback: (stack: any[]) => void) {
    this.onStackUpdate = callback;
  }

  private triggerStackUpdate() {
    if (this.onStackUpdate) {
      this.onStackUpdate(this.getStackFrames());
    }
  }

  public addInput(value: string) {
    this.inputQueue.push(value);
    if (this.isRunning && this.pcStack.length > 0) {
      // Resume execution
      this.executeNext();
      this.triggerStackUpdate();
    }
  }

  public start() {
    this.outputBuffer = [];
    this.stack = [];
    this.pcStack = [];
    this.isRunning = true;
    this.currentFrameIndex = -1;

    this.printToTerminal(`[Terminal - VS Code GCC Simulator]`);
    this.printToTerminal(`$ gcc main.c -o main`);
    this.printToTerminal(`$ ./main`);

    if (!this.functions['main']) {
      this.printToTerminal(`\nError: Linker failed. 'main' function is not defined in the source code.`);
      this.isRunning = false;
      if (this.onFinished) this.onFinished(false);
      return;
    }

    // Call main
    this.callFunction('main', []);
    this.executeNext();
    this.triggerStackUpdate();
  }

  private printToTerminal(text: string) {
    this.outputBuffer.push(text);
    if (this.onOutputUpdate) {
      this.onOutputUpdate(this.outputBuffer.join('\n'));
    }
  }

  private callFunction(name: string, args: any[]) {
    const fn = this.functions[name];
    if (!fn) {
      throw new Error(`Function ${name} is not defined`);
    }

    const variables: Record<string, any> = {};
    
    // Bind parameters
    fn.params.forEach((param, idx) => {
      variables[param.name] = args[idx];
    });

    this.stack.push({
      functionName: name,
      variables
    });
    
    this.currentFrameIndex = this.stack.length - 1;

    // Split body into statements
    // We want to split by ';' but ignore semicolons inside quotes or braces
    const statements = this.splitStatements(fn.body);

    this.pcStack.push({
      frameIdx: this.currentFrameIndex,
      statementIdx: 0,
      statements
    });
    this.triggerStackUpdate();
  }

  private splitStatements(body: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inQuote = false;
    let braceDepth = 0;

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === '"' && body[i - 1] !== '\\') {
        inQuote = !inQuote;
        current += char;
      } else if (inQuote) {
        current += char;
      } else {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;

        if (char === ';' && braceDepth === 0) {
          statements.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    if (current.trim()) {
      statements.push(current.trim());
    }
    return statements.filter(s => s.length > 0);
  }

  private executeNext() {
    if (!this.isRunning) return;

    if (this.pcStack.length === 0) {
      this.isRunning = false;
      this.printToTerminal(`\nProcess exited with status 0.`);
      if (this.onFinished) this.onFinished(true);
      return;
    }

    const currentPC = this.pcStack[this.pcStack.length - 1];
    this.currentFrameIndex = currentPC.frameIdx;

    if (currentPC.statementIdx >= currentPC.statements.length) {
      // Finished function, pop stack
      this.pcStack.pop();
      this.stack.pop();
      this.currentFrameIndex = this.stack.length - 1;
      this.triggerStackUpdate();
      
      // If there is a return value from void function, default to null
      this.resumeCaller(null);
      return;
    }

    const statement = currentPC.statements[currentPC.statementIdx];
    currentPC.statementIdx++;

    try {
      this.executeStatement(statement);
    } catch (err: any) {
      this.printToTerminal(`\nRuntime Error: ${err.message}`);
      this.isRunning = false;
      if (this.onFinished) this.onFinished(false);
    }
  }

  private resumeCaller(returnValue: any) {
    if (this.pcStack.length === 0) {
      this.isRunning = false;
      this.printToTerminal(`\nProcess exited with status 0.`);
      if (this.onFinished) this.onFinished(true);
      return;
    }

    // We need to feed the return value back to the statement that called it
    const callerPC = this.pcStack[this.pcStack.length - 1];
    this.currentFrameIndex = callerPC.frameIdx;

    // If the caller statement was waiting for a function value
    // Let's execute the remainder of the caller statement with the function call replaced by the value!
    this.executeNext();
  }

  private executeStatement(stmt: string) {
    // 1. Check if it's a return statement
    if (stmt.startsWith('return')) {
      const expr = stmt.substring(6).trim();
      const val = this.evaluateExpression(expr);
      
      this.pcStack.pop(); // pop PC of this function
      this.stack.pop(); // pop stack of this function
      this.currentFrameIndex = this.stack.length - 1;
      this.triggerStackUpdate();

      // Put return value in caller context or print it
      if (this.pcStack.length > 0) {
        // We can save the return value in a temporary place
        this.lastReturnValue = val;
        this.resumeCaller(val);
      } else {
        this.isRunning = false;
        this.printToTerminal(`\nProcess exited with status ${val}.`);
        if (this.onFinished) this.onFinished(true);
      }
      return;
    }

    // 2. Variable declarations (e.g., int x, y; or int x = 5, y = 10;)
    const declMatch = stmt.match(/^(int|long|float|double|char)\s+([\s\S]+)$/);
    if (declMatch) {
      const decls = declMatch[2].split(',');
      decls.forEach(decl => {
        const parts = decl.split('=');
        const varName = parts[0].trim();
        if (parts.length > 1) {
          const valExpr = parts.slice(1).join('=').trim();
          this.stack[this.currentFrameIndex].variables[varName] = this.evaluateExpression(valExpr);
        } else {
          this.stack[this.currentFrameIndex].variables[varName] = 0; // default value
        }
      });
      this.triggerStackUpdate();
      this.executeNext();
      return;
    }

    // 3. printf statement
    if (stmt.startsWith('printf')) {
      this.handlePrintf(stmt);
      return;
    }

    // 4. scanf statement
    if (stmt.startsWith('scanf')) {
      this.handleScanf(stmt);
      return;
    }

    // 5. Assignment to pointer (e.g. *b = a + *b;)
    if (stmt.startsWith('*')) {
      const assignParts = stmt.split('=');
      const lhs = assignParts[0].trim().substring(1).trim(); // skip '*'
      const rhs = assignParts.slice(1).join('=').trim();

      const val = this.evaluateExpression(rhs);
      const ptr = this.stack[this.currentFrameIndex].variables[lhs] as PointerRef;
      if (ptr && ptr.type === 'pointer') {
        this.stack[ptr.targetFrameIndex].variables[ptr.targetVarName] = val;
      } else {
        throw new Error(`Variable ${lhs} is not a valid pointer.`);
      }

      this.triggerStackUpdate();
      this.executeNext();
      return;
    }

    // 6. Normal assignment (e.g. x = y + 5;)
    const assignParts = stmt.split('=');
    if (assignParts.length > 1) {
      const varName = assignParts[0].trim();
      const rhs = assignParts.slice(1).join('=').trim();
      const val = this.evaluateExpression(rhs);
      this.stack[this.currentFrameIndex].variables[varName] = val;
      this.triggerStackUpdate();
      this.executeNext();
      return;
    }

    // 7. Plain function call or expression
    if (stmt.trim()) {
      this.evaluateExpression(stmt);
    }
    this.executeNext();
  }

  private lastReturnValue: any = null;

  private handlePrintf(stmt: string) {
    // printf("format string", arg1, arg2...)
    const match = stmt.match(/printf\s*\(\s*"([^"]*)"\s*(?:,\s*([\s\S]+))?\)/);
    if (!match) {
      throw new Error(`Invalid printf syntax: ${stmt}`);
    }

    let formatStr = match[1];
    const argsStr = match[2];

    // Replace escape sequences
    formatStr = formatStr.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    if (argsStr) {
      // Split args by comma, respecting parentheses (for function calls inside printf)
      const args = this.splitArgs(argsStr);
      const evaluatedArgs = args.map(arg => this.evaluateExpression(arg));

      let argIdx = 0;
      // Replace %d, %ld, %f, %s, etc.
      formatStr = formatStr.replace(/%l?[dfsc]/g, (match) => {
        if (argIdx < evaluatedArgs.length) {
          return String(evaluatedArgs[argIdx++]);
        }
        return match;
      });
    }

    this.printToTerminal(formatStr);
    this.executeNext();
  }

  private handleScanf(stmt: string) {
    // scanf("%d", &x) or scanf("%d", &y)
    const match = stmt.match(/scanf\s*\(\s*"([^"]*)"\s*,\s*&?(\w+)\s*\)/);
    if (!match) {
      throw new Error(`Invalid scanf syntax: ${stmt}`);
    }

    const varName = match[2];

    if (this.inputQueue.length > 0) {
      const valStr = this.inputQueue.shift()!;
      const val = parseInt(valStr, 10) || 0;
      
      // Assign value
      // Check if the variable is in the current frame or is it a pointer parameter?
      const existing = this.stack[this.currentFrameIndex].variables[varName];
      if (existing && typeof existing === 'object' && existing.type === 'pointer') {
        const ptr = existing as PointerRef;
        this.stack[ptr.targetFrameIndex].variables[ptr.targetVarName] = val;
      } else {
        this.stack[this.currentFrameIndex].variables[varName] = val;
      }
      
      this.printToTerminal(valStr); // Echo to stdout
      this.executeNext();
    } else {
      // Pause and trigger input callback
      // Let's compute a nice label for the user input prompt
      let label = `Enter value for ${varName}:`;
      if (varName === 'x') label = 'Enter first number (x):';
      if (varName === 'y') label = 'Enter second number (y):';
      if (varName === 'a') label = 'Enter value for a:';
      if (varName === 'b') label = 'Enter value for b:';

      if (this.waitingForInputCallback) {
        this.waitingForInputCallback(label);
      }
      // Decrement statement index so when we resume, we re-run this scanf but this time we have input
      const currentPC = this.pcStack[this.pcStack.length - 1];
      currentPC.statementIdx--;
    }
  }

  private splitArgs(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let parenDepth = 0;
    let inQuote = false;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '"' && argsStr[i - 1] !== '\\') {
        inQuote = !inQuote;
        current += char;
      } else if (inQuote) {
        current += char;
      } else {
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;

        if (char === ',' && parenDepth === 0) {
          args.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    if (current.trim()) {
      args.push(current.trim());
    }
    return args;
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();
    if (!expr) return 0;

    // Check if it's a simple number
    if (/^\d+$/.test(expr)) {
      return parseInt(expr, 10);
    }

    // Check if it's a string literal
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.substring(1, expr.length - 1);
    }

    // Check if it's a function call (e.g., Sum(x, y) or SumByValue(x, y))
    const fnCallMatch = expr.match(/^(\w+)\s*\(([^)]*)\)$/);
    if (fnCallMatch) {
      const fnName = fnCallMatch[1];
      const argsStr = fnCallMatch[2];
      const argStrings = argsStr ? this.splitArgs(argsStr) : [];
      
      const argsEvaluated = argStrings.map(arg => {
        arg = arg.trim();
        // Check if passing pointer address: e.g. &y
        if (arg.startsWith('&')) {
          const varName = arg.substring(1).trim();
          return {
            type: 'pointer',
            targetVarName: varName,
            targetFrameIndex: this.currentFrameIndex
          } as PointerRef;
        }
        return this.evaluateExpression(arg);
      });

      // Call function and pause this statement
      // Since callFunction is synchronous, but we might have scanf inside, we support execution stacking
      this.callFunction(fnName, argsEvaluated);
      
      // Return a placeholder or the lastReturnValue if it returned immediately
      // Actually we just return 0, and the resumeCaller will update the stack and variables when finished.
      return this.lastReturnValue !== null ? this.lastReturnValue : 0;
    }

    // Evaluate mathematical expression
    // Replace dereferences like *b or variables with their actual values
    let evalStr = expr;
    const currentVars = this.stack[this.currentFrameIndex]?.variables || {};

    // First replace pointer dereferences e.g. *b
    evalStr = evalStr.replace(/\*(\w+)/g, (match, varName) => {
      const val = currentVars[varName];
      if (val && typeof val === 'object' && val.type === 'pointer') {
        const ptr = val as PointerRef;
        return String(this.stack[ptr.targetFrameIndex].variables[ptr.targetVarName] || 0);
      }
      return '0';
    });

    // Replace normal variables
    // Sort keys by length descending to avoid replacing partial variable names
    const sortedVarNames = Object.keys(currentVars).sort((a, b) => b.length - a.length);
    for (const name of sortedVarNames) {
      const val = currentVars[name];
      let valStr = '0';
      if (val && typeof val === 'object' && val.type === 'pointer') {
        // Just use its value if accessed normally (which is usually a memory address, but we can return 1000 for simplicity or dereferenced val)
        valStr = '1000'; // mocked address
      } else {
        valStr = String(val !== undefined ? val : 0);
      }
      
      // Word boundary replace to avoid replacing variables inside strings or function names
      const regex = new RegExp('\\b' + name + '\\b', 'g');
      evalStr = evalStr.replace(regex, valStr);
    }

    // Safe mathematical evaluation using simple parser
    try {
      // Clean up whitespaces and double check characters to make it super safe
      const cleaned = evalStr.replace(/[^0-9+\-*/%().\s]/g, '');
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${cleaned})`)();
      return result;
    } catch (e) {
      return 0;
    }
  }

  public getStackFrames() {
    return this.stack.map(frame => ({
      functionName: frame.functionName,
      variables: { ...frame.variables }
    }));
  }
}
