import React from "react";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { Award, Globe, Shield, Clock } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="relative h-[60vh] flex items-center justify-center mb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-secondary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        <div className="container relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase"
          >
            {t("Our Story", "قصتنا")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            {t("25+ years of delivering excellence across Saudi Arabia and the globe.", "أكثر من 25 عامًا من تقديم التميز في المملكة العربية السعودية وحول العالم.")}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("A Legacy of Trust", "إرث من الثقة")}
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                {t("ENVOD KINGDOM SHIPPING SERVICES LLC was founded with a single mission: to provide unparalleled logistics solutions that empower businesses to thrive in a global economy.", "تأسست شركة انفود كينجدم لخدمات الشحن ذ.م.م بمهمة واحدة: تقديم حلول لوجستية لا مثيل لها تمكن الشركات من الازدهار في اقتصاد عالمي.")}
              </p>
              <p>
                {t("Based in Riyadh, we have built a reputation for reliability, speed, and technical sophistication. We treat every cargo as if it were our own, ensuring seamless transit from origin to destination.", "استنادًا إلى مقرنا في الرياض، بنينا سمعة طيبة في الموثوقية والسرعة والتطور التقني. نحن نتعامل مع كل شحنة وكأنها شحنتنا الخاصة، مما يضمن عبورًا سلسًا من المصدر إلى الوجهة.")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border border-white/5 text-center">
              <Globe className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
              <p className="text-sm text-muted-foreground">{t("Global Partners", "شركاء عالميون")}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-white/5 text-center">
              <Award className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-2">25+</h3>
              <p className="text-sm text-muted-foreground">{t("Years Experience", "سنوات الخبرة")}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-white/5 text-center">
              <Shield className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-2">10k+</h3>
              <p className="text-sm text-muted-foreground">{t("Shipments Delivered", "شحنات مسلمة")}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-white/5 text-center">
              <Clock className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-2">99.8%</h3>
              <p className="text-sm text-muted-foreground">{t("On-Time Rate", "معدل التسليم في الوقت المحدد")}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
