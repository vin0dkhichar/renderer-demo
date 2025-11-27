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

const AADHAAR_REGEX = /^[0-9]{12}$/;

const AadhaarRenderer = ({ data, path, handleChange }: AadhaarRendererProps) => {
    const [aadhaar, setAadhaar] = useState(data || "");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setAadhaar(data || "");
    }, [data]);

    const validate = (value: string) => {
        if (!AADHAAR_REGEX.test(value)) {
            setError("Aadhaar must be exactly 12 digits (0-9 only)");
            return false;
        }
        setError(null);
        return true;
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 12);
        setAadhaar(value);
        handleChange(path, value);
        validate(value);
    };

    const onAuthenticate = () => {
        if (validate(aadhaar)) {
            window.location.href = `/jsonforms`;
        }
    };

    return (
        <div className="w-full relative space-y-1">
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
                pattern="[0-9]{12}"
                maxLength={12}
                placeholder="Enter 12-digit Aadhaar"
                value={aadhaar}
                onChange={onInputChange}
                className={`w-full pr-10 px-4 py-3.5 text-black border rounded outline-none
                    ${error ? "border-red-500 focus:border-red-600" : "border-gray-300 focus:border-blue-700"}
                `}
            />

            {error && (
                <p className="text-red-600 text-sm font-medium">
                    {error}
                </p>
            )}

            {AADHAAR_REGEX.test(aadhaar) && (
                <button
                    type="button"
                    onClick={onAuthenticate}
                    title="Authenticate Aadhaar"
                    className="
                        absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center
                        w-8 h-8 rounded transition-colors text-white bg-black
                    "
                >
                    <AuthenticateIcon />
                </button>
            )}

        </div>
    );
};

export default withJsonFormsControlProps(AadhaarRenderer);
