'use client'
import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import EditorExtensions from './EditorExtensions'
import Heading from '@tiptap/extension-heading'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Highlight from '@tiptap/extension-highlight'
import Strike from '@tiptap/extension-strike'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

const TextEditor = ({ fileId }) => {
  const notes = useQuery(api.notes.GetNotes, {
    fileId: fileId
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Placeholder.configure({
        placeholder: "Start Taking Your Notes Here 📒",
      }),
      Underline,
      BulletList,
      Highlight.configure({ multicolor: true }),
      OrderedList,
      Strike,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[30rem] prose max-w-none p-5",
      },
    },
    content: '',
  })

  useEffect(() => {
    if (editor && notes !== undefined) {
      editor.commands.setContent(notes || '')
    }
  }, [notes, editor])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="border ml-2 mt-2 rounded-lg shadow-sm h-[80vh] animate-pulse">
      <div className="h-12 bg-gray-200 m-2 rounded"></div>
      <div className="h-[calc(80vh-4rem)] m-2">
        <div className="space-y-4 p-5">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  )

  // Show loading state while notes are being fetched
  if (notes === undefined) {
    return <LoadingSkeleton />
  }

  return (
    <div className="border mx-2 sm:ml-2 mt-2 rounded-lg shadow-sm">
      <EditorExtensions editor={editor} />
      <div className="editor-content overflow-scroll h-[60vh] sm:h-[80vh] relative">
        <EditorContent editor={editor} />
        {editor?.isEmpty && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-center text-sm sm:text-base p-2">
            Type the question and then select the text and click on the generate button to get an answer
          </div>
        )}
      </div>
    </div>
  )
}

export default TextEditor