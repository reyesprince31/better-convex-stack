"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@better-convex-stack/ui/lib/utils";

// --- Tokenizer for Multi-Language Syntax Highlighting ---

interface Token {
  type:
    | "keyword"
    | "string"
    | "comment"
    | "number"
    | "function"
    | "type"
    | "operator"
    | "punctuation"
    | "plain";
  value: string;
}

const KEYWORDS = new Set([
  "import",
  "export",
  "from",
  "default",
  "const",
  "let",
  "var",
  "function",
  "return",
  "class",
  "interface",
  "type",
  "enum",
  "extends",
  "implements",
  "async",
  "await",
  "if",
  "else",
  "switch",
  "case",
  "for",
  "while",
  "do",
  "try",
  "catch",
  "finally",
  "throw",
  "new",
  "typeof",
  "instanceof",
  "in",
  "of",
  "yield",
  "delete",
  "void",
  "true",
  "false",
  "null",
  "undefined",
  "def",
  "self",
  "package",
  "func",
  "struct",
  "pub",
  "fn",
  "mut",
  "use",
  "impl",
  "trait",
  "where",
  "select",
  "from",
  "where",
  "insert",
  "update",
  "delete",
  "create",
  "table",
  "echo",
  "npm",
  "pnpm",
  "npx",
  "cd",
  "git",
  "curl",
  "mkdir",
  "node",
  "install",
  "run",
  "add",
  "init",
  "build",
]);

const TYPES = new Set([
  "string",
  "number",
  "boolean",
  "any",
  "unknown",
  "never",
  "void",
  "object",
  "symbol",
  "bigint",
  "Array",
  "Record",
  "Promise",
  "Partial",
  "Required",
  "Readonly",
  "Pick",
  "Omit",
  "Map",
  "Set",
  "ReactNode",
  "ComponentProps",
  "FC",
  "HTMLAttributes",
  "ButtonHTMLAttributes",
  "int",
  "float",
  "str",
  "bool",
  "list",
  "dict",
  "tuple",
  "i32",
  "i64",
  "u32",
  "u64",
  "usize",
  "String",
  "Vec",
]);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < line.length) {
    // 1. Single-line comments (//, #, --)
    if (
      line.slice(index).startsWith("//") ||
      line.slice(index).startsWith("# ") ||
      line.slice(index) === "#" ||
      line.slice(index).startsWith("-- ")
    ) {
      tokens.push({ type: "comment", value: line.slice(index) });
      break;
    }

    // 2. Strings ("...", '...', `...`)
    const char = line[index];
    if (char === '"' || char === "'" || char === "`") {
      let str = char;
      index++;
      while (index < line.length) {
        if (line[index] === "\\" && index + 1 < line.length) {
          str += line[index] + line[index + 1];
          index += 2;
          continue;
        }
        str += line[index];
        if (line[index] === char) {
          index++;
          break;
        }
        index++;
      }
      tokens.push({ type: "string", value: str });
      continue;
    }

    // 3. Numbers
    if (/\d/.test(char) && (index === 0 || /[\s,([{:+\-*/=<>]/.test(line[index - 1]))) {
      let num = "";
      while (index < line.length && /[\d._xXa-fA-F]/.test(line[index])) {
        num += line[index];
        index++;
      }
      tokens.push({ type: "number", value: num });
      continue;
    }

    // 4. Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(char)) {
      let ident = "";
      while (index < line.length && /[a-zA-Z0-9_$]/.test(line[index])) {
        ident += line[index];
        index++;
      }

      // Check if following character is '(' -> Function call
      const isFunction = index < line.length && line[index] === "(";

      if (KEYWORDS.has(ident)) {
        tokens.push({ type: "keyword", value: ident });
      } else if (TYPES.has(ident) || /^[A-Z][a-zA-Z0-9]*$/.test(ident)) {
        tokens.push({ type: "type", value: ident });
      } else if (isFunction) {
        tokens.push({ type: "function", value: ident });
      } else {
        tokens.push({ type: "plain", value: ident });
      }
      continue;
    }

    // 5. Operators & Punctuation
    if (/[=><!+\-*/%&|^~?:]/.test(char)) {
      tokens.push({ type: "operator", value: char });
      index++;
      continue;
    }

    if (/[()[\]{},;.]/.test(char)) {
      tokens.push({ type: "punctuation", value: char });
      index++;
      continue;
    }

    // 6. Whitespace and other characters
    tokens.push({ type: "plain", value: char });
    index++;
  }

  return tokens;
}

function renderHighlightedTokens(tokens: Token[]) {
  return tokens.map((token, i) => {
    switch (token.type) {
      case "keyword":
        return (
          <span key={i} className="text-purple-400 dark:text-purple-300 font-semibold">
            {token.value}
          </span>
        );
      case "string":
        return (
          <span key={i} className="text-emerald-400 dark:text-emerald-300">
            {token.value}
          </span>
        );
      case "comment":
        return (
          <span key={i} className="text-zinc-500 italic">
            {token.value}
          </span>
        );
      case "number":
        return (
          <span key={i} className="text-amber-400 dark:text-amber-300">
            {token.value}
          </span>
        );
      case "function":
        return (
          <span key={i} className="text-sky-400 dark:text-sky-300">
            {token.value}
          </span>
        );
      case "type":
        return (
          <span key={i} className="text-teal-400 dark:text-teal-300">
            {token.value}
          </span>
        );
      case "operator":
        return (
          <span key={i} className="text-pink-400 dark:text-pink-300">
            {token.value}
          </span>
        );
      case "punctuation":
        return (
          <span key={i} className="text-zinc-400">
            {token.value}
          </span>
        );
      default:
        return <span key={i}>{token.value}</span>;
    }
  });
}

// --- Context & Components ---

interface CodeBlockContextValue {
  code: string;
  language: string;
}

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

export function useCodeBlock() {
  const context = useContext(CodeBlockContext);
  if (!context) {
    throw new Error("useCodeBlock must be used within a <CodeBlock /> component");
  }
  return context;
}

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "code",
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) {
  return (
    <CodeBlockContext.Provider value={{ code, language }}>
      <div
        className={cn(
          "relative my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md font-mono text-xs",
          className,
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            <CodeBlockHeader>
              <CodeBlockTitle>
                <FileCode2 className="size-3.5 text-zinc-400" />
                <CodeBlockFilename>{language}</CodeBlockFilename>
              </CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent code={code} language={language} showLineNumbers={showLineNumbers} />
          </>
        )}
      </div>
    </CodeBlockContext.Provider>
  );
}

