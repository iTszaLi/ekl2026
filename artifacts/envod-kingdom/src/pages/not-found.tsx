import { Link } from "wouter";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function NotFound() {
  const { t, isRtl } = useLanguage();

  return (
    <section
      aria-labelledby="not-found-heading"
      dir={isRtl ? "rtl" : "ltr"}
      className="flex min-h-[62vh] items-center justify-center px-5 py-24 text-white"
    >
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b1726] p-7 shadow-2xl sm:p-12">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/30 bg-secondary/10 text-secondary">
            <SearchX aria-hidden="true" className="h-8 w-8" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-secondary">
            {t("Error 404", "خطأ 404")}
          </p>
          <h1 id="not-found-heading" className="mt-3 text-3xl font-black sm:text-4xl">
            {t("This page could not be found.", "تعذر العثور على هذه الصفحة.")}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
            {t(
              "The link may be outdated, or the address may have been entered incorrectly. You can return to the homepage or explore our logistics services.",
              "قد يكون الرابط قديماً أو قد كُتب العنوان بطريقة غير صحيحة. يمكنك العودة إلى الصفحة الرئيسية أو استعراض خدماتنا اللوجستية."
            )}
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              <Home aria-hidden="true" className="h-4 w-4" />
              {t("Go to homepage", "العودة إلى الرئيسية")}
            </Link>
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-white/35 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              {isRtl ? null : <ArrowLeft aria-hidden="true" className="h-4 w-4" />}
              {t("Explore services", "استعرض الخدمات")}
              {isRtl ? <ArrowLeft aria-hidden="true" className="h-4 w-4 rotate-180" /> : null}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
