import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeUpload } from "../store/Slices/uploadSlice";

function UploadProgress() {
  const uploads = useSelector((state) => state.upload.uploads);
  const dispatch = useDispatch();

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 space-y-3 z-50">
      {uploads.map((file) => (
        <div
          key={file.id}
          className="p-3.5 rounded-xl animate-slide-up"
          style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="truncate pr-4">
              <p className="text-sm font-medium truncate" title={file.fileName} style={{ color: "var(--text-primary)" }}>
                {file.fileName}
              </p>
              <p className="text-xs capitalize" style={{ color: "var(--text-tertiary)" }}>{file.status}</p>
            </div>
            {(file.status === "completed" || file.status === "failed") && (
              <button
                onClick={() => dispatch(removeUpload(file.id))}
                className="transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${file.progress}%`,
                backgroundColor: file.status === "failed" ? "var(--danger)" : file.status === "completed" ? "#22c55e" : "var(--accent)",
              }}
            />
          </div>

          {file.error && (
            <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>{String(file.error)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default UploadProgress;
