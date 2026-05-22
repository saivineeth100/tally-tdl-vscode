# Group Schema

> **Version**: 7.0

Reference documentation for the **Group** schema.

### Meta

- **Aliases**: Groups
- **SDF Id**: GR
- **Is Primary**: Yes

> **Total Properties**: 122

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Addlalloctype** | No | No | String (Sysname) |
| **Affects Gross Profit** | No | No | Logical |
| **Affects Stock** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Number (Integer) |
| **Asoriginal** | No | No | Logical |
| **Auditdetails** | Yes | No | [Auditdetails](Auditdetails.md) |
| **Balancingtype** | No | No | String (Sysname) |
| **Baseparent** | No | No | Number (Integer) |
| **Basic Group Is Calculable** | No | No | String |
| **Can Delete** | No | No | Logical |
| **Cash Inflow** | No | No | Amount |
| **Cash Outflow** | No | No | Amount |
| **Closing Balance** | No | No | Amount |
| **Credit Closing Balance** | No | No | Amount |
| **Credit Opening Balance** | No | No | Amount |
| **Credit Totals** | No | No | Amount |
| **Crinterest** | No | Yes | Amount |
| **Debit Closing Balance** | No | No | Amount |
| **Debit Opening Balance** | No | No | Amount |
| **Debit Totals** | No | No | Amount |
| **Depth** | No | No | Number |
| **Drinterest** | No | Yes | Amount |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Forexclosingcr** | No | No | Amount |
| **Forexclosingdr** | No | No | Amount |
| **Forexopeningcr** | No | No | Amount |
| **Forexopeningdr** | No | No | Amount |
| **Grpcreditparent** | No | No | String (Master Reference) |
| **Grpdebitparent** | No | No | String (Master Reference) |
| **Gstapplicable** | No | No | String (Sysname) |
| **Gstdetails** | Yes | No | [Gstdetails](Gstdetails.md) |
| **Guid** | No | No | String |
| **Has Billwise** | No | No | Logical |
| **Has Costcentres** | No | No | Logical |
| **Hsn Details** | Yes | No | [Hsn Details](Hsn%20Details.md) |
| **Ignore Tds Exempt** | No | No | Logical |
| **Interest On Billwise** | No | No | Logical |
| **Is Addable** | No | No | Logical |
| **Is Condensed** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Fbt Applicable** | No | No | Logical |
| **Is Interest On** | No | No | Logical |
| **Is Reserved** | No | No | Logical |
| **Is Revenue** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Is Subledger** | No | No | Logical |
| **Is Tcs Applicable** | No | No | Logical |
| **Is Tds Applicable** | No | No | Logical |
| **Isaltered** | No | No | Logical |
| **Isbillwiseon** | No | No | Logical |
| **Iscostcentreson** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Iseditlogpresent** | No | No | Logical |
| **Isedliapplicable** | No | No | Logical |
| **Isexcise Applicable** | No | No | Logical |
| **Isgroupforloanpymnt** | No | No | Logical |
| **Isgroupforloanrcpt** | No | No | Logical |
| **Isgst Applicable** | No | No | Logical |
| **Isinvdetailsenable** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Israteinclusivevat** | No | No | Logical |
| **Isrelatedparty** | No | No | Logical |
| **Istdsexpense** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Masterid** | No | No | Number (Integer) |
| **Masterreserveid** | No | No | Number (Integer) |
| **Mastertype** | No | No | String |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Opening Balance** | No | No | Amount |
| **Original Closing Balance** | No | No | Amount |
| **Original Opening Balance** | No | No | Amount |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Overdue Bills** | No | No | Amount |
| **Override Adv Interest** | No | No | Logical |
| **Override Interest** | No | No | Logical |
| **Parent** | No | No | String (Master Reference) |
| **Parent Hierarchy** | No | Yes | String |
| **Performance** | No | No | Number |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Reserved Name** | No | No | String |
| **Reservename** | No | No | String |
| **Salestaxcessdetails** | Yes | No | [Salestaxcessdetails](Salestaxcessdetails.md) |
| **Samplingamtonefactor** | No | No | Amount |
| **Samplingamttwofactor** | No | No | Amount |
| **Samplingdateonefactor** | No | No | Date |
| **Samplingdatetwofactor** | No | No | Date |
| **Samplingmethod** | No | No | String (Sysname) |
| **Samplingnumonefactor** | No | No | Number |
| **Samplingnumtwofactor** | No | No | Number |
| **Samplingstronefactor** | No | No | String (Sysname) |
| **Schvidetails** | Yes | No | [Schvidetails](Schvidetails.md) |
| **Servicetaxdetails** | Yes | No | [Servicetaxdetails](Servicetaxdetails.md) |
| **Sort Position** | No | No | Number (Integer) |
| **Syscreditparent** | No | No | String (Sysname) |
| **Sysdebitparent** | No | No | String (Sysname) |
| **Targetremoteid** | No | Yes | String |
| **Tcsapplicable** | No | No | String (Sysname) |
| **Tcscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Tdsapplicable** | No | No | String (Sysname) |
| **Tdscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Totalvercount** | No | No | Number (Integer) |
| **Track Negative Balances** | No | No | Logical |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Use For Vat** | No | No | Logical |
| **Vatdetails** | Yes | No | [Vatdetails](Vatdetails.md) |
| **Vercount** | No | No | Number (Integer) |
| **Xbrldetail** | Yes | No | [Xbrldetail](Xbrldetail.md) |
