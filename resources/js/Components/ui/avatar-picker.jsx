import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

function initialsOf(name) {
    return (name || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

/**
 * Circulo de foto de perfil clickeable: muestra la foto actual (o las
 * iniciales si no tiene), y al hacer click abre el selector de archivos.
 * `onChange` recibe el File elegido (o null si se quita). `value` es el
 * File recien elegido (para la vista previa); `currentUrl` es la foto ya
 * guardada en el servidor, usada mientras no se elija una nueva.
 */
export function AvatarPicker({ value, onChange, currentUrl, name, size = "h-20 w-20", uploading = false }) {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!value) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    const displayUrl = previewUrl ?? currentUrl;

    return (
        <div className="relative inline-flex">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "group relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#00ADEE] to-[#024A7D] text-white shadow-md",
                    size
                )}
            >
                {displayUrl ? (
                    <img src={displayUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xl font-bold">{initialsOf(name)}</span>
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </span>
            </button>

            {previewUrl && !uploading && (
                <button
                    type="button"
                    onClick={() => {
                        onChange(null);
                        setPreviewUrl(null);
                        if (inputRef.current) inputRef.current.value = "";
                    }}
                    aria-label="Quitar foto"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-destructive text-white shadow"
                >
                    <X className="h-3 w-3" />
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                }}
            />
        </div>
    );
}
