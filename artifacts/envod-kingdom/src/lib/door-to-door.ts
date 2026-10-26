import type { Service, ServiceMeta } from "./service-data";
export const DOOR_TO_DOOR_SERVICE: Service = {
  id: 25, name: "Door-to-Door Logistics", nameAr: "الخدمات اللوجستية من الباب إلى الباب",
  description: "A single enquiry for coordinated collection and delivery. Route, customs responsibilities, operators and service scope are confirmed for each shipment.",
  descriptionAr: "استفسار واحد لتنسيق الاستلام والتسليم. يُؤكد المسار ومسؤوليات الجمارك والجهات المشغّلة ونطاق الخدمة لكل شحنة.",
  icon: "Truck", category: "specialized", sortOrder: 25, isActive: true,
};
export const DOOR_TO_DOOR_META: ServiceMeta = {
  id: 25, slug: "door-to-door", gradient: "linear-gradient(135deg,#071421,#172b3c)", accentHex: "#ec2529",
  industries: [], industriesAr: [], whyEnvod: [],
  process: [
    {en:"Share collection and delivery requirements",ar:"أرسل متطلبات الاستلام والتسليم"},
    {en:"Review route and transport options",ar:"مراجعة المسار وخيارات النقل"},
    {en:"Confirm customs and operator responsibilities",ar:"تأكيد مسؤوليات الجمارك والمشغّل"},
  ],
  subServices: [
    {name:"Collection and delivery requirements",nameAr:"متطلبات الاستلام والتسليم",desc:"Share addresses, cargo details and timing so the requested collection and delivery scope can be reviewed.",descAr:"أرسل العناوين وتفاصيل البضاعة والموعد لمراجعة نطاق الاستلام والتسليم المطلوب."},
    {name:"Route and responsibility review",nameAr:"مراجعة المسار والمسؤوليات",desc:"Transport options, customs responsibilities, operators and the agreed scope are confirmed per shipment.",descAr:"تُؤكد خيارات النقل ومسؤوليات الجمارك والجهات المشغّلة والنطاق المتفق عليه لكل شحنة."},
  ],
  faq: [{q:"Is every door-to-door shipment offered on the same terms?",a:"No. Collection, transport, customs responsibilities, operators and delivery requirements depend on the route and shipment. The agreed scope must be confirmed before booking.",qAr:"هل تُقدم كل شحنة من الباب إلى الباب بالشروط نفسها؟",aAr:"لا. يعتمد الاستلام والنقل ومسؤوليات الجمارك والمشغّلون ومتطلبات التسليم على المسار والشحنة. يجب تأكيد النطاق المتفق عليه قبل الحجز."}],
};
