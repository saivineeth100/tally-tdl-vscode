/**
 * Manifest regression tests.
 * Validates that the activation events and languages configuration
 * are set up correctly in package.json.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Extension Manifest (package.json)', () => {
    it('should declare correct activationEvents for TDL and XML', () => {
        const pkgJsonPath = path.resolve(__dirname, '../../../../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        
        expect(pkg.activationEvents).toContain('onLanguage:tdl');
        expect(pkg.activationEvents).toContain('onLanguage:xml');
    });

    it('should contribute tdl and xml languages configuration', () => {
        const pkgJsonPath = path.resolve(__dirname, '../../../../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        
        const languages = pkg.contributes?.languages;
        expect(languages).toBeDefined();
        
        const tdlLang = languages.find((l: any) => l.id === 'tdl');
        const xmlLang = languages.find((l: any) => l.id === 'xml');
        
        expect(tdlLang).toBeDefined();
        expect(xmlLang).toBeDefined();
    });
});
