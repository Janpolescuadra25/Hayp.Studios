export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, unknown>,
    error?: unknown
  ): LogPayload {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(data && { data }),
    };

    if (error instanceof Error) {
      payload.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      };
    } else if (error) {
      payload.error = {
        message: String(error),
      };
    }

    return payload;
  }

  private output(payload: LogPayload) {
    const logString = JSON.stringify(payload);
    switch (payload.level) {
      case "error":
        console.error(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "info":
        console.info(logString);
        break;
      case "debug":
        if (process.env.NODE_ENV !== "production") {
          console.debug(logString);
        }
        break;
    }
  }

  debug(message: string, context?: string, data?: Record<string, unknown>) {
    this.output(this.formatLog("debug", message, context, data));
  }

  info(message: string, context?: string, data?: Record<string, unknown>) {
    this.output(this.formatLog("info", message, context, data));
  }

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    this.output(this.formatLog("warn", message, context, data));
  }

  error(message: string, error?: unknown, context?: string, data?: Record<string, unknown>) {
    this.output(this.formatLog("error", message, context, data, error));
  }
}

export const logger = new Logger();