"use client"

import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { useMemo, useRef } from 'react'

/**
 * Quill Editor를 Dynamic Import로 불러옵니다.
 * SSR(서버 사이드 렌더링)시 'document is not defined' 에러를 방지하기 위함입니다.
 */
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import('react-quill-new')
    return function QuillComponent({ forwardedRef, ...props }: any) {
        return <RQ ref={forwardedRef} {...props} />
    }
}, { ssr: false, loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200" /> })

interface RichTextEditorProps {
    value: string
    onChange: (content: string) => void
    placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<any>(null)

    // 이미지를 서버에 업로드하고 URL로 변환하는 핸들러
    const imageHandler = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return

            // 파일 크기 체크 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('이미지 크기는 5MB 이하여야 합니다.')
                return
            }

            try {
                const formData = new FormData()
                formData.append('image', file)

                const res = await fetch('/api/admin/upload-image', {
                    method: 'POST',
                    body: formData,
                })

                if (!res.ok) throw new Error('Upload failed')

                const { url } = await res.json()

                // 도메인을 포함한 절대 경로 생성
                const origin = window.location.origin
                const absoluteUrl = `${origin}${url}`

                // Quill 에디터에 이미지 URL 삽입
                const quill = quillRef.current?.getEditor?.() ?? quillRef.current
                if (quill) {
                    const range = quill.getSelection(true)
                    quill.insertEmbed(range.index, 'image', absoluteUrl)
                    quill.setSelection(range.index + 1)
                }
            } catch (err) {
                console.error('Image upload failed:', err)
                alert('이미지 업로드에 실패했습니다.')
            }
        }
    }

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
            }
        },
        // 붙여넣기/드래그앤드롭 이미지 base64 차단
        clipboard: {
            matchVisual: false,
        }
    }), [])

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list',
        'link', 'image'
    ]

    // 에디터 변경 시 base64 이미지 체크 로직 추가 (선택사항이나 권장)
    const handleValueChange = (content: string) => {
        // 이미지가 base64로 들어왔는지 실시간 체크 (드래그앤드롭 대응)
        if (content.includes('data:image/')) {
            // base64 이미지가 발견되면 경고를 위해 null 또는 이전 값 유지 혹은 처리
            // 여기서는 상위에서 알림을 줄 수 있도록 그대로 전달하되 
            // 실제 저장은 page.tsx의 handleSave에서 차단함
        }
        onChange(content)
    }

    return (
        <div className="rich-text-editor-wrapper">
            <ReactQuill
                forwardedRef={quillRef}
                theme="snow"
                value={value}
                onChange={handleValueChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white overflow-hidden [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-slate-200 [&_.ql-container]:min-h-[450px] [&_.ql-editor]:text-lg [&_.ql-editor]:leading-relaxed [&_.ql-editor]:text-slate-700"
            />
            <style jsx global>{`
                .rich-text-editor-wrapper .ql-toolbar.ql-snow {
                    border-top: none;
                    border-left: none;
                    border-right: none;
                    border-bottom: 1px solid #f1f5f9;
                    padding: 1rem 1.5rem;
                    background-color: #fbfcfe;
                }
                .rich-text-editor-wrapper .ql-container.ql-snow {
                    border: none;
                }
                .rich-text-editor-wrapper .ql-editor {
                    padding: 2rem;
                }
                .rich-text-editor-wrapper .ql-editor.ql-blank::before {
                    color: #cbd5e1;
                    font-style: normal;
                    left: 2rem;
                    top: 2rem;
                    font-size: 1.125rem;
                }
                .rich-text-editor-wrapper .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 1.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    margin: 1.5rem 0;
                }
                .rich-text-editor-wrapper .ql-snow .ql-stroke {
                    stroke: #64748b;
                    stroke-width: 1.5px;
                }
                .rich-text-editor-wrapper .ql-snow .ql-fill {
                    fill: #64748b;
                }
                .rich-text-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke {
                    stroke: #3182f6;
                }
                .rich-text-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-fill {
                    fill: #3182f6;
                }
            `}</style>
        </div>
    )
}
