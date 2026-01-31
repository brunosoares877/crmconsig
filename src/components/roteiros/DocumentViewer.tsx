import React from "react";

interface DocumentViewerProps {
    url: string;
}

export default function DocumentViewer({ url }: DocumentViewerProps) {
    return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-gray-50">
            <iframe
                src={url}
                className="w-full h-full"
                title="Document Viewer"
                frameBorder="0"
            />
        </div>
    );
}
