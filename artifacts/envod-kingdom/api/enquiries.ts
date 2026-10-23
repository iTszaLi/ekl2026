import { createVercelEnquiryHandler } from "../server/vercel-enquiry-handler.js";

export default {
  fetch: createVercelEnquiryHandler(),
};
