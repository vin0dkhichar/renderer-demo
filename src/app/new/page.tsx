"use client";

import React, { useEffect, useState } from "react";
import { JsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { materialRenderers, materialCells } from "@jsonforms/material-renderers";
import {
    rankWith,
    isControl,
    UISchemaElement,
    ControlProps,
    JsonSchema
} from "@jsonforms/core";

type UserData = {
    fullName: string;
    email: string;
};

type UserEditorProps = {
    label?: string;
    value: UserData;
    onChange: (data: UserData) => void;
};

const UserEditor: React.FC<UserEditorProps> = ({ label, value, onChange }) => {
    const [saving, setSaving] = useState(false);

    const handleChange = (field: keyof UserData, val: string) => {
        onChange({ ...value, [field]: val });
    };

    const saveUser = async () => {
        setSaving(true);
        await new Promise((res) => setTimeout(res, 800));
        alert("User saved ✅");
        setSaving(false);
    };

    return (
        <div className="border rounded p-4 mb-4 bg-white shadow-sm">
            {label && <div className="text-black font-semibold mb-3">{label}</div>}

            <input
                type="text"
                value={value?.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Full Name"
                className="text-black  border rounded w-full p-2 mb-3"
            />

            <input
                type="email"
                value={value?.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email"
                className="text-black  border rounded w-full p-2 mb-4"
            />

            <button
                onClick={saveUser}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    );
};

const MemberList: React.FC = () => {
    const [members, setMembers] = useState<UserData[]>([]);
    const [newMember, setNewMember] = useState("");

    useEffect(() => {
        const fetchMembers = async () => {
            const apiData: UserData[] = [
                // { fullName: "Abbb", email: "abbb@mail.com" },
                // { fullName: "John Doe", email: "john@mail.com" }
            ];
            setMembers(apiData);
        };

        fetchMembers();
    }, []);

    const addMember = () => {
        if (!newMember.trim()) return;
        setMembers((prev) => [...prev, { fullName: newMember, email: "" }]);
        setNewMember("");
    };

    const updateMember = (index: number, data: UserData) => {
        setMembers((prev) =>
            prev.map((m, i) => (i === index ? data : m))
        );
    };

    const removeMember = (index: number) => {
        setMembers((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="border p-4 rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Members</h2>

            <div className="flex gap-2 mb-5">
                <input
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="New member name"
                    className="text-black border p-2 rounded w-full"
                />
                <button
                    onClick={addMember}
                    className="bg-green-600 text-white px-4 rounded"
                >
                    Add
                </button>
            </div>

            {members.map((member, i) => (
                <div key={i} className="relative">
                    <UserEditor
                        label={`Member ${i + 1}`}
                        value={member}
                        onChange={(data) => updateMember(i, data)}
                    />

                    <button
                        onClick={() => removeMember(i)}
                        className="absolute top-2 right-2 text-red-600 font-bold"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};


const InfoCard: React.FC<ControlProps> = ({ uischema }) => {
    const title = uischema?.options?.title || "Information";

    const [data, setData] = React.useState<Record<string, any>>({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {

                const json = {
                    Name: "Abbb",
                    Email: "abbb@mail.com",
                    Phone: "+91 9123456789",
                    Aadhaar: "123456789012",
                    City: "Mumbai",
                    State: "Maharashtra",
                    Country: "India",
                    Name1: "Abbb",
                    Email1: "abbb@mail.com",
                    Phone1: "+91 9123456789",
                    Aadhaar1: "123456789012",
                    City1: "Mumbai",
                    State1: "Maharashtra",
                    Country1: "India"
                };

                setData(json);
            } catch (error) {
                console.error("Failed to load InfoCard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-4 text-gray-500">Loading summary...</div>;
    }

    const entries = Object.entries(data);
    const MAX_PER_CARD = 3;

    const chunk = <T,>(arr: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    const cards = chunk(entries, MAX_PER_CARD);

    const gridCols =
        cards.length <= 1 ? "grid-cols-1" :
            cards.length === 2 ? "grid-cols-2" :
                "grid-cols-3";

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>

            <div className={`grid ${gridCols} gap-5`}>
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white border rounded-xl shadow-sm p-4"
                    >
                        {card.map(([key, value]) => (
                            <div key={key} className="mb-3 last:mb-0">
                                <div className="text-gray-500 text-sm">{key}</div>
                                <div className="font-medium text-gray-900">
                                    {String(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AadhaarField: React.FC = () => {
    const [aadhaar, setAadhaar] = useState("");
    const isValid = /^\d{12}$/.test(aadhaar);

    return (
        <div className="p-3 border rounded-lg mb-3 bg-white">
            <label className="text-black font-semibold block mb-1">Aadhaar Number</label>

            <input
                type="text"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                maxLength={12}
                className="text-black border p-2 w-full rounded"
                placeholder="Enter 12 digit Aadhaar"
            />

            {!isValid && aadhaar.length > 0 && (
                <p className="text-red-500 text-sm mt-1">
                    Aadhaar must be exactly 12 digits
                </p>
            )}

            {isValid && (
                <button
                    className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => alert("Aadhaar Validated ✅")}
                >
                    Authenticate
                </button>
            )}
        </div>
    );
};


const componentRegistry: Record<string, React.FC<any>> = {
    UserEditor,
    MemberList,
    AadhaarField,
    InfoCard
};


const DynamicRenderer: React.FC<ControlProps> = (props) => {
    const { options } = props.uischema || {};
    const componentName = options?.component;
    const Component = componentRegistry[componentName as string];

    if (!Component) return null;

    return <Component {...options} />;
};

const DynamicTester = rankWith(
    100,
    (uischema) => isControl(uischema) && !!uischema.options?.component
);

const finalRenderers = [
    ...materialRenderers,
    { tester: DynamicTester, renderer: withJsonFormsControlProps(DynamicRenderer) }
];


const schema: JsonSchema = {
    type: "object",
    properties: {
        userProfile: { type: "object" },
        aadhaar: { type: "string" },
        members: { type: "array" },
        infoCard: {
            type: "object",
            properties: {
                Name: { type: "string" },
                Email: { type: "string" },
                Phone: { type: "string" },
                Aadhaar: { type: "string" },
                City: { type: "string" },
                State: { type: "string" },
                Country: { type: "string" },
                Name1: { type: "string" },
                Email1: { type: "string" },
                Phone1: { type: "string" },
                Aadhaar1: { type: "string" },
                City1: { type: "string" },
                State1: { type: "string" },
                Country1: { type: "string" }
            }
        }
    }
};


const uischema: UISchemaElement = {
    type: "VerticalLayout",
    elements: [
        {
            type: "Control",
            scope: "#/properties/infoCard",
            options: {
                component: "InfoCard",
                title: "User Summary"
            }
        }
        ,
        {
            type: "Control",
            scope: "#/properties/userProfile",
            options: { component: "UserEditor" }
        },
        {
            type: "Control",
            scope: "#/properties/aadhaar",
            options: { component: "AadhaarField" }
        },
        {
            type: "Control",
            scope: "#/properties/members",
            options: { component: "MemberList" }
        }
    ]
};


export default function App() {
    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
                JSONForms Render Mode with Dynamic Cards
            </h2>

            <JsonForms
                schema={schema}
                uischema={uischema}
                data={{}}
                renderers={finalRenderers}
                cells={materialCells}
                onChange={() => { }}
            />
        </div>
    );
}
