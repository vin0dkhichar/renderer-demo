import React, { useState, useEffect } from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";

const AuthenticateIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
    >
        <path d="M9 12l2 2 4-4" />
    </svg>
);

interface AadhaarRendererProps {
    data: string;
    path: string;
    handleChange(path: string, value: any): void;
}

const AadhaarRenderer = ({ data, path, handleChange }: AadhaarRendererProps) => {
    const [aadhaar, setAadhaar] = useState(data || "");

    useEffect(() => {
        setAadhaar(data || "");
    }, [data]);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 12);
        setAadhaar(val);
        handleChange(path, val);
    };

    const onAuthenticate = () => {
        if (aadhaar.length === 12) {
            window.location.href = `/jsonforms`;
        }
    };

    return (
        <div className="w-full relative">
            <label
                htmlFor="aadhaar-input"
                className="absolute -top-2 left-3 bg-white px-1 text-black font-semibold text-sm select-none pointer-events-none"
            >
                Aadhaar
            </label>

            <input
                id="aadhaar-input"
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="Enter Aadhaar Number"
                value={aadhaar}
                onChange={onInputChange}
                aria-label="Aadhaar Number"
                className="w-full pr-10 px-4 py-3.5 text-black border border-gray-300 rounded outline-none focus:border-blue-700"
            />

            <button
                type="button"
                onClick={onAuthenticate}
                disabled={aadhaar.length !== 12}
                title={aadhaar.length !== 12 ? "Enter a valid 12-digit Aadhaar" : "Authenticate"}
                className={`
                            absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center
                            w-8 h-8 rounded
                            transition-colors
                            ${aadhaar.length === 12 ? "bg-blue-700 hover:bg-blue-800 cursor-pointer" : "bg-gray-400 cursor-not-allowed"}
                            text-white
                            disabled:opacity-50
                `}
            >
                <AuthenticateIcon />
            </button>
        </div>
    );
};

export default withJsonFormsControlProps(AadhaarRenderer);
