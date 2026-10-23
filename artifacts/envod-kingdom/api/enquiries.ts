import { createVercelEnquiryHandler } from "../server/vercel-enquiry-handler";

export default {
  fetch: createVercelEnquiryHandler(),
};
