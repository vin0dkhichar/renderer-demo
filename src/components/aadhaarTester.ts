import { rankWith, isControl } from "@jsonforms/core";

const aadhaarTester = rankWith(
    4,
    (uischema, schema) =>
        isControl(uischema) &&
        uischema.scope.toLowerCase().includes("aadhaar")
);

export default aadhaarTester;
