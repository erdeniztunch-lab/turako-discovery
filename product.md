# Turako Ürün Dokümanı

## Kısa Özet

Turako, ürün ekiplerinin “Sırada ne geliştirmeliyiz?” sorusuna daha kanıta dayalı cevap vermesini sağlayan bir karar destek aracıdır.

Ürün; müşteri görüşmeleri, destek talepleri, satış notları, analitik gözlemler ve e-postalar gibi dağınık ürün girdilerini tek bir karar hattında toplar. Bu hat şu sırayla çalışır:

**Source → Signal → Problem → Opportunity → Decision → Learning**

Yani Turako ham bilgiyi alır, içinden ürün sinyalleri çıkarır, bu sinyalleri problemlere bağlar, problemlerden fırsatlar üretir, fırsatları karara dönüştürür ve alınan kararların sonuçlarını öğrenme olarak geri besler.

## Çözdüğü Sorun

Ürün ekipleri genellikle birçok farklı yerden geri bildirim alır:

- Müşteri görüşmeleri
- Destek ticketları
- Satış görüşmesi notları
- Ürün analitiği
- E-postalar
- CSM veya ekip içi notlar

Bu bilgiler çoğu zaman farklı araçlarda, farklı formatlarda ve farklı kişilerin kafasında kalır. Sonuç olarak ürün kararları şu risklerle alınır:

- En gür çıkan ses, en önemli problem sanılabilir.
- Tek bir müşteri yorumu, geniş bir pazar sinyali gibi yorumlanabilir.
- Analitik verilerle müşteri sözleri birbirine bağlanmayabilir.
- Daha önce alınmış kararların neden alındığı unutulabilir.
- Bir kararın işe yarayıp yaramadığı ürün hafızasına geri dönmeyebilir.

Turako bu dağınıklığı azaltmak için her ürün kararını kanıta bağlar. Bir problem neden önemli, hangi kaynaklardan besleniyor, hangi fırsata dönüştü, hangi karar alındı ve sonrasında ne öğrenildi sorularını görünür hale getirir.

İlk kullanıcı feedback’lerinden çıkan önemli ek risk şudur: ürün sadece manuel not girilen bir PM not defteri gibi hissederse, uzun vadede ölçeklenmeyecekmiş izlenimi verebilir. Bu nedenle Turako’nun yönü yalnızca paste tabanlı veri girişi değil, ekiplerin halihazırda kullandığı araçlardan sürekli veri okuyabilen bir karar sistemi olmaktır.

## Mevcut Ürün Ne Yapıyor?

Bu kod tabanındaki mevcut Turako, React ile hazırlanmış tek sayfalık bir MVP/prototiptir. Tarayıcıda çalışır, veriyi `localStorage` içinde saklar ve örnek veriyle veya boş çalışma alanıyla kullanılabilir.

Ana işlevleri şunlardır:

1. **Kaynak ekleme**

   Kullanıcı ham notları veya gözlemleri Sources ekranına yapıştırabilir. Kaynak türü olarak interview, support, sales call, analytics veya email seçebilir.

   Buna ek olarak mevcut frontend prototipte HubSpot, Zendesk ve Google Analytics için mock entegrasyon kartları bulunur. Bu kartlar gerçek API çağrısı yapmaz; ancak ürünün ileride müşteri e-postaları, destek ticketları ve analitik gözlemleri otomatik olarak Turako pipeline’ına taşıyacağı deneyimi gösterir.

2. **Sinyal çıkarma**

   Girilen metin cümlelere bölünür ve her cümleden bir ürün sinyali üretilir. Sinyaller üç tipten biri olabilir:

   - `stated`: Kullanıcının veya müşterinin doğrudan söylediği ifade
   - `observed`: Sayı, oran, ticket adedi, düşüş, artış gibi gözleme dayalı kanıt
   - `inferred`: “Muhtemelen”, “gibi görünüyor” tarzı çıkarımsal ifade

   Her sinyale ayrıca güç seviyesi verilir:

   - `weak`
   - `medium`
   - `strong`

3. **Sinyalleri problemlere bağlama**

   Signals ekranında kullanıcı çıkarılan sinyalleri inceler. Her sinyal mevcut bir probleme bağlanabilir veya sinyalden yeni bir problem oluşturulabilir. Toplu seçimle birden fazla sinyal aynı probleme bağlanabilir.

4. **Problem sağlığını gösterme**

   Problems ekranı her problemi destekleyen sinyal sayısını, etki skorunu, trendini ve güven skorunu gösterir. Problem detayında o probleme bağlı sinyaller, kaynak çeşitliliği ve kanıt türleri görülebilir.

