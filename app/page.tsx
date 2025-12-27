'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TestPage() {
  const testConnection = async () => {
    const { data, error } = await supabase.from('test').select('*')

    if (error) {
      alert('❌ Lỗi kết nối: ' + error.message)
    } else {
      alert('✅ Kết nối OK – có ' + data.length + ' dòng')
      console.log(data)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Supabase</h1>
      <button onClick={testConnection}>
        Test kết nối
      </button>
    </div>
  )
}
