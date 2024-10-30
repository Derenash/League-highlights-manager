export function logFN<T extends (...args: any[]) => any>(func: T): T {
  return function (...args: Parameters<T>): ReturnType<T> {
    // Log the function name
    console.log(`Calling function: ${func.name}`);
    // Log the arguments
    console.log(`Arguments: ${JSON.stringify(args)}`);
    const result = func(...args);
    // Log the return value
    console.log(`Returned value: ${result}`);
    return result;
  } as T;
}