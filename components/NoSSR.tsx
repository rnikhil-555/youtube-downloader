"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const FFmpegComponent = dynamic(() => import("./FFmpegComponent"), {
  ssr: false,
});

export default function NoSSR() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <div>{isClient ? <FFmpegComponent /> : <p>Loading...</p>}</div>;
}
