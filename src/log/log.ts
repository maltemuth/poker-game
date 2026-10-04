export const log = (
  message: string,
  level: "warn" | "log" | "info" | "error" = "log"
): void => {
  console[level](message);
};
