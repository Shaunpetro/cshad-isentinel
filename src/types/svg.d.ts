// src/types/svg.d.ts
declare module "*.svg" {
    import React from "react";
    const SVG: React.FC<{ width?: number; height?: number }>;
    export default SVG;
  }