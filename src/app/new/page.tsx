"use client";

import React, { useState } from "react";
import { JsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { materialRenderers, materialCells } from "@jsonforms/material-renderers";
import {
    rankWith,
    isControl,
    JsonSchema,
    UISchemaElement,
    ControlProps,
} from "@jsonforms/core";

type UserData = {
    fullName: string;
    email: string;
};

type UserEditorProps = {
    data: UserData;
    onChange: (data: UserData) => void;
    label?: string;
    disableEmail?: boolean;
};

const UserEditor: React.FC<UserEditorProps> = ({ data, onChange, label, disableEmail }) => {
    const [user, setUser] = useState<UserData>(data);

    React.useEffect(() => {
        setUser(data);
    }, [data]);

    const handleChange = (field: keyof UserData, value: string) => {
        const updated = { ...user, [field]: value };
        setUser(updated);
        onChange(updated);
    };

    return (
        <div className="border rounded p-3 mb-3 bg-white shadow-sm">
            {label && <label className="font-semibold mb-2 block">{label}</label>}
            <input
                type="text"
                value={user.fullName}
                placeholder="Full Name"
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="text-black border rounded w-full p-2 mb-2"
            />
            {!disableEmail && (
                <input
                    type="email"
                    value={user.email}
                    placeholder="Email"
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="text-black border rounded w-full p-2"
                />
            )}
        </div>
    );
};

const MemberList: React.FC<ControlProps> = ({ data, handleChange, path }) => {
    const members: UserData[] = Array.isArray(data) ? data : [];
    const [newMemberName, setNewMemberName] = useState("");

    const addMember = () => {
        const name = newMemberName.trim();
        if (!name) return;
        const newMember = { fullName: name, email: "" };
        handleChange(path, [...members, newMember]);
        setNewMemberName("");
    };

    const updateMember = (index: number, updated: UserData) => {
        const newMembers = [...members];
        newMembers[index] = updated;
        handleChange(path, newMembers);
    };

    const removeMember = (index: number) => {
        const newMembers = members.filter((_, i) => i !== index);
        handleChange(path, newMembers);
    };

    return (
        <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
            <label className="block text-lg font-semibold mb-3 text-gray-900">Members</label>

            <div className="flex space-x-3 mb-4">
                <input
                    type="text"
                    placeholder="Enter member full name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="text-black grow border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addMember();
                        }
                    }}
                    aria-label="New member full name"
                />
                <button
                    onClick={addMember}
                    disabled={!newMemberName.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-md transition"
                >
                    Add
                </button>
            </div>

            {members.length === 0 && (
                <p className="text-gray-400 italic">No members added yet.</p>
            )}
            {members.map((member, i) => (
                <div key={i} className="mb-4 relative">
                    <UserEditor
                        data={member}
                        onChange={(updated) => updateMember(i, updated)}
                        disableEmail={false}
                    />
                    <button
                        onClick={() => removeMember(i)}
                        aria-label={`Remove member ${member.fullName}`}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
                        type="button"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

const AadhaarField: React.FC<ControlProps> = ({ data, handleChange, path, schema }) => {
    const value = data || "";
    const isValid = /^\d{12}$/.test(value);

    return (
        <div className="p-3 border rounded-lg mb-3">
            <label className="text-black font-semibold block mb-1">
                {schema?.title || "Aadhaar Number"}
            </label>

            <input
                type="text"
                value={value}
                maxLength={12}
                onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "");
                    handleChange(path, onlyDigits);
                }}
                className="text-black border p-2 rounded w-full"
                placeholder="Enter 12 digit Aadhaar"
            />

            {!isValid && value.length > 0 && (
                <p className="text-red-500 text-sm mt-1">
                    Aadhaar must be exactly 12 digits
                </p>
            )}

            {isValid && (
                <button
                    type="button"
                    className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    onClick={() => alert("Aadhaar Validated ✅")}
                >
                    Authenticate
                </button>
            )}
        </div>
    );
};

const componentRegistry: Record<string, React.FC<ControlProps>> = {
    MemberList,
    AadhaarField,
};

const DynamicRenderer: React.FC<ControlProps> = (props) => {
    const componentName = props.uischema?.options?.component as string | undefined;

    if (!componentName) {
        return null;
    }

    const Component = componentRegistry[componentName];

    if (!Component) {
        return (
            <div className="p-3 border border-red-500 rounded-lg mb-3">
                <p className="text-red-500">
                    Component "{componentName}" not found in registry
                </p>
            </div>
        );
    }

    return <Component {...props} />;
};

const DynamicTester = rankWith(
    100,
    (uischema) => isControl(uischema) && !!(uischema.options?.component)
);

const DynamicControl = withJsonFormsControlProps(DynamicRenderer);

const finalRenderers = [
    ...materialRenderers,
    { tester: DynamicTester, renderer: DynamicControl },
];

const userProfileSchema = {
    type: "object",
    properties: {
        fullName: { type: "string", title: "Full Name" },
        email: { type: "string", format: "email", title: "Email" },
    },
    required: ["fullName", "email"],
};

const schema: JsonSchema = {
    type: "object",
    properties: {
        userProfile: userProfileSchema,
        aadhaar: {
            type: "string",
            title: "Aadhaar Number",
        },
        members: {
            type: "array",
            title: "Members",
            items: userProfileSchema,
        },
    },
};



const uischema: UISchemaElement = {
    type: "VerticalLayout",
    elements: [
        {
            type: "Control",
            scope: "#/properties/userProfile",
            options: {
                component: "UserEditor",
            },
        },
        {
            type: "Control",
            scope: "#/properties/aadhaar",
            options: {
                component: "AadhaarField",
            },
        },
        {
            type: "Control",
            scope: "#/properties/members",
            label: "Members",
            options: {
                component: "MemberList",
            },
        },
    ],
};


componentRegistry["UserEditor"] = ({ data, handleChange, path }) => (
    <UserEditor data={data} onChange={(newData) => handleChange(path, newData)} />
);


export default function App() {
    const [data, setData] = useState({
        userProfile: {
            fullName: "",
            email: "",
        },
        aadhaar: "",
        members: [],
    });

    return (
        <div className="max-w-2xl mx-auto p-6 font-sans bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Backend Driven Dynamic Form
            </h2>

            <JsonForms
                schema={schema}
                uischema={uischema}
                data={data}
                renderers={finalRenderers}
                cells={materialCells}
                onChange={({ data }) => setData(data)}
            />

            <div className="mt-6">
                <h3 className="text-black font-semibold mb-2">Form Data:</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded shadow text-sm overflow-auto max-h-64">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );
}
