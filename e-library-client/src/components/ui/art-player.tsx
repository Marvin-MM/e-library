"use client";

import React, { useEffect, useRef } from "react";
import Artplayer from "artplayer";

interface ArtPlayerProps {
    option: any;
    getInstance?: (art: Artplayer) => void;
    className?: string;
}

export function ArtPlayerComponent({ option, getInstance, className }: ArtPlayerProps) {
    const artRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!artRef.current) return;

        const art = new Artplayer({
            ...option,
            container: artRef.current,
        });

        if (getInstance) {
            getInstance(art);
        }

        return () => {
            if (art && art.destroy) {
                art.destroy(false);
            }
        };
    }, [option, getInstance]);

    return <div ref={artRef} className={className}></div>;
}