5. **Fırsat oluşturma**

   Bir problemden ürün fırsatı üretilebilir. Fırsatlar, problemin çözümü için düşünülen olası ürün hamleleridir. Örneğin “dashboard yavaşlığı” problemi için “büyük workspace’ler için server-side aggregation geliştirmek” bir fırsattır.

6. **Karara dönüştürme**

   Opportunities ekranında uygun fırsatlar karara yükseltilebilir. Kararlar `build`, `test`, `watch` veya `drop` statülerinden birine sahip olur.

7. **Öğrenme kaydetme**

   Decisions ekranında alınan kararın sonucuna dair öğrenme girilebilir. Öğrenme sonucu `validated`, `mixed` veya `invalidated` olabilir. Bu öğrenmeler güven hesabını etkiler.

8. **Ana ekranda öneri verme**

   Home ekranı, mevcut kanıtlara göre en güçlü sonraki hamleyi önerir. Önerinin yanında güven skoru, etki, trend ve öneri tipi gösterilir.

9. **Blind spot tespiti**

   Turako bazı karar risklerini otomatik işaretler:

   - Bir problem yalnızca tek sinyale dayanıyorsa “thin evidence”
   - Bir problem sadece müşterinin söylediği ifadelerle destekleniyor, gözlemsel kanıt içermiyorsa “stated-only evidence”
   - Bir karar uzun süredir gözden geçirilmemişse “stale decision”

10. **Arama ve tur**

   Uygulama genelinde kaynak, sinyal, problem, fırsat ve kararlar aranabilir. Ayrıca ürünün karar hattını anlatan app içi guided tour bulunur. İlk demo deneyimi örnek veri üzerinde anlatılır; demo tamamlanınca veya skip edilince dummy data temizlenir ve kullanıcı boş workspace ile gerçek kullanıma başlar.

## Feedback Batch 1’den Çıkan Ürün Kararları

Potansiyel kullanıcı feedback’leri üç ana sinyale işaret etti:

- Turako PM’in discovery’den growth’a kadar kullandığı karar/not sistemi olabilir.
- Sadece manuel data input gerektiriyormuş gibi görünürse kullanım yükü yüksek algılanabilir.
- Demo ayrı bir deneyim gibi değil, app’in içine gömülü ve adım adım açıklayıcı olmalıdır.

Bu feedback’lerden çıkan ürün kararları:

- Turako, manuel paste akışını korurken entegrasyon hissini ürünün erken yüzeyine taşır.
- İlk frontend-only entegrasyon seti HubSpot, Zendesk ve Google Analytics olarak konumlanır.
- Entegrasyonlar gerçek OAuth/API olmadan mock connect ve sync davranışıyla gösterilir.
- Sync edilen mock veriler normal kaynak gibi kaydedilir ve mevcut sinyal çıkarma pipeline’ına girer.
- Demo sample data ile başlar, ürünün ne yaptığını app içinde anlatır ve bitince temiz workspace’e geçer.

## Hedef Kullanıcı Kitlesi

Turako özellikle ürün kararlarının çok fazla geri bildirim ve belirsizlik içinden alındığı ekipler için tasarlanmıştır.

Başlıca kullanıcılar:

- Ürün yöneticileri
- Founder PM’ler
- B2B SaaS kurucuları
- Customer Success liderleri
- Growth veya product ops ekipleri
- Satış, destek ve ürün ekipleri arasında köprü kuran ekipler

Örnek veri setinde hedef segmentler şöyle tanımlanmıştır:

- Growth-stage SaaS şirketleri
- Founder PM’ler
- Customer Success liderleri

Ürünün en güçlü olduğu bağlam, müşteri geri bildiriminin çok olduğu ama karar alma sürecinin dağınık kaldığı B2B SaaS ekipleridir.

## Kullanıcı Akışı

Tipik kullanım şu şekilde ilerler:

1. Kullanıcı ürünü açar.
2. Örnek veriyle devam eder veya kendi ürünü için boş bir workspace başlatır.
3. Ürün adı, hedef segmentler ve odak sorusu girilir.
4. Kullanıcı Sources ekranına ham müşteri notu, ticket özeti, satış notu veya analitik gözlem yapıştırır.
5. Turako bu metinden sinyaller çıkarır.
6. Kullanıcı sinyalleri inceler ve ilgili problemlere bağlar.
7. Problemler güven, etki ve trend bilgisiyle görünür hale gelir.
8. Kullanıcı problemden fırsat oluşturur veya mevcut fırsatı inceler.
9. Fırsat yeterince hazırsa karara yükseltilir.
10. Karar uygulandıktan veya test edildikten sonra öğrenme girilir.
11. Öğrenme, ilgili problemin güvenini ve gelecekteki önerileri etkiler.

