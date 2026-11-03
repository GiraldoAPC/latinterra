import { useRef } from "react";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";

function formatFileSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Selector de archivo con mejor diseno que el <input type="file"> nativo del
 * navegador - boton con icono antes de elegir, y una tarjeta con el nombre
 * del archivo + boton para quitarlo despues.
 */
export default function FileInput({ value, onChange, accept, id }) {
    const inputRef = useRef(null);

    const clear = () => {
        onChange(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div>
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />

            {!value ? (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-md border border-dashed border-input px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-[#00ADEE] hover:bg-[#00ADEE]/5 hover:text-[#024A7D]"
                >
                    <Upload className="h-4 w-4 shrink-0" />
                    Seleccionar archivo...
                </button>
            ) : (
                <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-[#024A7D]" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[#024A7D]">{value.name}</p>
                        <p className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            Archivo adjuntado{formatFileSize(value.size) ? ` · ${formatFileSize(value.size)}` : ""} — se
                            sube al registrar
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={clear}
                        title="Quitar archivo"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
