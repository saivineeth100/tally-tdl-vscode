# Tally XML API Playground

The **Tally XML API Playground** is a powerful visual interface embedded directly inside Visual Studio Code for authoring, testing, and debugging Tally XML requests and TDL export queries.

---

## Key Features

### 1. Visual Builder
- **Export & Import Modes**: Easily switch between **Export** (Collection and Report queries) and **Import** (Business Masters and Transactions).
- **Collection & Report Builder**: Add and customize TDL definitions (`[Collection]`, `[Report]`, `[Form]`, `[Part]`, `[Line]`, `[Field]`, `[System]`) visually.
- **Master & Voucher Object Builder**: Add business objects (`Ledger`, `Group`, `StockItem`, `Unit`, `Voucher`, `Godown`, etc.) with action types (`Create`, `Alter`, `Delete`), nested lists, and repeated attributes.
- **System Definitions**: Direct support for `[System : Formulae]`, `[System : Variables]`, `[System : Events]`, and `[System : UDF]` with custom formula names and context-aware value placeholders.
- **Automatic Master Name Sync**: Automatically synthesizes and synchronizes `<LANGUAGENAME.LIST>` and `<NAME.LIST>` for all Master entities while preserving alias lists.
- **Positional Multi-Parameters**: Native support for colon-separated positional parameters (`COMPUTEMETHOD`, `AGGRCOMPUTE`, `OPTION`, `VARIABLE`) alongside comma-separated list attributes (`FETCH`, `NATIVEMETHOD`).
- **Drag & Reorder**: Reorganize Tally objects and TDL definitions up or down with dedicated move controls.

---

### 2. Live Two-Way XML Synchronization
- **Instant Preview**: Edits made in the Visual Builder instantly generate clean, properly formatted Tally XML envelopes.
- **XML Parsing & Reverse Sync**: Paste or edit raw XML envelopes in the **XML View** or load from an active file to automatically reconstruct the visual builder state.
- **Open in Editor**: Open the generated XML payload in a full VS Code editor window with a single click.

---

### 3. Request Templates Library
A curated catalog of production-ready, full XML request envelopes across three primary categories:
- **Export**:
  - All Ledgers (with Closing Balance, Parent & GSTIN)
  - Trial Balance (with Debit/Credit Breakdown & Non-Zero Filters)
  - Sales Vouchers (with Date Ranges & Line Item Allocations)
  - Stock Items (with Units, Closing Balances & Rates)
  - Outstanding Bills Receivable
  - DayBook Vouchers
  - Active Company List
- **Report**:
  - Balance Sheet
  - Profit and Loss Statement
  - Stock Summary
- **Import**:
  - Ledger Master (with Address, Tax Info & Language Name List)
  - Group Master
  - Stock Item Master (with GST & Unit Details)
  - Unit of Measure (UOM)
  - Sales Accounting Voucher (with Ledger Line Items & Bill Allocations)
  - Bank Receipt Voucher
  - Multi-Object Batch Import

---

### 4. Direct Tally Execution & History
- **Send to Tally**: Execute XML requests directly against your local Tally instance (default port `9000`).
- **Live Company Detection**: Select active companies from the dropdown or refresh the running companies list with one click.
- **Request History**: Review previous executions with timestamp, HTTP status, and elapsed duration.
- **Tabular Response Viewer**: Inspect XML response payloads as structured interactive tables or raw formatted XML.

---

## How to Open the Playground

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Type **Tally: Open API Playground** and press `Enter`.
3. Alternatively, click the **Tally API Playground** button in the editor toolbar or status bar.
