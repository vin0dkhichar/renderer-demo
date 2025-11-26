import { BackendTile } from "./types";

export function fetchTilesMock(): Promise<BackendTile[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: "profile",
                    title: "User Profile",
                    layout: "three-column",
                    items: [
                        { label: "First Name", value: "Alice", type: "string" },
                        { label: "Last Name", value: "Johnson", type: "string" },
                        { label: "Age", value: 28, type: "number" },
                        { label: "Gender", value: "Female", type: "string" },
                        // { label: "Married", value: false, type: "boolean" },
                        { label: "Birth Date", value: "1995-04-12", type: "date" },
                        { label: "Email", value: "alice@example.com", type: "string" },
                        { label: "Phone", value: "555-1234", type: "string" },
                        { label: "Address", value: "123 Main St", type: "string" },
                        { label: "Aadhaar Number", value: "654089963711", type: "aadhaar" },
                    ]
                },
                {
                    id: "sales_q1",
                    title: "Sales Data Q1",
                    layout: "two-column",
                    items: [
                        { label: "Revenue", value: 125000, type: "number" },
                        { label: "Units Sold", value: 450, type: "number" },
                        { label: "Growth", value: "+15%", type: "string" },
                        { label: "Customers", value: 234, type: "number" },
                        { label: "Avg Order", value: 535, type: "number" },
                        { label: "Returns", value: 12, type: "number" }
                    ]
                },
                {
                    id: "location",
                    title: "Location Info",
                    layout: "single-column",
                    items: [
                        { label: "City", value: "Metropolis", type: "string" },
                        { label: "State", value: "NY", type: "string" },
                        { label: "Zip Code", value: "10001", type: "string" }
                    ]
                }
            ]);
        }, 300);
    });
}
