import { normalizeTypeName } from "./normalizeUtils";

export interface DataTypeSpec {
    name: string;
    subTypes?: string[];
    formats?: string[];
}

export const TDL_DATATYPES: Record<string, DataTypeSpec> = {
    'amount': {
        name: 'Amount',
        subTypes: ['Base', 'Direct Base', 'Forex', 'Rate', 'DrCr'],
        formats: ['Comma', 'No Comma', 'Positive', 'Signed', 'Decimal', 'DrCr', 'CrDr', 'Symbol', 'Currency', 'Show Base Currency', 'Forex', 'All Symbols', 'No Zero', 'No Symbol', 'Bracketed']
    },
    'quantity': {
        name: 'Quantity',
        subTypes: ['Base Units', 'Primary Units', 'Alternate Units', 'Secondary Units', 'Unit Symbol'],
        formats: ['Comma', 'No Comma', 'SDF', 'Positive', 'Signed', 'Decimal', 'DrCr', 'CrDr', 'Units', 'TailUnits', 'Shortform', 'No Compact', 'No Zero']
    },
    'rate': {
        name: 'Rate',
        subTypes: ['Price', 'Quantity', 'Unit Symbol'],
        formats: ['Comma', 'No Comma', 'Positive', 'Signed', 'Decimal', 'DrCr', 'Units', 'TailUnits', 'Shortform', 'No Compact', 'No Zero']
    },
    'rate of exchange': {
        name: 'Rate of Exchange',
        formats: ['Comma', 'No Comma', 'Positive', 'Signed', 'Decimal', 'DrCr', 'Units', 'TailUnits', 'Shortform', 'No Compact', 'No Zero']
    },
    'rateofexchange': {
        name: 'Rate of Exchange',
        formats: ['Comma', 'No Comma', 'Positive', 'Signed', 'Decimal', 'DrCr', 'Units', 'TailUnits', 'Shortform', 'No Compact', 'No Zero']
    },
    'due date': {
        name: 'Due Date',
        formats: ['Days', 'Weeks', 'Months', 'Years']
    },
    'duedate': {
        name: 'Due Date',
        formats: ['Days', 'Weeks', 'Months', 'Years']
    },
    'number': {
        name: 'Number',
        formats: ['Comma', 'No Comma', 'Positive', 'Signed', 'Decimal', 'No Zero', 'Percentage', 'Bracketed']
    },
    'date': {
        name: 'Date',
        formats: ['Universal Date', 'Short Date', 'Long Date', 'Month Beginning', 'Month Ending', 'Separator', 'No Zero']
    },
    'datetime': {
        name: 'DateTime',
        subTypes: ['Date', 'Time'],
        formats: [
            'Universal Date', 'Short Date', 'Long Date', 'Month Beginning', 'Month Ending',
            'Date Only', 'Time Only',
            '12 Hour', '24 Hour', 'With Seconds', 'With Secs', 'Seconds', 'With MilliSeconds', 'With Millisecs', 'MilliSeconds', 'Prefix AMPM',
            'Separator', 'No Zero'
        ]
    },
    'time': {
        name: 'Time',
        formats: [
            '12 Hour', '24 Hour', 'With Seconds', 'With Secs', 'Seconds', 'With MilliSeconds', 'With Millisecs', 'MilliSeconds', 'Prefix AMPM',
            'Separator', 'No Zero'
        ]
    },
    'duration': {
        name: 'Duration',
        formats: [
            'Year', 'Years', 'Yr', 'Yrs',
            'Month', 'Months',
            'Day', 'Days', 'Dys',
            'Week', 'Weeks', 'Weak', 'Wks',
            'Hour', 'Hours', 'Hr', 'Hrs',
            'Minutes', 'Mins', 'Min', 'Minute',
            'Second', 'Seconds', 'Sec', 'Secs',
            'YMD', 'HMS', 'No Zero'
        ]
    },
    'logical': {
        name: 'Logical',
        formats: ['Yes', 'No', 'True', 'False', 'On', 'Off']
    },
    'string': {
        name: 'String',
        formats: []
    },
    'normal': {
        name: 'Normal',
        formats: []
    }
};

export function getDataTypeSpec(name: string): DataTypeSpec | undefined {
    const norm = normalizeTypeName(name);
    return TDL_DATATYPES[norm];
}

export function isValidDataType(name: string): boolean {
    return getDataTypeSpec(name) !== undefined;
}

export function isValidSubType(dataType: string, subType: string): boolean {
    const spec = getDataTypeSpec(dataType);
    if (!spec || !spec.subTypes) return false;
    const normSub = normalizeTypeName(subType);
    return spec.subTypes.some(st => normalizeTypeName(st) === normSub);
}

export function isValidFormat(dataType: string, format: string): boolean {
    const spec = getDataTypeSpec(dataType);
    if (!spec || !spec.formats) return false;
    
    // If format contains a parameter with colon (e.g. 'Decimal: 2', 'Separator: "/"', 'Tail Units: Pcs')
    const baseFormat = format.includes(':') ? format.split(':')[0].trim() : format;
    const normFormat = normalizeTypeName(baseFormat);

    // Support "Tail Units:..." dynamic format checking for Quantity and Rate
    if (normFormat.startsWith('tailunits')) {
        return spec.formats.some(f => normalizeTypeName(f) === 'tailunits');
    }
    // Support "Decimal:..." format
    if (normFormat.startsWith('decimal')) {
        return spec.formats.some(f => normalizeTypeName(f) === 'decimal');
    }
    // Support "Separator:..." format
    if (normFormat.startsWith('separator')) {
        return spec.formats.some(f => normalizeTypeName(f) === 'separator');
    }
    
    return spec.formats.some(f => normalizeTypeName(f) === normFormat);
}
