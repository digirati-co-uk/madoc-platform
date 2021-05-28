// Source of issues with UTF-8: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings

export function b64EncodeUnicode(str: string, btoaFunc: (b: string) => string): string {
  return btoaFunc(encodeURIComponent(str));
}

export function b64DecodeUnicode(str: string, atobFunc: (a: string) => string): string {
  return decodeURIComponent(atobFunc(str));
}
