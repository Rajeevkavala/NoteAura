"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2Icon, UploadIcon } from "lucide-react";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const UploadPdfDialog = ({ children, isMaxFile }) => {
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntry = useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileUrl = useMutation(api.fileStorage.getFileUrl);
  const embeddDocument = useAction(api.myAction.ingest);

  const { user } = useUser();

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const onFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(".pdf", ""));
      setError(null);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const onUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const postUrl = await generateUploadUrl();
      const result = await axios.post(postUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      const { storageId } = result.data;
      const fileId = uuid4();
      const fileUrl = await getFileUrl({ storageId });

      await addFileEntry({
        fileId,
        storageId,
        fileName: fileName || "Untitled File",
        fileUrl,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      const apiResp = await axios.get(`/api/pdf-loader?pdfUrl=${fileUrl}`);
      await embeddDocument({
        SplitText: apiResp.data.result,
        fileId,
      });

      setFile(null);
      setFileName("");
      setOpen(false);
      toast("File uploaded successfully!");
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className={cn(
            "gap-2 transition-all duration-200",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "dark:bg-slate-100 dark:text-black dark:hover:bg-slate-200"
          )}
          disabled={isUploading || isMaxFile}
        >
          <UploadIcon className="h-4 w-4" />
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "w-full max-w-[90vw] sm:max-w-md md:max-w-lg",
          "bg-white dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700",
          "rounded-lg shadow-xl",
          "p-6"
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-xl font-semibold",
              "text-gray-900 dark:text-gray-100"
            )}
          >
            Upload PDF Document
          </DialogTitle>
          <DialogDescription
            className={cn(
              "text-sm",
              "text-gray-600 dark:text-gray-400"
            )}
          >
            Upload your PDF file for processing and embedding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* File Input Section */}
          <div className="space-y-3">
            <label
              className={cn(
                "text-sm font-medium",
                "text-gray-700 dark:text-gray-300"
              )}
            >
              Select PDF File
            </label>
            <div
              className={cn(
                "flex items-center justify-center w-full",
                "border-2 border-dashed rounded-lg p-6",
                "bg-gray-50 dark:bg-gray-900",
                "border-gray-300 dark:border-gray-600",
                "hover:border-primary hover:bg-primary/5",
                "transition-all duration-200",
                file && "border-primary bg-primary/10"
              )}
            >
              <Input
                type="file"
                accept="application/pdf"
                onChange={onFileSelect}
                disabled={isUploading}
                className={cn(
                  "w-full border-none bg-transparent",
                  "file:text-sm file:text-gray-600 dark:file:text-gray-400",
                  "file:cursor-pointer"
                )}
              />
            </div>
            {file && (
              <p
                className={cn(
                  "text-sm truncate",
                  "text-gray-600 dark:text-gray-400"
                )}
              >
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* File Name Input */}
          <div className="space-y-3">
            <label
              className={cn(
                "text-sm font-medium",
                "text-gray-700 dark:text-gray-300"
              )}
            >
              File Name{" "}
              <span className="text-gray-500 dark:text-gray-500">
                (optional)
              </span>
            </label>
            <Input
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={isUploading}
              className={cn(
                "w-full",
                "bg-gray-50 dark:bg-gray-900",
                "border-gray-300 dark:border-gray-600",
                "text-gray-900 dark:text-gray-100",
                "focus:ring-primary focus:border-primary"
              )}
            />
          </div>

          {/* Progress and Error Display */}
          {isUploading && (
            <div className="space-y-3">
              <Progress
                value={uploadProgress}
                className={cn(
                  "w-full h-2",
                  "bg-gray-200 dark:bg-gray-700"
                )}
              />
              <p
                className={cn(
                  "text-sm text-center",
                  "text-gray-600 dark:text-gray-400"
                )}
              >
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}
          {error && (
            <p
              className={cn(
                "text-sm text-center",
                "text-red-600 dark:text-red-400"
              )}
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className={cn(
                "w-full sm:w-auto",
                "border-gray-300 dark:border-gray-600",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onUpload}
            disabled={!file || isUploading}
            className={cn(
              "w-full sm:w-auto gap-2",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPdfDialog;