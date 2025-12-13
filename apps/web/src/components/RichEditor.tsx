import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { common, createLowlight } from 'lowlight'
import clsx from 'clsx'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  FileText,
  Copy,
  Check
} from 'lucide-react'

const lowlight = createLowlight(common)

export function RichEditor(props: {
  html: string
  editable: boolean
  onLocalUpdate: (html: string) => void
  onDebouncedUpdate: (html: string) => void
}) {
  const applyingRemote = useRef(false)
  const debounceRef = useRef<number | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [copied, setCopied] = useState(false)

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        strike: false
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Heading.configure({
        levels: [1, 2, 3]
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-400 hover:text-accent-300 underline',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Strike,
      Underline,
      Placeholder.configure({
        placeholder: 'Start typing or paste your content here...'
      }),
      CharacterCount
    ],
    []
  )

  const editor = useEditor({
    extensions,
    content: props.html,
    editable: props.editable,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none'
      }
    },
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

  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim()
    if (!trimmed) return trimmed

    // If it already starts with http:// or https://, return as-is
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed
    }

    // If it starts with //, add https:
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`
    }

    // Otherwise, add https://
    return `https://${trimmed}`
  }

  const setLink = () => {
    if (linkUrl) {
      const normalizedUrl = normalizeUrl(linkUrl)
      editor?.chain().focus().setLink({ href: normalizedUrl }).run()
    } else {
      editor?.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setShowLinkInput(false)
  }

  const exportAsMarkdown = () => {
    if (!editor) return
    const text = editor.getText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportAsHTML = () => {
    if (!editor) return
    const html = editor.getHTML()
    navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = editor ? editor.storage.characterCount.words() : 0
  const charCount = editor ? editor.storage.characterCount.characters() : 0

  if (!editor) return null

  return (
    <div className="space-y-3">
      {props.editable && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-900/50 p-2 ring-1 ring-white/5">
          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <ToolbarButton
              icon={<Bold className="h-4 w-4" />}
              label="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
            />
            <ToolbarButton
              icon={<Italic className="h-4 w-4" />}
              label="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
            />
            <ToolbarButton
              icon={<UnderlineIcon className="h-4 w-4" />}
              label="Underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
            />
            <ToolbarButton
              icon={<Strikethrough className="h-4 w-4" />}
              label="Strikethrough"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
            />
          </div>

          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <ToolbarButton
              icon={<Heading1 className="h-4 w-4" />}
              label="Heading 1"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
            />
            <ToolbarButton
              icon={<Heading2 className="h-4 w-4" />}
              label="Heading 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
            />
            <ToolbarButton
              icon={<Heading3 className="h-4 w-4" />}
              label="Heading 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
            />
          </div>

          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <ToolbarButton
              icon={<List className="h-4 w-4" />}
              label="Bullet List"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
            />
            <ToolbarButton
              icon={<ListOrdered className="h-4 w-4" />}
              label="Ordered List"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
            />
            <ToolbarButton
              icon={<Quote className="h-4 w-4" />}
              label="Blockquote"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
            />
          </div>

          <div className="flex items-center gap-1 border-r border-white/10 pr-2">
            <ToolbarButton
              icon={<Code className="h-4 w-4" />}
              label="Inline Code"
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
            />
            <ToolbarButton
              icon={<Code2 className="h-4 w-4" />}
              label="Code Block"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="relative">
              <ToolbarButton
                icon={<LinkIcon className="h-4 w-4" />}
                label="Link"
                onClick={() => {
                  const url = editor.getAttributes('link').href
                  setLinkUrl(url || '')
                  setShowLinkInput(!showLinkInput)
                }}
                active={editor.isActive('link')}
              />
              {showLinkInput && (
                <div className="absolute left-0 top-full z-10 mt-2 flex gap-2 rounded-lg bg-surface-800 p-2 ring-1 ring-white/10">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Enter URL"
                    className="rounded-lg bg-surface-700 px-2 py-1 text-sm text-text-primary placeholder:text-text-muted outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setLink()
                      } else if (e.key === 'Escape') {
                        setShowLinkInput(false)
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={setLink}
                    className="rounded-lg bg-accent-500 px-2 py-1 text-xs text-white hover:bg-accent-400"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 border-l border-white/10 pl-2">
            <ToolbarButton
              icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              label="Copy as Text"
              onClick={exportAsMarkdown}
            />
            <ToolbarButton
              icon={<FileText className="h-4 w-4" />}
              label="Copy as HTML"
              onClick={exportAsHTML}
            />
          </div>
        </div>
      )}

      <div
        data-testid="editor"
        className={clsx(
          'rounded-2xl bg-gradient-to-br from-surface-800/80 to-surface-800/60 p-6 ring-1 ring-white/10 shadow-lg transition-all',
          props.editable
            ? 'opacity-100 hover:ring-white/20 focus-within:ring-2 focus-within:ring-accent-500/30'
            : 'opacity-80'
        )}
      >
        <EditorContent editor={editor} />
      </div>

      {props.editable && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          <p className="text-xs">Supports rich formatting: headings, lists, links, code blocks, and more.</p>
        </div>
      )}
    </div>
  )
}

function ToolbarButton(props: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      title={props.label}
      className={clsx(
        'flex items-center justify-center rounded-lg p-2 text-text-muted transition-all',
        'hover:bg-surface-700 hover:text-text-primary',
        'focus:outline-none focus:ring-2 focus:ring-accent-500/50',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        props.active && 'bg-accent-500/20 text-accent-400 ring-1 ring-accent-500/30'
      )}
    >
      {props.icon}
    </button>
  )
}
