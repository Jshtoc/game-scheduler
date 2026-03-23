declare module "twemoji-parser" {
  interface EmojiEntity {
    url: string;
    indices: [number, number];
    text: string;
    type: string;
  }

  interface ParsingOptions {
    buildUrl?: (codepoints: string, assetType: string) => string;
    assetType?: string;
  }

  export function parse(
    text: string,
    options?: ParsingOptions
  ): EmojiEntity[];

  export function toCodePoint(unicodeSurrogates: string, sep?: string): string;
}
