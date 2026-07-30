import { createServerFn } from "@tanstack/react-start";
import { DATABASE_REQUIRED_MESSAGE } from "@/lib/db-messages";
import { dbSource, getDatabaseConfigError } from "@/lib/db";

/** Public: whether the server can open a database (for login/demo messaging). */
export const getDbStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    ready: boolean;
    source: typeof dbSource;
    message: string | null;
  }> => {
    const message = getDatabaseConfigError();
    return {
      ready: message == null,
      source: dbSource,
      message,
    };
  },
);

export { DATABASE_REQUIRED_MESSAGE };
