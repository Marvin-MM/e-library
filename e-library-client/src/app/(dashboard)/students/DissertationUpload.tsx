import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UploadedFile {
  name: string;
  size: number;
  status: "uploading" | "done";
  progress: number;
}

export function DissertationUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [title, setTitle] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [keywords, setKeywords] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles: File[]) => {
    const mapped: UploadedFile[] = newFiles.map((f) => ({
      name: f.name,
      size: f.size,
      status: "uploading" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...mapped]);

    // Simulate upload
    mapped.forEach((file, i) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, progress, status: progress >= 100 ? "done" : "uploading" }
              : f
          )
        );
      }, 400);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          Dissertation Vault
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your dissertation for review and submission.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-10 transition-colors duration-200 ${
          dragOver
            ? "border-primary bg-white/10"
            : "border-primary/50 bg-white/50 hover:border-primary/40"
        }`}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">
          Drag & drop your PDF here
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          or click to browse files
        </p>
        <label>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
          <Button variant="outline" size="sm" asChild className="border-none shadow-none bg-transparent">
            <span className="cursor-pointer text-blue-900">Tap to Upload Files</span>
          </Button>
        </label>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="relative bg-card  p-3 overflow-hidden">
              {file.status === "uploading" && (
                <div
                  className="absolute top-0 left-0 h-0.5 bg-primary transition-all duration-500"
                  style={{ width: `${file.progress}%` }}
                />
              )}
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                {file.status === "done" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Form */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground ">
            Dissertation Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your dissertation title"
           className="mt-1 w-full h-10  rounded border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-none"
            />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground ">
              Supervisor
            </label>
            <Input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Dr. Name"
              className="mt-1 w-full h-10  rounded border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground ">
              Keywords
            </label>
            <Input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="AI, Machine Learning..."
              className="mt-1 w-full h-10  rounded border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-none"
            />
          </div>
        </div>
        <Button className="w-full mt-2 rounded-xs h-10 " disabled={files.length === 0 || !title} >
          Submit Dissertation
        </Button>
      </div>
    </div>
  );
}