export function CodeBlockHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-9 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-3.5 text-[11px] text-zinc-400 select-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CodeBlockTitle({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2 font-medium", className)} {...props}>
      {children}
    </div>
  );
}

export function CodeBlockFilename({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("font-mono text-zinc-300 text-[11px]", className)} {...props}>
      {children}
    </span>
  );
}

export function CodeBlockActions({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export interface CodeBlockCopyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onCopy?: () => void;
  timeout?: number;
}

export function CodeBlockCopyButton({
  onCopy,
  timeout = 2000,
  className,
  children,
  ...props
}: CodeBlockCopyButtonProps) {
  const { code } = useCodeBlock();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    onCopy?.();
    setTimeout(() => setCopied(false), timeout);
  }, [code, onCopy, timeout]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-sans text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition cursor-pointer select-none",
        copied && "text-emerald-400 hover:text-emerald-400",
        className,
      )}
      {...props}
    >
      {children || (
        <>
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </>
      )}
    </button>
  );
}

export interface CodeBlockContentProps extends HTMLAttributes<HTMLPreElement> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlockContent({
  code,
  showLineNumbers = false,
  className,
  ...props
}: CodeBlockContentProps) {
  const lines = code.split("\n");

  return (
    <pre
      className={cn(
        "p-3.5 overflow-x-auto text-[11.5px] leading-relaxed font-mono select-text bg-zinc-950/90 scrollbar-thin",
        className,
      )}
      {...props}
    >
      <code>
        {lines.map((line, lineIndex) => {
          const tokens = tokenizeLine(line);
          return (
            <div key={lineIndex} className="table-row">
              {showLineNumbers && (
                <span className="table-cell pr-4 text-right select-none text-zinc-600 text-[10.5px]">
                  {lineIndex + 1}
                </span>
              )}
              <span className="table-cell">{renderHighlightedTokens(tokens)}</span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}
