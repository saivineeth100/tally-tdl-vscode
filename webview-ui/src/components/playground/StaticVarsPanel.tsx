import React from 'react';
import { Combobox } from '../common/Combobox';
import type { PlaygroundStaticVariableDTO } from '../../types/playground';

interface StaticVarsPanelProps {
    variables: PlaygroundStaticVariableDTO[];
    companies: string[];
    onUpdateVariable: (index: number, name: string, value: string) => void;
    onAddVariable: () => void;
    onRemoveVariable: (index: number) => void;
    onRefreshCompanies: () => void;
}

const STATIC_VAR_NAME_SUGGESTIONS = [
    { value: 'SVCURRENTCOMPANY', label: 'SVCURRENTCOMPANY', description: 'Active company in Tally' },
    { value: 'SVEXPORTFORMAT', label: 'SVEXPORTFORMAT', description: 'Output format ($$SysName:XML, JSON)' },
    { value: 'SVFROMDATE', label: 'SVFROMDATE', description: 'Start date for reports / period' },
    { value: 'SVTODATE', label: 'SVTODATE', description: 'End date for reports / period' },
    { value: 'EXPLODEFLAG', label: 'EXPLODEFLAG', description: 'Explode collections (Yes / No)' },
    { value: 'SVINVENTORY', label: 'SVINVENTORY', description: 'Include inventory data (Yes / No)' },
    { value: 'SVACCOUNTS', label: 'SVACCOUNTS', description: 'Include accounting data (Yes / No)' },
    { value: 'SVCOMPANY', label: 'SVCOMPANY', description: 'Target company name' },
    { value: 'SVVOUCHERTYPE', label: 'SVVOUCHERTYPE', description: 'Filter by voucher type' },
    { value: 'SVCOSTCENTRE', label: 'SVCOSTCENTRE', description: 'Filter by cost centre' },
    { value: 'SVGODOWN', label: 'SVGODOWN', description: 'Filter by godown / warehouse' }
];

const FORMAT_SUGGESTIONS = [
    { value: '$$SysName:XML', label: '$$SysName:XML', description: 'Tally XML Format (Recommended)' },
    { value: 'XML', label: 'XML', description: 'Standard XML' },
    { value: '$$SysName:JSON', label: '$$SysName:JSON', description: 'Tally JSON Format' },
    { value: 'JSON', label: 'JSON', description: 'Standard JSON' },
    { value: '$$SysName:Excel', label: '$$SysName:Excel', description: 'Excel Format' },
    { value: 'HTML', label: 'HTML', description: 'HTML Document' },
    { value: 'ASCII', label: 'ASCII', description: 'Plain Text' }
];

const BOOLEAN_SUGGESTIONS = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
];

const DATE_SUGGESTIONS = [
    { value: '$$MonthStart:##SVCurrentDate', label: '$$MonthStart:##SVCurrentDate', description: 'Start of current month' },
    { value: '$$YearStart:##SVCurrentDate', label: '$$YearStart:##SVCurrentDate', description: 'Start of financial year' },
    { value: '$$MonthEnd:##SVCurrentDate', label: '$$MonthEnd:##SVCurrentDate', description: 'End of current month' },
    { value: '$$YearEnd:##SVCurrentDate', label: '$$YearEnd:##SVCurrentDate', description: 'End of financial year' },
    { value: '$$CurrentDate', label: '$$CurrentDate', description: 'Current date' },
    { value: '20240401', label: '20240401', description: '1-Apr-2024 (YYYYMMDD)' },
    { value: '20250331', label: '20250331', description: '31-Mar-2025 (YYYYMMDD)' }
];

const isDateVariable = (varName: string): boolean => {
    const norm = varName.toUpperCase().trim();
    return norm === 'SVFROMDATE' || norm === 'SVTODATE' || norm.includes('DATE') || norm === 'FROMDATE' || norm === 'TODATE';
};

const formatToIsoDate = (val: string): string => {
    if (!val) return '';
    const clean = val.trim();
    if (/^\d{8}$/.test(clean)) {
        return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        return clean;
    }
    return '';
};

export const StaticVarsPanel: React.FC<StaticVarsPanelProps> = ({
    variables,
    companies,
    onUpdateVariable,
    onAddVariable,
    onRemoveVariable,
    onRefreshCompanies
}) => {
    const getValueOptions = (varName: string) => {
        const norm = varName.toUpperCase().trim();
        if (norm === 'SVCURRENTCOMPANY' || norm === 'SVCOMPANY') {
            return companies.map(c => ({ value: c, label: c, description: 'Open Company' }));
        }
        if (norm === 'SVEXPORTFORMAT') {
            return FORMAT_SUGGESTIONS;
        }
        if (norm === 'EXPLODEFLAG' || norm === 'SVINVENTORY' || norm === 'SVACCOUNTS') {
            return BOOLEAN_SUGGESTIONS;
        }
        if (isDateVariable(varName)) {
            return DATE_SUGGESTIONS;
        }
        return [];
    };

    return (
        <div className="playground-card static-vars-card">
            <div className="card-header">
                <div className="card-title">
                    <span className="codicon codicon-symbol-variable"></span>
                    <span>Static Variables</span>
                    <span className="count-badge">{variables.length}</span>
                </div>
                <div className="card-actions">
                    <button 
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={onRefreshCompanies}
                        title="Refresh list of open companies from Tally"
                    >
                        <span className="codicon codicon-refresh"></span> Refresh Companies
                    </button>
                    <button 
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={onAddVariable}
                        title="Add custom static variable"
                    >
                        <span className="codicon codicon-add"></span> Add Variable
                    </button>
                </div>
            </div>

            <div className="variables-list">
                {variables.map((v, index) => {
                    const valueOptions = getValueOptions(v.name);
                    const isDate = isDateVariable(v.name);

                    return (
                        <div key={`var-${index}`} className="var-row">
                            <div className="var-name-col">
                                <Combobox
                                    value={v.name}
                                    onChange={newName => onUpdateVariable(index, newName, v.value)}
                                    options={STATIC_VAR_NAME_SUGGESTIONS}
                                    placeholder="Variable Name (e.g. SVFROMDATE)"
                                />
                            </div>
                            <div className="var-value-col">
                                {isDate ? (
                                    <div className="date-combobox-group">
                                        <Combobox
                                            value={v.value}
                                            onChange={newVal => onUpdateVariable(index, v.name, newVal)}
                                            options={valueOptions}
                                            placeholder="e.g. 20240401 or $$MonthStart:##SVCurrentDate"
                                        />
                                        <input 
                                            type="date"
                                            className="date-picker-input"
                                            value={formatToIsoDate(v.value)}
                                            onChange={e => {
                                                const raw = e.target.value;
                                                if (raw) {
                                                    const formatted = raw.replace(/-/g, '');
                                                    onUpdateVariable(index, v.name, formatted);
                                                }
                                            }}
                                            title="Pick date from calendar"
                                        />
                                    </div>
                                ) : (
                                    <Combobox
                                        value={v.value}
                                        onChange={newVal => onUpdateVariable(index, v.name, newVal)}
                                        options={valueOptions}
                                        placeholder="Variable Value"
                                    />
                                )}
                            </div>
                            <div className="var-action-col">
                                <button 
                                    type="button"
                                    className="btn-icon btn-danger"
                                    onClick={() => onRemoveVariable(index)}
                                    title="Remove variable"
                                >
                                    <span className="codicon codicon-trash"></span>
                                </button>
                            </div>
                        </div>
                    );
                })}

                {variables.length === 0 && (
                    <div className="empty-subtext">No static variables added.</div>
                )}
            </div>
        </div>
    );
};
