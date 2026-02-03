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
          className="bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl animate-slide-up"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="truncate pr-4">
              <p
                className="text-sm font-medium text-white truncate"
                title={file.fileName}
              >
                {file.fileName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{file.status}</p>
            </div>
            {(file.status === "completed" || file.status === "failed") && (
              <button
                onClick={() => dispatch(removeUpload(file.id))}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                file.status === "failed"
                  ? "bg-red-500"
                  : file.status === "completed"
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
              }`}
              style={{ width: `${file.progress}%` }}
            >
              {file.status === "uploading" && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
            </div>
          </div>

          {file.error && (
            <p className="text-xs text-red-400 mt-2">{String(file.error)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default UploadProgress;
