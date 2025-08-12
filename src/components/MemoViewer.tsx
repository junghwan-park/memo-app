'use client'

import { useEffect, useRef } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoViewerProps {
    memo: Memo | null
    isOpen: boolean
    onClose: () => void
    onEdit: (memo: Memo) => void
    onDelete: (id: string) => void
}

export default function MemoViewer({
    memo,
    isOpen,
    onClose,
    onEdit,
    onDelete,
}: MemoViewerProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleDelete = async () => {
        if (memo && window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
            try {
                await onDelete(memo.id)
                onClose()
            } catch (error) {
                console.error('메모 삭제 중 오류:', error)
                alert('메모 삭제 중 오류가 발생했습니다.')
            }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getCategoryColor = (category: string) => {
        const colors = {
            personal: 'bg-blue-100 text-blue-800',
            work: 'bg-green-100 text-green-800',
            study: 'bg-purple-100 text-purple-800',
            idea: 'bg-yellow-100 text-yellow-800',
            other: 'bg-gray-100 text-gray-800',
        }
        return colors[category as keyof typeof colors] || colors.other
    }

    if (!isOpen || !memo) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleBackgroundClick}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {memo.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(memo.category)}`}
                            >
                                {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                                    memo.category}
                            </span>
                            <span className="text-sm text-gray-500">
                                {formatDate(memo.updatedAt)}
                            </span>
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 ml-4">
                        <button
                            onClick={() => onEdit(memo)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            편집
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                            삭제
                        </button>
                    </div>
                </div>

                {/* 내용 */}
                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">내용</h3>
                        <div className="bg-gray-50 rounded-lg p-4" data-color-mode="light">
                            <MDEditor.Markdown
                                source={memo.content}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#374151'
                                }}
                            />
                        </div>
                    </div>

                    {/* 태그 */}
                    {memo.tags.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">태그</h3>
                            <div className="flex gap-2 flex-wrap">
                                {memo.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">생성일:</span>
                                <span className="ml-2">{formatDate(memo.createdAt)}</span>
                            </div>
                            <div>
                                <span className="font-medium">수정일:</span>
                                <span className="ml-2">{formatDate(memo.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    )
}
