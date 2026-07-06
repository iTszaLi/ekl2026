import React, { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PhoneCall, Mail, Headset } from "lucide-react";

export default function Track() {
  const { t, isRtl } = useLanguage();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchedId, setSearchedId] = useState("");

  // Read ?id= after mount: window is unavailable during SSG prerendering, and
  // reading it during the first client render would cause a hydration mismatch
  // between the prerendered HTML and the hydrated tree on deep links.
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      setTrackingNumber(id);
      setSearchedId(id);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber) {
      setSearchedId(trackingNumber);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("Track Your Shipment", "تتبع شحنتك")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("Enter your tracking, reference, or invoice number to get real-time status updates.", "أدخل رقم التتبع أو المرجع للحصول على تحديثات الحالة في الوقت الفعلي.")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5`} />
              <Input 
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t("e.g., ENVOD-2024-001", "مثال: ENVOD-2024-001")}
                className={`bg-card border-white/10 text-white ${isRtl ? 'pr-12' : 'pl-12'} py-6 text-lg h-14`}
              />
            </div>
            <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white px-8 h-14 text-lg">
              {t("Track", "تتبع")}
            </Button>
          </form>
        </div>

        {searchedId && (
          <div className="max-w-2xl mx-auto bg-card border border-white/10 rounded-xl p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/15 mb-5">
              <Headset className="w-7 h-7 text-secondary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
              {t("Online Tracking Available Soon", "التتبع الإلكتروني متاح قريباً")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t(
                "Online shipment tracking will be available soon. In the meantime, our operations team is ready to provide the latest status of your shipment — contact us with your tracking or reference number.",
                "سيتوفر تتبع الشحنات عبر الإنترنت قريباً. في هذه الأثناء، فريق العمليات لدينا جاهز لتزويدكم بأحدث حالة لشحنتكم — تواصلوا معنا مع ذكر رقم التتبع أو المرجع.",
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:+966502260256"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span dir="ltr">+966 50 226 0256</span>
              </a>
              <a
                href="mailto:info@envodkingdom.net"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-medium px-5 py-2.5 rounded-lg border border-white/10 transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@envodkingdom.net
              </a>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto mt-20 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("How Shipment Tracking Works", "كيف يعمل تتبع الشحنات")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Every ENVOD KINGDOM shipment receives a unique tracking number once the booking is confirmed. Enter it above — or use your booking reference or invoice number — to see the latest confirmed milestones for your cargo, from pickup and export processing through customs clearance to final delivery. Statuses are updated as each milestone is confirmed by our operations team.",
                "تحصل كل شحنة من إنفود كينجدوم على رقم تتبع فريد بمجرد تأكيد الحجز. أدخله أعلاه — أو استخدم رقم المرجع أو الفاتورة — لعرض أحدث المراحل المؤكدة لشحنتك، من الاستلام ومعالجة التصدير مروراً بالتخليص الجمركي وحتى التسليم النهائي. يتم تحديث الحالات مع تأكيد كل مرحلة من قبل فريق العمليات لدينا.",
              )}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("Understanding Your Shipment Status", "فهم حالة شحنتك")}
            </h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li>
                <span className="font-medium text-white">{t("Booked / Picked Up", "تم الحجز / تم الاستلام")}</span>
                {" — "}
                {t(
                  "the cargo has entered our network and is being prepared for transport.",
                  "دخلت الشحنة شبكتنا ويجري تجهيزها للنقل.",
                )}
              </li>
              <li>
                <span className="font-medium text-white">{t("In Transit", "قيد النقل")}</span>
                {" — "}
                {t(
                  "the shipment is moving between origin and destination by air, sea, or road.",
                  "الشحنة في طريقها بين المنشأ والوجهة جواً أو بحراً أو براً.",
                )}
              </li>
              <li>
                <span className="font-medium text-white">{t("Customs Clearance", "التخليص الجمركي")}</span>
                {" — "}
                {t(
                  "documentation is being processed by the customs authorities; clearance times can vary with the cargo type and destination.",
                  "تتم معالجة المستندات لدى الجهات الجمركية؛ وقد تختلف مدة التخليص حسب نوع البضاعة والوجهة.",
                )}
              </li>
              <li>
                <span className="font-medium text-white">{t("Delivered", "تم التسليم")}</span>
                {" — "}
                {t(
                  "the shipment has arrived at its final destination.",
                  "وصلت الشحنة إلى وجهتها النهائية.",
                )}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("Need Help With a Shipment?", "هل تحتاج مساعدة بخصوص شحنتك؟")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "If you can't locate your tracking number or have a question about a delivery, our team in Riyadh is ready to assist — reach us through the ",
                "إذا لم تتمكن من العثور على رقم التتبع أو كان لديك استفسار حول التسليم، فإن فريقنا في الرياض جاهز للمساعدة — تواصل معنا عبر ",
              )}
              <Link href="/contact" className="text-secondary hover:underline">
                {t("contact page", "صفحة اتصل بنا")}
              </Link>
              {t(". You can also learn more ", ". يمكنك أيضاً معرفة المزيد ")}
              <Link href="/about" className="text-secondary hover:underline">
                {t("about ENVOD KINGDOM", "عن إنفود كينجدوم")}
              </Link>
              {t(", or explore our ", "، أو استكشاف ")}
              <Link href="/services" className="text-secondary hover:underline">
                {t("logistics services", "خدماتنا اللوجستية")}
              </Link>
              {t(" such as ", " مثل ")}
              <Link href="/services/customs-clearance" className="text-secondary hover:underline">
                {t("customs clearance", "التخليص الجمركي")}
              </Link>
              {t(" and ", " و")}
              <Link href="/services/gcc-transportation" className="text-secondary hover:underline">
                {t("GCC road transportation", "النقل البري الخليجي")}
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
