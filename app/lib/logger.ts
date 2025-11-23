// app/lib/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

const CURRENT_LEVEL: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const ACTIVE_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? "info";

/**
 * Safely serialize unknown values to JSON-compatible structure
 */
function safeSerialize(value: unknown): unknown {
  try {
    return JSON.parse(
      JSON.stringify(value, Object.getOwnPropertyNames(value))
    );
  } catch {
    return String(value);
  }
}

/**
 * Format log entry as JSON
 */
function format(level: LogLevel, context: string, args: unknown[]) {
  return JSON.stringify({
    level,
    context,
    timestamp: new Date().toISOString(),
    message: args.map(String).join(" "),
    meta: args.map(safeSerialize),
  });
}

/**
 * Create a logger with context
 */
export function logger(context: string) {
  function shouldLog(level: LogLevel) {
    return CURRENT_LEVEL[level] >= CURRENT_LEVEL[ACTIVE_LEVEL];
  }

  return {
    debug: (...msg: unknown[]) => {
      if (shouldLog("debug")) console.debug(format("debug", context, msg));
    },
    info: (...msg: unknown[]) => {
      if (shouldLog("info")) console.log(format("info", context, msg));
    },
    warn: (...msg: unknown[]) => {
      if (shouldLog("warn")) console.warn(format("warn", context, msg));
    },
    error: (...msg: unknown[]) => {
      if (shouldLog("error")) console.error(format("error", context, msg));
    },
  };
}
