import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  RemoveFormatting,
  UnderlineIcon,
} from "lucide-react";
import { useEffect } from "react";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  "data-ocid"?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing…",
  "data-ocid": dataOcid,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Placeholder.configure({ placeholder })],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "rte-content focus:outline-none min-h-[120px] px-3 py-2 text-sm text-foreground leading-relaxed",
      },
    },
  });

  // Sync external value changes (e.g. voice transcription filling the field)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    // Only update if content meaningfully differs to avoid cursor jumps
    const normalised = value === "" || value === "<p></p>" ? "" : value;
    const currentNormalised =
      current === "" || current === "<p></p>" ? "" : current;
    if (normalised !== currentNormalised) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const toolbarBtn = (active: boolean) =>
    `p-1.5 rounded transition-all duration-150 ${
      active
        ? "bg-primary/20 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-white/10"
    }`;

  return (
    <div
      className="rte-wrapper rounded-lg border border-white/10 bg-white/5 overflow-hidden flex flex-col"
      data-ocid={dataOcid}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 bg-white/5 flex-wrap">
        <button
          type="button"
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtn(editor.isActive("bold"))}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive("italic"))}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          aria-label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarBtn(editor.isActive("underline"))}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-white/15 mx-0.5" />
        <button
          type="button"
          aria-label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtn(editor.isActive("bulletList"))}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          aria-label="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarBtn(editor.isActive("orderedList"))}
          title="Ordered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-white/15 mx-0.5" />
        <button
          type="button"
          aria-label="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          className={toolbarBtn(false)}
          title="Clear formatting"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