Bu akışın amacı, ürün ekibinin karar alma sürecini tek seferlik bir backlog tartışması olmaktan çıkarıp sürekli öğrenen bir sisteme dönüştürmektir.

## Arkadaki Çalışma Mantığı

Mevcut MVP’de karmaşık bir backend veya gerçek bir yapay zeka servisi yoktur. Uygulama tamamen frontend tarafında çalışır.

### Veri Modeli

Workspace içinde şu ana veri tipleri bulunur:

- `product`: Ürünün adı, açıklaması, segmentleri ve odak sorusu
- `sources`: Ham girdiler
- `signals`: Kaynaklardan çıkarılan kanıt parçaları
- `problems`: Sinyallerle desteklenen ürün problemleri
- `opportunities`: Problemlere cevap olabilecek ürün fırsatları
- `decisions`: Yapılmasına, test edilmesine, izlenmesine veya bırakılmasına karar verilen işler
- `learnings`: Kararların sonuçlarından elde edilen öğrenmeler

Bu yapı tüm kararların izini geriye doğru sürmeyi sağlar. Bir kararın hangi fırsattan, o fırsatın hangi problemden, problemin hangi sinyallerden ve sinyallerin hangi kaynaklardan geldiği görülebilir.

### Sinyal Çıkarma

`extractSignalsFromText` fonksiyonu girilen metni temizler, cümlelere ayırır ve en fazla 6 cümleden sinyal oluşturur.

Sinyal tipi anahtar kelimelerle belirlenir:

- Yüzde, ticket, düştü, arttı, haftalık, kullanıcı sayısı gibi ifadeler varsa sinyal `observed` olur.
- “seems”, “probably”, “might”, “could”, “likely”, “feels” gibi çıkarım belirten ifadeler varsa sinyal `inferred` olur.
- Bunlar yoksa varsayılan olarak `stated` kabul edilir.

Sinyal gücü de benzer şekilde anahtar kelimelerle hesaplanır:

- “blocker”, “churn”, “lost”, “broken”, “timeout”, “fail” gibi ifadeler güçlü sinyal sayılır.
- “slow”, “confusing”, “unclear”, “asked”, “requested”, “wants” gibi ifadeler orta güçte sinyal sayılır.
- Diğer sinyaller zayıf başlar.

Bu nedenle mevcut MVP’deki sinyal çıkarımı deterministiktir. Yani aynı metin aynı kurallarla işlenir; gerçek NLP veya LLM entegrasyonu yoktur.

### Güven Skoru

`computeConfidence` fonksiyonu bir problemin güven skorunu 0-100 arasında hesaplar.

Skoru etkileyen faktörler:

- Probleme bağlı sinyal sayısı
- Sinyallerin güç seviyesi
- Kanıt tipi çeşitliliği
- Aynı probleme bağlı kararların validasyon öğrenmeleri

Güçlü ve çeşitli kanıtlar güveni artırır. Validated öğrenmeler de güvene ek katkı verir.

### Öneri Motoru

`buildRecommendation` fonksiyonu ana ekrandaki “Strongest next move” önerisini üretir.

Öneriler üç ana durumda oluşur:

- Karara dönüşmemiş uygun fırsatlar varsa, bunları “promote” önerisi olarak sıralar.
- Bir problem çok az kanıta dayanıyorsa, daha fazla araştırma önerir.
- Uzun süredir gözden geçirilmemiş kararlar varsa, review önerisi üretir.

Fırsat önerilerinin skoru şu faktörlerle ağırlıklandırılır:

- Problem güveni
- Problem etkisi
- Trendin yükseliyor, stabil veya düşüyor olması
- Fırsatın readiness durumu

En yüksek skorlu öneri ana ekranda ilk hareket olarak gösterilir.

### Blind Spot Tespiti

`detectBlindSpots` fonksiyonu karar kalitesini düşürebilecek durumları yakalar.

Örneğin:

- Bir problem sadece tek sinyale dayanıyorsa kullanıcı daha fazla kaynak eklemeye yönlendirilir.
- Bir problem sadece stated sinyallerden oluşuyorsa gözlemsel kanıt eksikliği belirtilir.
- Bir karar 21 günden uzun süredir incelenmemişse stale decision olarak işaretlenir.

Bu bölüm ürünün “sadece öneri veren” değil, kanıt kalitesini de denetleyen bir sistem olmasını sağlar.

## Ekranlar

### Landing

Ürünün vaadini anlatır: dağınık ürün geri bildirimlerini izlenebilir, kanıta dayalı kararlara dönüştürmek.

### Onboarding

Kullanıcıdan ürün adı, hedef segmentler ve odak sorusu alınır. Kullanıcı isterse örnek veriyle başlayabilir.

### Home

