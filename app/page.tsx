"use client"

import { SummaryItem } from "@/lib/store"
import { useEffect, useState } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function Home() {
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [form, setForm] = useState({title:"", category:"", summary:""});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSummaries = async() => {
    const res = await fetch(`${BASE_URL}/api/summaries`);
    const data = await res.json();
    setSummaries(data);
  }

  useEffect(()=>{
    fetchSummaries();
  }, []);

  const handleSubmit = async() => {
    const url = editingId ? `${BASE_URL}/api/summaries/${editingId}` : `${BASE_URL}/api/summaries`;
    const method = editingId ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({title:"", category:"", summary:""});
    setEditingId(null);
    fetchSummaries();
  }

  const handleEdit = (item:SummaryItem) => {
    setEditingId(item.id);
    setForm({title:item.title, category: item.category, summary:item.summary})
  };

  const handleDelete = async (id:string) => {
    await fetch(`${BASE_URL}/api/summaries/${id}`, {method:"DELETE"});
    fetchSummaries();
  }
  return (
    <div className="p-8 max-w-2xl w-full mx-auto">
      <div className="border rounded p-4 mb-8 flex flex-col gap-3">
        <input
          className="border p-2 rounded w-full"
          placeholder="제목"
          value={form.title}
          onChange={(e)=>setForm({...form, title:e.target.value})}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="카테고리"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <textarea
          className="border p-2 rounded w-full"
          placeholder="요약 내용"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleSubmit}
        >
          {editingId ? "수정 완료" : "저장"}
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-6">요약 목록</h1>
      {summaries.map((item)=>(
        <div key={item.id} className="border rounded p-4 mb-4">
          <div className="font-semibold">{item.title}</div>
          <div className="text-sm text-gray-600">{item.category}</div>
          <div className="mt-2">{item.summary}</div>
          <div className="flex gap-2 mt-3">
            <button className="text-blue-500" onClick={()=>handleEdit(item)}>수정</button>
            <button className="text-red-500" onClick={()=>handleDelete(item.id)}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  )
}
