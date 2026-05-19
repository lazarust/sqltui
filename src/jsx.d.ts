import "@opentui/react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      box: import("@opentui/react").BoxProps;
      text: import("@opentui/react").TextProps;
      span: import("@opentui/react").SpanProps;
      scrollbox: import("@opentui/react").ScrollBoxProps;
      input: import("@opentui/react").InputProps;
      textarea: import("@opentui/react").TextareaProps;
      select: import("@opentui/react").SelectProps;
      code: import("@opentui/react").CodeProps;
      diff: import("@opentui/react").DiffProps;
      markdown: import("@opentui/react").MarkdownProps;
      "ascii-font": import("@opentui/react").AsciiFontProps;
      "tab-select": import("@opentui/react").TabSelectProps;
      "line-number": import("@opentui/react").LineNumberProps;
      b: import("@opentui/react").SpanProps;
      i: import("@opentui/react").SpanProps;
      u: import("@opentui/react").SpanProps;
      strong: import("@opentui/react").SpanProps;
      em: import("@opentui/react").SpanProps;
      br: import("@opentui/react").LineBreakProps;
      a: import("@opentui/react").LinkProps;
    }
  }
}
