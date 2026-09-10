export function transientError(
  error: { message?: string; code?: string } | null,
) {
  return (
    !!error &&
    /timeout|timed out|gateway|fetch failed|network|temporar|503|502|504/i.test(
      `${error.message || ""} ${error.code || ""}`,
    )
  );
}
export async function retryRead<
  T extends { error: { message?: string; code?: string } | null },
>(read: () => PromiseLike<T>): Promise<T> {
  let result = await read();
  if (transientError(result.error)) {
    await new Promise((r) => setTimeout(r, 250));
    result = await read();
  }
  return result;
}
