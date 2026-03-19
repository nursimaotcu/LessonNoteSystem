# Ders Notları Yönetim Sistemi 


## Proje Hakkında

Bu çalışma, TetaCode bünyesinde gerçekleştirilen staj programı gereksinimleri doğrultusunda geliştirilmiş, kullanıcı bazlı ders notu yönetimini sağlayan bir Full Stack web uygulamasıdır. Proje kapsamında, ders notlarının ve ekli dosyaların sistemli bir şekilde saklanması, arşive alınması ve gerektiğinde kalıcı olarak silinmesi üzerine kurulu bir yönetim paneli tasarlanmıştır.

## Teknik Mimari ve Kullanılan Teknolojiler

  ### Backend:

    **Framework:** .NET 8.0 Web API mimarisi kullanılmıştır.

    **Veritabanı Yönetimi:** Entity Framework Core (ORM) aracılığıyla SQL Server entegrasyonu sağlanmıştır.

    **Güvenlik:** Kimlik doğrulama ve yetkilendirme süreçleri JWT (JSON Web Token) altyapısı ile kurgulanmıştır. Kullanıcı işlemleri Token içerisindeki Claim yapıları üzerinden valide edilmektedir.

    **Veri Yönetimi:** Veritabanı şeması Code-First yaklaşımıyla oluşturulmuş, sistemin ilk kurulumunda gerekli olan başlangıç verileri Data Seeder mekanizması ile enjekte edilmiştir.

  ### Frontend:
    
  *  **Teknoloji:** React tabanlı Next.js (App Router) kullanılmıştır.

  *  **Stil Yönetimi:** Arayüz bileşenleri Tailwind CSS kütüphanesi ile tasarlanmıştır.

  *  **Veri İletişimi:** İstemci tarafındaki tüm asenkron operasyonlar Fetch API üzerinden yönetilmektedir. 

  ## Fonksiyonel Özellikler:

  *  **Kimlik Doğrulama:** Kullanıcılar sisteme giriş yaparak kendilerine özel bir oturum anahtarı (JWT) elde ederler. Tüm veri talepleri bu anahtar üzerinden doğrulanmaktadır.

  *  **Dosya Desteği:** Not ekleme ve güncelleme aşamalarında fiziksel dosya yükleme desteği mevcuttur. Yüklenen dosyalar sunucu tarafında benzersiz isimlerle depolanmakta ve veritabanı ile ilişkilendirilmektedir.

  *  **Veri Silme Protokolü:** Yumuşak Silme (Soft Delete): Silinen veriler veritabanından hemen kaldırılmamakta, IsDeleted bayrağı ile işaretlenerek Arşiv bölümüne aktarılmaktadır.

  *  **Kalıcı Silme (Hard Delete):** Yalnızca Arşiv bölümündeki veriler üzerinde uygulanabilen, veriyi fiziksel olarak temizleyen son aşamadır.

  *  **Zaman Damgaları:** Her kaydın oluşturulma (CreatedDate) ve son güncellenme (UpdatedDate) tarihleri sistem tarafından milisaniye hassasiyetinde tutulmakta ve kullanıcıya raporlanmaktadır.  

## Kurulum ve Çalıştırma Talimatları

  ### Veritabanı Konfigürasyonu

    * 'appsettings.json' dosyasında yer alan bağlantı dizesini (Connection String) yerel SQL Server ayarlarınıza göre düzenleyiniz.

    * Visual Studio Paket Yöneticisi Konsolu üzerinden aşağıdaki komutu çalıştırarak tabloları oluşturunuz:
      'Update-Database'     

  ### Sunucu ve Arayüz Başlatma   

    * Backend projesini Visual Studio üzerinden çalıştırarak servisleri aktif hale getiriniz.

    * Frontend dizininde terminal üzerinden bağımlılıkları yükleyiniz:
       'npm install'

    * Uygulamayı geliştirme modunda başlatınız:
       'npm run dev'


## API Uç Noktaları (Endpoints)

| Yöntem | Endpoint | Tanım |
| :--- | :--- | :--- |
| **POST** | `/api/Users/login` | Kullanıcı oturumu açma ve JWT üretimi |
| **GET** | `/api/Notes/my-notes` | Kullanıcıya ait aktif notların listelenmesi |
| **POST** | `/api/Notes/upload-file/{id}` | Belirlenen nota dosya eki yüklenmesi |
| **DELETE** | `/api/Notes/soft-delete/{id}` | Notun arşive taşınması (IsDeleted işaretleme) |
| **DELETE** | `/api/Notes/hard-delete/{id}` | Notun veritabanından kalıcı olarak silinmesi |
| **POST** | `/api/Notes/remove-file/{id}` | Mevcut dosya ekinin kayıttan kaldırılması |