Ürünün karar yüzeyidir. En güçlü sonraki hamleyi, top problemleri, top fırsatları, son sinyalleri, kanıt özetini, blind spot’ları ve son kararları gösterir.

### Sources

Ham notların ve mock entegrasyon importlarının eklendiği ekrandır. Kullanıcı ister HubSpot, Zendesk veya Google Analytics kartlarından mock sync başlatır, ister notu elle yapıştırır. Her iki yol da aynı kaynak ve sinyal modeline bağlanır.

### Signals

Çıkarılan sinyallerin incelendiği ve problemlere bağlandığı ekrandır.

### Problems

Sinyallerden oluşan problem kümelerini gösterir. Her problem için güven, etki, trend ve bağlı fırsatlar izlenebilir.

### Opportunities

Problemlerden türetilen olası ürün hamlelerini gösterir. Fırsatlar karara yükseltilebilir.

### Decisions

Alınmış kararların takip edildiği ekrandır. Kararlar build, test, watch veya drop durumunda olabilir.

### Learnings

Kararlardan elde edilen sonuçların tutulduğu ekrandır. Bu öğrenmeler güven skoruna geri beslenir.

### Settings

Workspace bilgileri, örnek veri modu, guided tour, frontend-only entegrasyon durumları ve reset seçeneklerini içerir.

## Örnek Senaryo

Bir B2B SaaS ürün ekibi, dashboard performansıyla ilgili farklı yerlerden geri bildirim alıyor:

- Bir müşteri görüşmesinde dashboardların büyük hesaplarda geç yüklendiği söyleniyor.
- Destek ticketlarında funnel timeout şikayetleri görülüyor.
- Bazı müşteriler CSV export ile workaround kullanıyor.

Turako bu girdileri kaynak olarak kaydeder, içlerinden sinyaller çıkarır ve bunları “Dashboards slow or fail on large workspaces” problemine bağlar.

Bu problem yüksek etki ve güçlü kanıt aldığı için öne çıkar. Ardından “Ship server-side aggregation for large workspaces” fırsatı oluşturulur. Fırsat karara yükseltilir ve build statüsüne alınır. İş test edildikten sonra öğrenme girilir. Eğer sonuç doğrulanırsa problemle ilgili güven artar ve ürün hafızası kapanmış bir döngüye sahip olur.

## Mevcut MVP’nin Sınırları

Bu kod tabanındaki ürün bir MVP/prototip seviyesindedir.

Mevcut sınırlar:

- Backend yoktur.
- Veriler tarayıcının `localStorage` alanında saklanır.
- Gerçek kullanıcı hesabı veya takım çalışması yoktur.
- Sinyal çıkarımı gerçek AI/NLP değil, anahtar kelime tabanlı deterministik bir fonksiyondur.
- HubSpot, Zendesk ve Google Analytics entegrasyonları frontend-only mock davranış olarak gösterilir; gerçek bağlantı, OAuth veya API sync yoktur.
- Intercom, Linear, Mixpanel ve Amplitude gibi ek entegrasyonlar ürün yönü olarak değerlendirilebilir ancak bu MVP’de aktif değildir.
- Fırsat oluşturma ve problem özetleme çoğunlukla kullanıcı girdisine dayanır.
- Kalıcı veri tabanı, yetkilendirme, paylaşım, bildirim ve audit log gibi üretim özellikleri yoktur.

## Ürünün Konumlandırması

Turako klasik bir feedback inbox değildir. Sadece müşteri notlarını toplamakla kalmaz; bu notların ürün kararlarına nasıl dönüştüğünü görünür hale getirir.

Ayrıca klasik bir roadmap aracı da değildir. Roadmap’teki işlerin arkasındaki kanıt, problem, fırsat ve öğrenme zincirini göstermeye odaklanır.

En doğru konumlandırma:

**Turako, ürün ekipleri için kanıta dayalı ve izlenebilir bir karar işletim sistemidir.**

## Ürün Vaadi

Turako’nun temel vaadi şudur:

Ürün ekipleri artık “bunu neden yapıyoruz?” sorusuna dağınık Slack mesajları, hatırlanan müşteri görüşmeleri veya sezgisel öncelik tartışmalarıyla cevap vermek zorunda kalmaz.

Bunun yerine her kararın arkasında görülebilir bir zincir olur:

**Bu kaynaktan şu sinyal çıktı. Bu sinyal şu problemi destekledi. Bu problem şu fırsatı doğurdu. Bu fırsat şu karara dönüştü. Bu karar şu öğrenmeyi üretti.**

Bu zincir sayesinde ekipler daha bilinçli önceliklendirme yapar, yanlış varsayımları daha erken yakalar ve ürün hafızasını zamanla güçlendirir.
