import { Memo } from '@/types/memo'
import { supabase } from '@/lib/supabase'

// DB 행을 Memo 인터페이스로 변환하는 헬퍼 함수
const mapDbRowToMemo = (row: {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    created_at: string
    updated_at: string
}): Memo => ({
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags || [],
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
})

// Memo를 DB 삽입용 데이터로 변환하는 헬퍼 함수
const mapMemoToDbInsert = (memo: Memo) => ({
    id: memo.id,
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags,
    // created_at과 updated_at은 DB 트리거에서 자동 설정됨
})

// Memo 업데이트용 데이터로 변환하는 헬퍼 함수
const mapMemoToDbUpdate = (memo: Partial<Memo>) => ({
    ...(memo.title && { title: memo.title }),
    ...(memo.content && { content: memo.content }),
    ...(memo.category && { category: memo.category }),
    ...(memo.tags && { tags: memo.tags }),
    // updated_at은 DB 트리거에서 자동 설정됨
})

export const supabaseUtils = {
    // 모든 메모 가져오기
    getMemos: async (): Promise<Memo[]> => {
        try {
            const { data, error } = await supabase
                .from('memos')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error loading memos from Supabase:', error)
                return []
            }

            return data ? data.map(mapDbRowToMemo) : []
        } catch (error) {
            console.error('Error loading memos from Supabase:', error)
            return []
        }
    },

    // 메모 추가
    addMemo: async (memo: Memo): Promise<Memo | null> => {
        try {
            const { data, error } = await supabase
                .from('memos')
                .insert([mapMemoToDbInsert(memo)])
                .select()
                .single()

            if (error) {
                console.error('Error adding memo to Supabase:', error)
                return null
            }

            return data ? mapDbRowToMemo(data) : null
        } catch (error) {
            console.error('Error adding memo to Supabase:', error)
            return null
        }
    },

    // 메모 업데이트
    updateMemo: async (updatedMemo: Memo): Promise<Memo | null> => {
        try {
            const { data, error } = await supabase
                .from('memos')
                .update(mapMemoToDbUpdate(updatedMemo))
                .eq('id', updatedMemo.id)
                .select()
                .single()

            if (error) {
                console.error('Error updating memo in Supabase:', error)
                return null
            }

            return data ? mapDbRowToMemo(data) : null
        } catch (error) {
            console.error('Error updating memo in Supabase:', error)
            return null
        }
    },

    // 메모 삭제
    deleteMemo: async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('memos')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Error deleting memo from Supabase:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error deleting memo from Supabase:', error)
            return false
        }
    },

    // 메모 검색
    searchMemos: async (query: string): Promise<Memo[]> => {
        try {
            const lowercaseQuery = query.toLowerCase()

            const { data, error } = await supabase
                .from('memos')
                .select('*')
                .or(`title.ilike.%${lowercaseQuery}%,content.ilike.%${lowercaseQuery}%`)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error searching memos in Supabase:', error)
                return []
            }

            // 태그 검색은 클라이언트 사이드에서 추가 필터링
            const memos = data ? data.map(mapDbRowToMemo) : []
            return memos.filter(memo =>
                memo.title.toLowerCase().includes(lowercaseQuery) ||
                memo.content.toLowerCase().includes(lowercaseQuery) ||
                memo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
            )
        } catch (error) {
            console.error('Error searching memos in Supabase:', error)
            return []
        }
    },

    // 카테고리별 메모 필터링
    getMemosByCategory: async (category: string): Promise<Memo[]> => {
        try {
            if (category === 'all') {
                return await supabaseUtils.getMemos()
            }

            const { data, error } = await supabase
                .from('memos')
                .select('*')
                .eq('category', category)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error filtering memos by category in Supabase:', error)
                return []
            }

            return data ? data.map(mapDbRowToMemo) : []
        } catch (error) {
            console.error('Error filtering memos by category in Supabase:', error)
            return []
        }
    },

    // 특정 메모 가져오기
    getMemoById: async (id: string): Promise<Memo | null> => {
        try {
            const { data, error } = await supabase
                .from('memos')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error getting memo by ID from Supabase:', error)
                return null
            }

            return data ? mapDbRowToMemo(data) : null
        } catch (error) {
            console.error('Error getting memo by ID from Supabase:', error)
            return null
        }
    },

    // 모든 메모 삭제 (개발용)
    clearMemos: async (): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('memos')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 레코드 삭제

            if (error) {
                console.error('Error clearing memos from Supabase:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error clearing memos from Supabase:', error)
            return false
        }
    },
}
