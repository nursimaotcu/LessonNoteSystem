"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [viewingArchive, setViewingArchive] = useState(false); 

  // --- TOKEN KONTROLÜ VE VERİ ÇEKME ---
  const fetchNotes = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const endpoint = viewingArchive 
        ? `https://localhost:7227/api/Notes/archive` 
        : `https://localhost:7227/api/Notes/my-notes`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('userToken');
        router.push('/');
        return;
      }

      const data = await res.json();
      setNotes(data);
    } catch (err) {
      toast.error("Veriler getirilemedi.");
    }
  };

  useEffect(() => { fetchNotes(); }, [viewingArchive]);

  // --- ÇIKIŞ YAPMA ---
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    toast.success("Güvenli çıkış yapılıyor...");
    setTimeout(() => { router.push('/'); }, 1000);
  };

  // --- NOT KAYDETME / GÜNCELLEME ---
  const handleSaveNote = async () => {
    if (!title || !description) return toast.error("Lütfen tüm alanları doldurun!");
    const token = localStorage.getItem('userToken');

    const url = editingNoteId ? `https://localhost:7227/api/Notes/${editingNoteId}` : 'https://localhost:7227/api/Notes';
    const method = editingNoteId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ id: editingNoteId || 0, title, description, isDeleted: false })
    });

    if (res.ok) {
      toast.success(editingNoteId ? "Not güncellendi!" : "Yeni not eklendi!");
      setTitle(''); setDescription(''); setEditingNoteId(null);
      fetchNotes();
    }
  };

  // --- DOSYA SİLME ---
  const handleRemoveFile = async (noteId: number) => {
    const token = localStorage.getItem('userToken');
    const loading = toast.loading("Dosya kaldırılıyor...");
    
    const res = await fetch(`https://localhost:7227/api/Notes/remove-file/${noteId}`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      toast.success("Dosya başarıyla kaldırıldı!", { id: loading });
      fetchNotes();
    } else {
      toast.error("Dosya kaldırılırken bir hata oluştu!");
    }
  };

  // --- ARŞİVDEN GERİ YÜKLEME ---
  const handleRestore = async (id: number) => {
    const token = localStorage.getItem('userToken');
    const res = await fetch(`https://localhost:7227/api/Notes/restore/${id}`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success("Not geri yüklendi! ✨");
      fetchNotes();
    }
  };

  // --- ARŞİVLEME (SOFT DELETE) ---
  const handleSoftDelete = async (id: number) => {
    const token = localStorage.getItem('userToken');
    const res = await fetch(`https://localhost:7227/api/Notes/soft-delete/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success("Not arşive taşındı.");
      fetchNotes();
    }
  };

  // --- KALICI SİLME (HARD DELETE) ---
  const handleHardDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-sm font-semibold text-gray-900">Bu not veritabanından tamamen silinecek. Emin misiniz?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg transition hover:bg-gray-200">Vazgeç</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const token = localStorage.getItem('userToken');
              const res = await fetch(`https://localhost:7227/api/Notes/hard-delete/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                toast.success("Not kalıcı olarak silindi!");
                fetchNotes();
              }
            }}
            className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg transition hover:bg-red-700"
          > Evet, Kalıcı Sil </button>
        </div>
      </div>
    ), { duration: 6000, position: 'top-center' });
  };

  // --- DOSYA YÜKLEME ---
  const handleFileUpload = async (noteId: number, file: File) => {
    const token = localStorage.getItem('userToken');
    const formData = new FormData();
    formData.append('file', file);
    
    const loading = toast.loading("Yükleniyor...");
    const res = await fetch(`https://localhost:7227/api/Notes/upload-file/${noteId}`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData 
    });

    if (res.ok) {
      toast.success("Dosya eklendi!", { id: loading });
      fetchNotes();
    } else {
      toast.error("Hata oluştu!", { id: loading });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Toaster position="top-right" />
      
      <header className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Ders Notları Sistemi</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setViewingArchive(!viewingArchive)} 
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${viewingArchive ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
          >
            {viewingArchive ? "🏠 Notlarıma Dön" : "📦 Arşivi Göster"}
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl font-bold text-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Güvenli Çıkış 🚪
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {!viewingArchive && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-12">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingNoteId ? "📝 Notu Güncelle" : "➕ Yeni Bir Not Oluştur"}
            </h2>
            <div className="flex flex-col gap-5">
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Dersin Adı" 
                className="w-full p-4 border border-gray-200 rounded-2xl outline-blue-400 bg-gray-50/50 font-semibold"
              />
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Not detayları..." 
                rows={4}
                className="w-full p-4 border border-gray-200 rounded-2xl outline-blue-400 bg-gray-50/50 text-base resize-y min-h-[140px]"
              />
              <div className="flex justify-end gap-3">
                {editingNoteId && (
                  <button onClick={() => {setEditingNoteId(null); setTitle(''); setDescription('');}} className="px-6 py-3 text-gray-400 font-bold hover:text-gray-600">Vazgeç</button>
                )}
                <button 
                  onClick={handleSaveNote} 
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
                >
                  {editingNoteId ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-gray-800">{viewingArchive ? "📦 Arşiv" : "📚 Notlarım"}</h2>
          <div className="h-px flex-1 bg-gray-200 mx-6 opacity-50"></div>
          <span className="text-gray-500 font-bold bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">{notes.length} Adet</span>
        </div>

        <div className="space-y-5">
          {notes.map((note: any) => (
            <div key={note.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{note.title}</h3>
                  {note.fileName && <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-extrabold uppercase border border-blue-200">EK</span>}
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{note.description}</p>
                
                {/* --- TARİH BİLGİSİ --- */}
                <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-gray-400 font-medium">
                  <div className="flex items-center gap-1">
                    <span>📅 Eklenme:</span>
                    <span className="text-gray-500">
                      {new Date(note.createdDate).toLocaleDateString('tr-TR')} {new Date(note.createdDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  {note.updatedDate && (
                    <div className="flex items-center gap-1 border-l pl-4 border-gray-200">
                      <span>🔄 Son Güncelleme:</span>
                      <span className="text-blue-500">
                        {new Date(note.updatedDate).toLocaleDateString('tr-TR')} {new Date(note.updatedDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  )}
                </div>

                {note.fileName && (
                  <div className="flex items-center gap-2 mt-3">
                    <p className="text-xs text-blue-500 font-semibold">📎 {note.fileName}</p>
                    <button 
                      onClick={() => handleRemoveFile(note.id)}
                      className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md hover:bg-red-600 hover:text-white transition-all font-bold border border-red-100"
                    >
                      Kaldır ✖
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {!viewingArchive ? (
                  <>
                    <button onClick={() => {setEditingNoteId(note.id); setTitle(note.title); setDescription(note.description); window.scrollTo({top: 0, behavior: 'smooth'});}} className="flex-1 md:flex-none px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition">Düzenle</button>
                    {/* ANA SAYFADA SİL -> SOFT DELETE (ARŞİVLE) */}
                    <button onClick={() => handleSoftDelete(note.id)} className="flex-1 md:flex-none px-4 py-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition">Sil</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleRestore(note.id)} className="flex-1 md:flex-none px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition">Geri Yükle</button>
                    {/* ARŞİVDE SİL -> HARD DELETE (KALICI SİL) */}
                    <button onClick={() => handleHardDelete(note.id)} className="flex-1 md:flex-none px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-800 transition">Kalıcı Sil 🗑️</button>
                  </>
                )}
                
                <label className="flex-1 md:flex-none px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white cursor-pointer transition flex items-center justify-center gap-2 border border-blue-100 shadow-sm">
                   <span>📎 Dosya Yükle</span>
                   <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileUpload(note.id, e.target.files[0])} />
                </label>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-28 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic font-bold text-2xl ">Henüz kayıt yok.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}