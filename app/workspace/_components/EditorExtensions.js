import { chatSession } from "@/configs/AIModel";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BoldIcon,
  Download,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Highlighter,
  ItalicIcon,
  List,
  ListOrdered,
  Save,
  Sparkles,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Document, Packer, Paragraph, TextRun } from "docx";

const EditorExtensions = ({ editor }) => {
  const { fileId } = useParams();
  const { user } = useUser();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const SearchAI = useAction(api.myAction.search);
  const saveNotes = useMutation(api.notes.AddNotes);

  const buttonClass =
    "p-2 rounded dark:hover:bg-gray-500 hover:bg-gray-100 transition-colors duration-200";
  const activeClass = "bg-blue-100 text-blue-600";

  // Save handler with debouncing
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await saveNotes({
        notes: editor.getHTML(),
        fileId: fileId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });
      toast.success("Notes Saved Successfully!");
    } catch (error) {
      toast.error("Failed to save notes");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, fileId, saveNotes, user]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // AI search handler
  const onAiClick = async () => {
    try {
      setIsLoadingAI(true);
      toast("AI is processing your request...");

      const AllText = editor.getHTML();
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        " "
      ).trim();

      if (!selectedText) {
        toast.error("Please select some text first");
        setIsLoadingAI(false);
        return;
      }

      const result = await SearchAI({
        query: selectedText,
        fileId: fileId,
      });

      const UnformattedAns = JSON.parse(result);
      let AllUnformattedAns = UnformattedAns
        ?.map((item) => item.pageContent)
        .join(" ") || "No content found";

        const PROMPT = `
        As a note-taking assistant for students, generate a well-structured HTML response for the following question: "${selectedText}".
        
        If the provided answer content is relevant, format it properly in HTML for clarity and readability.
        
        If the answer content ("${AllUnformattedAns}") is not suitable, generate a well-explained response using Gemini, ensuring it is concise, informative, and formatted in HTML.
        
        Provide only the HTML output without any additional descriptions or context.
      `;

      const AiModelResult = await chatSession.sendMessage(PROMPT);
      const FinalAns = AiModelResult.response
        .text()
        .replace(/```html|```/g, "")
        .trim();

      editor.commands.setContent(
        `${AllText}<p><strong>Answer:</strong> ${FinalAns}</p>`
      );
      
      await handleSave();
      toast.success("AI response added successfully!");
    } catch (error) {
      toast.error("Failed to process AI request");
      console.error("AI processing error:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Convert HTML to plain text with basic formatting for DOCX
  const htmlToDocxContent = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    const paragraphs = [];
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return new TextRun({
          text: node.textContent,
          bold: node.parentElement?.tagName === "STRONG" || node.parentElement?.tagName === "B",
          italics: node.parentElement?.tagName === "EM" || node.parentElement?.tagName === "I",
          underline: node.parentElement?.tagName === "U" ? {} : undefined,
          break: node.parentElement?.tagName === "BR" ? 1 : 0,
        });
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes).map(processNode).filter(Boolean);
        switch (node.tagName) {
          case "P":
            return new Paragraph({ children });
          case "H1":
            return new Paragraph({ children, heading: "Heading1" });
          case "H2":
            return new Paragraph({ children, heading: "Heading2" });
          case "H3":
            return new Paragraph({ children, heading: "Heading3" });
          default:
            return children;
        }
      }
    };

    doc.body.childNodes.forEach((node) => {
      const result = processNode(node);
      if (result) paragraphs.push(result instanceof Array ? result : [result]);
    });
    
    return paragraphs.flat();
  };

  // Download handlers
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setShowDownloadOptions(false);
      const content = editor.getHTML();
      
      const opt = {
        margin: 1,
        filename: `document_${fileId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(content).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
      console.error("PDF download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setIsDownloading(true);
      setShowDownloadOptions(false);
      const content = editor.getHTML();
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: htmlToDocxContent(content),
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document_${fileId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Word document downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download Word document");
      console.error("Word download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Button animation variants
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
  };

  if (!editor) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-5 bg-white dark:bg-black dark:text-white border-b sticky top-0 z-10"
    >
      <div className="control-group">
        <div className="button-group flex gap-2 flex-wrap">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${buttonClass} ${editor.isActive("heading", { level: 1 }) ? activeClass : ""}`}
            title="Heading 1"
          >
            <Heading1Icon size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${buttonClass} ${editor.isActive("heading", { level: 2 }) ? activeClass : ""}`}
            title="Heading 2"
          >
            <Heading2Icon size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${buttonClass} ${editor.isActive("heading", { level: 3 }) ? activeClass : ""}`}
            title="Heading 3"
          >
            <Heading3Icon size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${buttonClass} ${editor.isActive("bold") ? activeClass : ""}`}
            title="Bold"
          >
            <BoldIcon size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${buttonClass} ${editor.isActive("italic") ? activeClass : ""}`}
            title="Italic"
          >
            <ItalicIcon size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${buttonClass} ${editor.isActive("underline") ? activeClass : ""}`}
            title="Underline"
          >
            <Underline size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${buttonClass} ${editor.isActive("bulletList") ? activeClass : ""}`}
            title="Bullet List"
          >
            <List size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${buttonClass} ${editor.isActive("orderedList") ? activeClass : ""}`}
            title="Ordered List"
          >
            <ListOrdered size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleHighlight({ color: "red" }).run()}
            className={`${buttonClass} ${editor.isActive("highlight", { color: "red" }) ? activeClass : ""}`}
            title="Highlight"
          >
            <Highlighter size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${buttonClass} ${editor.isActive("strike") ? activeClass : ""}`}
            title="Strikethrough"
          >
            <Strikethrough size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`${buttonClass} ${editor.isActive({ textAlign: "left" }) ? activeClass : ""}`}
            title="Align Left"
          >
            <AlignLeft size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`${buttonClass} ${editor.isActive({ textAlign: "center" }) ? activeClass : ""}`}
            title="Align Center"
          >
            <AlignCenter size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`${buttonClass} ${editor.isActive({ textAlign: "right" }) ? activeClass : ""}`}
            title="Align Right"
          >
            <AlignRight size={20} />
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onAiClick}
            disabled={isLoadingAI}
            className={`${buttonClass} relative`}
            title="AI Assistant"
          >
            <AnimatePresence mode="wait">
              {isLoadingAI ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 size={20} className="animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Sparkles size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleSave}
            disabled={isSaving}
            className={`${buttonClass} relative`}
            title="Save Notes (Ctrl+S)"
          >
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 size={20} className="animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Save size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="relative">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              disabled={isDownloading}
              className={`${buttonClass} relative`}
              title="Download Options"
            >
              <AnimatePresence mode="wait">
                {isDownloading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 size={20} className="animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Download size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {showDownloadOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded shadow-lg z-20"
                >
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    disabled={isDownloading}
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    disabled={isDownloading}
                  >
                    Download as Word
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditorExtensions;