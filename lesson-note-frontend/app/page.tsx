"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // useEffect eklendi
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Client-side kontrolü için

  const router = useRouter();

  // Bileşen yüklendiğinde çalışır - Hydration hatasını engeller
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error("Lütfen tüm alanları doldurun!");
    }

    setLoading(true);
    const loginToast = toast.loading("Giriş yapılıyor...");

    try {
      const response = await fetch('https://localhost:7227/api/Users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const token = await response.text();
        
        // Token'ı güvenle kaydet
        localStorage.setItem('userToken', token); 
        
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...", { id: loginToast });
        
        setTimeout(() => {
          router.push('/dashboard'); 
        }, 1000);
      } else {
        toast.error("Hatalı e-posta veya şifre!", { id: loginToast });
      }
    } catch (error) {
      toast.error("Sunucuya bağlanılamadı!", { id: loginToast });
    } finally {
      setLoading(false);
    }
  };

  // Eğer henüz client-side yüklenmediyse boş dön (Güvenli rendering)
  if (!isMounted) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Toaster position="top-right" />
      
      <div className="p-8 md:p-10 bg-white shadow-2xl rounded-[2.5rem] w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-blue-600">📝</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Hoş Geldiniz</h1>
          <p className="text-gray-500 mt-2 font-medium">Lütfen giriş yapın</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5 ml-1">E-posta</label>
            <input 
              type="email" 
              placeholder="ornek@mail.com" 
              className="w-full p-4 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition text-black bg-gray-50/80"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5 ml-1">Şifre</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition text-black bg-gray-50/80"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg mt-6 ${
              loading ? "bg-blue-300 cursor-wait" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-100"
            }`}
          >
            {loading ? "Bilgiler Kontrol Ediliyor..." : "Giriş Yap"}
          </button>
        </div>
      </div>
    </main>
  );
}