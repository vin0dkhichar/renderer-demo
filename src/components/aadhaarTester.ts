import { rankWith, schemaMatches } from "@jsonforms/core";

const aadhaarTester = rankWith(
    5,
    schemaMatches((schema) => {
        return schema.format === "aadhaar";
    })
);

export default aadhaarTester;
