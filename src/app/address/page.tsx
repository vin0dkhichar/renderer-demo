'use client';

import React, { useState, useEffect } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { Unwrapped, WithOptionLabel } from '@jsonforms/material-renderers';
import {
    rankWith,
    scopeEndsWith,
    ControlProps,
    JsonSchema
} from '@jsonforms/core';

import { withTranslateProps, TranslateProps, withJsonFormsControlProps } from '@jsonforms/react';
import { useJsonForms } from '@jsonforms/react';
import CircularProgress from '@mui/material/CircularProgress';

const { MaterialEnumControl } = Unwrapped;

class API {
    constructor(private baseUrl: string) { }

    async get(endpoint: string): Promise<string[]> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockData: { [key: string]: string[] } = {
            countries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'],
            'regions/United States': ['California', 'Texas', 'New York', 'Florida'],
            'regions/Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
            'regions/United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
            'regions/Germany': ['Bavaria', 'Berlin', 'Hamburg', 'Saxony'],
            'regions/France': ['Île-de-France', 'Provence', 'Normandy', 'Brittany'],
        };

        return mockData[endpoint] || [];
    }
}

export const APIContext = React.createContext<API | null>(null);

type JsonSchemaWithDependenciesAndEndpoint = JsonSchema & {
    'x-dependents'?: string[];
    'x-endpoint'?: string;
};

const CountryControl = (
    props: ControlProps & WithOptionLabel & TranslateProps
) => {
    const { handleChange } = props;
    const [options, setOptions] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);
    const api = React.useContext(APIContext);
    const schema = props.schema as JsonSchemaWithDependenciesAndEndpoint;

    const endpoint = schema['x-endpoint'];
    const dependents: string[] = schema['x-dependents'] ? schema['x-dependents'] : [];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (endpoint && api && mounted) {
            api.get(endpoint).then((result) => {
                setOptions(result);
            });
        }
    }, [endpoint, api, mounted]);

    if (!mounted || options.length === 0) {
        return <CircularProgress />;
    }

    return (
        <MaterialEnumControl
            {...props}
            handleChange={(path: string, value: any) => {
                handleChange(path, value);
                dependents.forEach((depPath) => {
                    handleChange(depPath, undefined);
                });
            }}
            options={options.map((option) => {
                return { label: option, value: option };
            })}
        />
    );
};

export const CountryControlRenderer = withJsonFormsControlProps(
    withTranslateProps(React.memo(CountryControl)),
    false
);

export const countryTester = rankWith(10, scopeEndsWith('country'));

const RegionControl = (
    props: ControlProps & WithOptionLabel & TranslateProps
) => {
    const schema = props.schema as JsonSchemaWithDependenciesAndEndpoint;
    const { handleChange } = props;
    const [options, setOptions] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);
    const api = React.useContext(APIContext);
    const country = useJsonForms().core?.data.country;
    const [previousCountry, setPreviousCountry] = useState<string>();

    const endpoint = schema['x-endpoint'];
    const dependents: string[] = schema['x-dependents'] ? schema['x-dependents'] : [];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (previousCountry !== country && mounted) {
            setOptions([]);
            setPreviousCountry(country);
            if (country && endpoint && api) {
                api.get(endpoint + '/' + country).then((result) => {
                    setOptions(result);
                });
            }
        }
    }, [country, previousCountry, endpoint, api, mounted]);

    if (!mounted || (options.length === 0 && country !== undefined)) {
        return <CircularProgress />;
    }

    return (
        <MaterialEnumControl
            {...props}
            handleChange={(path: string, value: any) => {
                handleChange(path, value);
                dependents.forEach((depPath) => {
                    handleChange(depPath, undefined);
                });
            }}
            options={options.map((option) => {
                return { label: option, value: option };
            })}
        />
    );
};

export const RegionControlRenderer = withJsonFormsControlProps(
    withTranslateProps(React.memo(RegionControl)),
    false
);

export const regionTester = rankWith(10, scopeEndsWith('region'));

function AddressFormContent() {
    const [formData, setFormData] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const schema = {
        type: 'object',
        'x-url': 'www.api.com',
        properties: {
            country: {
                type: 'string',
                'x-endpoint': 'countries',
                'x-dependents': ['region', 'city'],
            },
            region: {
                type: 'string',
                'x-endpoint': 'regions',
                'x-dependents': ['city'],
            },
            city: {
                type: 'string',
            },
        },
    };

    const uischema = {
        type: 'VerticalLayout',
        elements: [
            {
                type: 'Control',
                scope: '#/properties/country',
            },
            {
                type: 'Control',
                scope: '#/properties/region',
            },
            {
                type: 'Control',
                scope: '#/properties/city',
            },
        ],
    };

    const url = schema['x-url'];
    const [api] = useState(() => new API(url));

    const customRenderers = [
        ...materialRenderers,
        { tester: countryTester, renderer: CountryControlRenderer },
        { tester: regionTester, renderer: RegionControlRenderer },
    ];

    const handleSubmit = () => {
        console.log('Form Data:', formData);
        alert('Form submitted! Check console for data.');
    };

    const handleClear = () => {
        setFormData({});
    };

    if (!mounted) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
                padding: '48px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <APIContext.Provider value={api}>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
                padding: '48px 16px'
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '32px'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: '8px'
                        }}>
                            Dynamic Address Form
                        </h1>
                        <p style={{ color: '#6b7280' }}>
                            Using JSON Forms with custom renderers for dynamic cascading dropdowns.
                        </p>
                    </div>

                    <JsonForms
                        schema={schema}
                        uischema={uischema}
                        data={formData}
                        renderers={customRenderers}
                        cells={materialCells}
                        onChange={({ data, errors }) => setFormData(data)}
                    />

                    <div style={{
                        marginTop: '32px',
                        display: 'flex',
                        gap: '16px'
                    }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                flex: 1,
                                background: '#2563eb',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            Submit Address
                        </button>
                        <button
                            onClick={handleClear}
                            style={{
                                flex: 1,
                                background: '#e5e7eb',
                                color: '#374151',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            Clear Form
                        </button>
                    </div>

                    {Object.keys(formData).length > 0 && (
                        <div style={{
                            marginTop: '32px',
                            padding: '16px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '12px'
                            }}>
                                Current Form Data:
                            </h3>
                            <pre style={{
                                fontSize: '14px',
                                color: '#374151',
                                overflow: 'auto',
                                margin: 0
                            }}>
                                {JSON.stringify(formData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </APIContext.Provider>
    );
}

export default function AddressFormPage() {
    return <AddressFormContent />;
}