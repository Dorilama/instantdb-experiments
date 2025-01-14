import { ref } from "vue";

const sentEmail = ref("");
const error = ref<string>();
const lastEmail = ref("");
export { sentEmail, error, lastEmail };
