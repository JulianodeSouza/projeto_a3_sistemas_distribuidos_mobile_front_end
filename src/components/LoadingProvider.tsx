import React, { PropsWithChildren, useEffect, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { registerLoadingSetter } from "../utils/loading";

export default function LoadingProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unregister = registerLoadingSetter(setLoading);
    return () => unregister();
  }, []);

  return (
    <>
      {children}
      {loading && <LoadingOverlay />}
    </>
  );
}
