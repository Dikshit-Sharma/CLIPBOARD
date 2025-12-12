import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import clsx from 'clsx'

const lowlight = createLowlight(common)

export function RichEditor(props: {
  html: string
  editable: boolean
  onLocalUpdate: (html: string) => void
  onDebouncedUpdate: (html: string) => void
}) {
  const applyingRemote = useRef(false)
  const debounceRef = useRef<number | null>(null)

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false
      }),
      CodeBlockLowlight.configure({ lowlight })
    ],
    []
  )

  const editor = useEditor({
    extensions,
    content: props.html,
    editable: props.editable,
    onUpdate: ({ editor }) => {
      if (applyingRemote.current) return
      const html = editor.getHTML()
      props.onLocalUpdate(html)
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
      debounceRef.current = window.setTimeout(() => props.onDebouncedUpdate(html), 400)
    }
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(props.editable)
  }, [editor, props.editable])

  // Apply remote updates.
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current === props.html) return

    applyingRemote.current = true
    editor.commands.setContent(props.html, { emitUpdate: false })
    applyingRemote.current = false
  }, [editor, props.html])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <ToolbarButton label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor?.can().toggleBold()} />
        <ToolbarButton
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().toggleItalic()}
        />
        <ToolbarButton label="Code" onClick={() => editor?.chain().focus().toggleCode().run()} disabled={!editor?.can().toggleCode()} />
        <ToolbarButton
          label="Code block"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          disabled={!editor?.can().toggleCodeBlock()}
        />
      </div>

      <div
        data-testid="editor"
        className={clsx(
          'rounded-2xl bg-surface-800 p-3 ring-1 ring-white/10',
          props.editable ? 'opacity-100' : 'opacity-70'
        )}
      >
        <EditorContent editor={editor} />
      </div>

      <p className="text-xs text-text-muted">Supports basic formatting: bold, italic, inline code, and code blocks.</p>
    </div>
  )
}

function ToolbarButton(props: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      className={clsx(
        'rounded-xl bg-surface-900 px-3 py-1.5 text-xs font-medium ring-1 ring-white/10 hover:bg-surface-700 disabled:opacity-50',
        'focus:outline-none focus:ring-2 focus:ring-accent-500/50'
      )}
    >
      {props.label}
    </button>
  )
}
