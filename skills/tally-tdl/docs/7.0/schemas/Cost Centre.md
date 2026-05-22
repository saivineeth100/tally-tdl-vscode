# Cost Centre Schema

> **Version**: 7.0

Reference documentation for the **Cost Centre** schema.

### Meta

- **Aliases**: Cost Centres,Cost Center,Cost Centers
- **SDF Id**: CC
- **Is Primary**: Yes

> **Total Properties**: 111

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Aadharnumber** | No | No | String |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Additional Name** | No | Yes | String |
| **Address** | No | Yes | String |
| **Affects Stock** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Bank Account Number** | No | No | String |
| **Bank Branch** | No | No | String |
| **Bank Details** | No | No | String |
| **Bankdetailsbankid** | No | No | String |
| **Blood Group** | No | No | String |
| **Can Delete** | No | No | Logical |
| **Category** | No | No | String (Master Reference) |
| **Category Hierarchy** | No | Yes | String |
| **Closing Balance** | No | No | Amount |
| **Contact Numbers** | No | No | String |
| **Contract Expiry Date** | No | No | Date |
| **Contract Start Date** | No | No | Date |
| **Country Of Issue** | No | No | String |
| **Countryisdcode** | No | No | String |
| **Credit Totals** | No | No | Amount |
| **Date Of Birth** | No | No | Date |
| **Date Of Join** | No | No | Date |
| **Deactivation Date** | No | No | Date |
| **Debit Totals** | No | No | Amount |
| **Default Language** | No | No | Number (Integer) |
| **Depth** | No | No | Number |
| **Designation** | No | No | String |
| **Direct Closing Balance** | No | No | Amount |
| **Direct Credit Totals** | No | No | Amount |
| **Direct Debit Totals** | No | No | Amount |
| **Direct Opening Balance** | No | No | Amount |
| **Direct Qty Closing Balance** | No | No | Quantity |
| **Direct Qty Credit Totals** | No | No | Quantity |
| **Direct Qty Debit Totals** | No | No | Quantity |
| **Direct Qty Opening Balance** | No | No | Quantity |
| **Email Id** | No | No | String |
| **Empdisplayname** | No | No | String |
| **Employee Period** | Yes | No | [Employee Period](Employee%20Period.md) |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Esi Number** | No | No | String |
| **Esidispensaryname** | No | No | String |
| **Father Name** | No | No | String |
| **For Job Costing** | No | No | Logical |
| **For Payroll** | No | No | Logical |
| **Fpfaccountnumber** | No | No | String |
| **Function** | No | No | String |
| **Gender** | No | No | String |
| **Guid** | No | No | String |
| **Identity Number** | No | No | String |
| **Identityexpirydate** | No | No | Date |
| **Ifs Code** | No | No | String |
| **Is Deemed Positive** | No | No | Logical |
| **Is Employee Group** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Itdeclarationdetails** | Yes | No | [Itdeclarationdetails](Itdeclarationdetails.md) |
| **Itdeductiondetails** | Yes | No | [Itdeductiondetails](Itdeductiondetails.md) |
| **Itopeningbaldetails** | Yes | No | [Itopeningbaldetails](Itopeningbaldetails.md) |
| **Itoverridedetails** | Yes | No | [Itoverridedetails](Itoverridedetails.md) |
| **Itprevemplyrdetails** | Yes | No | [Itprevemplyrdetails](Itprevemplyrdetails.md) |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Location** | No | No | String |
| **Masterid** | No | No | Number (Integer) |
| **Micrcode** | No | No | String |
| **Mobilenumber** | No | No | String |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Opening Balance** | No | No | Amount |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Pan Number** | No | No | String |
| **Parent** | No | No | String (Master Reference) |
| **Parent Hierarchy** | No | Yes | String |
| **Passport Details** | No | No | String |
| **Passport Expiry Date** | No | No | Date |
| **Payment Details** | Yes | No | [Payment Details](Payment%20Details.md) |
| **Pf Account Number** | No | No | String |
| **Pfjoiningdate** | No | No | Date |
| **Pfrelievingdate** | No | No | Date |
| **Praccountnumber** | No | No | String |
| **Qty Closing Balance** | No | No | Quantity |
| **Qty Credit Totals** | No | No | Quantity |
| **Qty Debit Totals** | No | No | Quantity |
| **Qty Opening Balance** | No | No | Quantity |
| **Reasonsforleaving** | No | No | String |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Revenue Led For Op Bal** | No | No | Logical |
| **Sort Position** | No | No | Number (Integer) |
| **Spousename** | No | No | String |
| **Targetremoteid** | No | Yes | String |
| **Tax Regime Details** | Yes | No | [Tax Regime Details](Tax%20Regime%20Details.md) |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Uannumber** | No | No | String |
| **Updateddatetime** | No | No | DateTime |
| **Virtualpaymentaddress** | No | No | String |
| **Visa Expiry Date** | No | No | Date |
| **Visa Number** | No | No | String |
| **Work Permit Number** | No | No | String |
