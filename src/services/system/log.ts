import { inspect } from "util";

export class Log {
  public static dump = (obj: any) =>
    console.log(
      inspect(obj, {
        depth: null,
        colors: true,
        maxArrayLength: null,
        maxStringLength: null,
      })
    );
}
