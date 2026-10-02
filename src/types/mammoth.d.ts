declare module 'mammoth' {
  interface Result {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<Result>;
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<Result>;
}
