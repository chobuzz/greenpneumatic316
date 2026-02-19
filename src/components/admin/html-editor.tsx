
"use client"

import dynamic from "next/dynamic"
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
})

interface HtmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ],
}

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list',
    'align',
    'link', 'image'
]

export default function HtmlEditor({ value, onChange, placeholder }: HtmlEditorProps) {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:border-primary transition-colors quill-editor-container">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="min-h-[300px]"
            />
            <style jsx global>{`
                .quill-editor-container .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    background: #f8fafc;
                }
                .quill-editor-container .ql-container {
                    border: none !important;
                    font-family: inherit;
                    font-size: 16px;
                }
                .quill-editor-container .ql-editor {
                    min-height: 300px;
                    padding: 20px;
                    line-height: 1.6;
                }
                .quill-editor-container .ql-editor.ql-blank::before {
                    left: 20px;
                    color: #94a3b8;
                    font-style: normal;
                }
            `}</style>
        </div>
    )
}
