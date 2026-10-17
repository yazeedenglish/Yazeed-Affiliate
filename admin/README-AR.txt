طريقة ربط لوحة الإدارة بملفات مشروعك (GitHub Pages)

1) ضع ملفات index.html وstyle.css وadmin.js داخل مجلد admin/ في مشروعك الحالي.
2) يفترض الكود أن ملفات البيانات موجودة في:
   data/affiliates/products.json
   data/affiliates/MOHAMMED.json
   data/affiliates/PARTNER001.json
   data/affiliates/TEST.json
3) عند إضافة شريك جديد، افتح admin.js وعدّل قائمة AFFILIATE_FILES وأضف اسم ملفه كما هو تمامًا، مثل:
   "NEWPARTNER.json",
4) ارفع التعديلات إلى GitHub وانتظر نشر Pages، ثم افتح /admin/ واضغط «تحديث البيانات» عند الحاجة.
5) لا تفتح index.html بالنقر المزدوج من جهازك؛ fetch يعمل عبر رابط الموقع أو خادم محلي.

تنبيه أمني:
GitHub Pages عام. لا تنشر فيه JSON يحتوي على كلمات مرور الشركاء أو معلومات خاصة بالطلبات. لوحة JavaScript لا تستطيع حماية الملفات العامة. لا تستخدم هذا الربط للبيانات السرية؛ انقل البيانات السرية إلى خدمة خلفية/تخزين خاص إذا أردت أن تكون لوحة الإدارة آمنة.
