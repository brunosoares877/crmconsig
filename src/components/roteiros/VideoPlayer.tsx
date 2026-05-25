import React from "react";

interface VideoPlayerProps {
    url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
    return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
                src={url}
                controls
                className="w-full h-full"
                controlsList="nodownload"
            >
                Seu navegador não suporta a reprodução de vídeos.
            </video>
        </div>
    );
}
