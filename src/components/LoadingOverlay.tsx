import React from "react";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const spinnerStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  border: "8px solid rgba(255,255,255,0.2)",
  borderTopColor: "#fff",
  animation: "spin 1s linear infinite",
};

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  border: 0,
};

const styleSheet = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

export default function LoadingOverlay() {
  return (
    <div style={overlayStyle} aria-live="polite" aria-busy="true">
      <style>{styleSheet}</style>
      <div style={spinnerStyle} />
      <span style={srOnly}>Loading...</span>
    </div>
  );
}
