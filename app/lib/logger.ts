// app/lib/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

const CURRENT_LEVEL: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const ACTIVE_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "info";

function safeSerialize(value: any) {
  try {
    return JSON.parse(
      JSON.stringify(value, Object.getOwnPropertyNames(value))
    );
  } catch {
    return String(value);
  }
}

function format(level: LogLevel, context: string, args: any[]) {
  return JSON.stringify({
    level,
    context,
    timestamp: new Date().toISOString(),
    message: args.map(String).join(" "),
    meta: args.map(safeSerialize),
  });
}

export function logger(context: string) {
  function shouldLog(level: LogLevel) {
    return CURRENT_LEVEL[level] >= CURRENT_LEVEL[ACTIVE_LEVEL];
  }

  return {
    debug: (...msg: any[]) => {
      if (shouldLog("debug")) console.debug(format("debug", context, msg));
    },
    info: (...msg: any[]) => {
      if (shouldLog("info")) console.log(format("info", context, msg));
    },
    warn: (...msg: any[]) => {
      if (shouldLog("warn")) console.warn(format("warn", context, msg));
    },
    error: (...msg: any[]) => {
      if (shouldLog("error")) console.error(format("error", context, msg));
    },
  };
}
