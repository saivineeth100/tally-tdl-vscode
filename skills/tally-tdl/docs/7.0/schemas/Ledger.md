# Ledger Schema

> **Version**: 7.0

Reference documentation for the **Ledger** schema.

### Meta

- **Aliases**: Ledgers
- **SDF Id**: LE
- **Is Primary**: Yes

> **Total Properties**: 472

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Abatementnotificationno** | No | No | String |
| **Abatementpercentage** | No | No | Number |
| **Accountaudit Entries** | Yes | No | [Accountaudit Entries](Accountaudit%20Entries.md) |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Additional Computations** | Yes | No | [Additional Computations](Additional%20Computations.md) |
| **Addlalloctype** | No | No | String (Sysname) |
| **Address** | No | Yes | String |
| **Address Native** | No | Yes | String |
| **Affects Gross Profit** | No | No | Logical |
| **Affects Stock** | No | No | Logical |
| **Allow In Mobile** | No | No | Logical |
| **Allowexportwitherrors** | No | No | Logical |
| **Alteredby** | No | No | String |
| **Alteredon** | No | No | Date |
| **Alterid** | No | No | Number (Integer) |
| **Appropriatefor** | No | No | String (Sysname) |
| **Appropriatetaxvalue** | No | No | Logical |
| **Asoriginal** | No | No | Logical |
| **Attendance Type** | No | No | String (Master Reference) |
| **Auditdetails** | Yes | No | [Auditdetails](Auditdetails.md) |
| **Audited** | No | No | Logical |
| **Auto Brs Configs** | Yes | No | [Auto Brs Configs](Auto%20Brs%20Configs.md) |
| **Available Transaction Types** | Yes | No | [Available Transaction Types](Available%20Transaction%20Types.md) |
| **Bank Allocations** | Yes | No | [Bank Allocations](Bank%20Allocations.md) |
| **Bank Details** | No | No | String |
| **Bank Export Formats** | Yes | No | [Bank Export Formats](Bank%20Export%20Formats.md) |
| **Bank Ur Entries** | Yes | No | [Bank Ur Entries](Bank%20Ur%20Entries.md) |
| **Bankaccholdername** | No | No | String |
| **Bankbranchname** | No | No | String |
| **Bankbsrcode** | No | No | String |
| **Bankcapsuleid** | No | No | String |
| **Bankconfigifsc** | No | No | String |
| **Bankconfigmicr** | No | No | String |
| **Bankconfigshortcode** | No | No | String |
| **Bankiban** | No | No | String |
| **Bankimportedstatements** | No | No | String |
| **Bankingconfigbank** | No | No | String |
| **Bankingconfigbankid** | No | No | String |
| **Bankisreconcileperfectmatches** | No | No | Logical |
| **Banklastfetchbalacctnum** | No | No | String |
| **Banklastfetchbalance** | No | No | Amount |
| **Banklastfetchbalancedatetime** | No | No | DateTime |
| **Banklastfetchstmtformat** | No | No | String |
| **Banklastfetchtransdate** | No | No | Date |
| **Banklastimportstmtdate** | No | No | Date |
| **Bankledgerbalancedetails** | Yes | No | [Bankledgerbalancedetails](Bankledgerbalancedetails.md) |
| **Bankmicr** | No | No | String |
| **Banknewstatements** | No | No | String |
| **Bankperfectmatchconfig** | No | No | String (Sysname) |
| **Bankuserloginid** | No | Yes | String |
| **Baseclosing** | No | No | Amount |
| **Baseparent** | No | No | Number (Integer) |
| **Basic Type Of Duty** | No | No | String |
| **Behaveaspaymentgateway** | No | No | Logical |
| **Beneficiarycodemaxlength** | No | No | Number |
| **Bill Allocations** | Yes | No | [Ledger Bill Allocations](Ledger%20Bill%20Allocations.md) |
| **Bill Credit Period** | No | No | String |
| **Branch Code** | No | No | String |
| **Brs Imported Info** | Yes | No | [Brs Imported Info](Brs%20Imported%20Info.md) |
| **Businesstype** | No | No | String (Sysname) |
| **Calculation Basis** | No | No | Number |
| **Calculation Period** | No | No | String (Sysname) |
| **Calculation Type** | No | No | String (Sysname) |
| **Can Delete** | No | No | Logical |
| **Cancelledpayallocations** | Yes | No | [Bank Allocations](Bank%20Allocations.md) |
| **Cash Inflow** | No | No | Amount |
| **Cash Outflow** | No | No | Amount |
| **Cess Valuation Method** | No | No | String (Sysname) |
| **Chequerange** | Yes | No | [Chequerange](Chequerange.md) |
| **Client Code** | No | No | String |
| **Closing Balance** | No | No | Amount |
| **Computation Type** | No | No | String (Sysname) |
| **Considerpurchaseforexport** | No | No | Logical |
| **Contactdetails** | Yes | No | [Contactdetails](Contactdetails.md) |
| **Corporateusername** | No | No | String |
| **Corporateusernoach** | No | No | String |
| **Corporateusernoecs** | No | No | String |
| **Country Name** | No | No | String |
| **Country Name Native** | No | No | String |
| **Countryofresidence** | No | No | String |
| **Created by** | No | No | String |
| **Created Date** | No | No | Date |
| **Credit Totals** | No | No | Amount |
| **Creditlimit** | No | No | Amount |
| **Crinterest** | No | No | Amount |
| **Crinterestcoll** | No | No |  |
| **Cstregistrationdate** | No | No | Date |
| **Currency Name** | No | No | String (Master Reference) |
| **Debit Totals** | No | No | Amount |
| **Deductee Type** | No | No | String (Master Reference) |
| **Deducteereference** | No | No | String |
| **Deductinsamevchrules** | Yes | No | [Deductinsamevchrules](Deductinsamevchrules.md) |
| **Default Language** | No | No | Number (Integer) |
| **Defaultchequedetails** | Yes | No | [Chequedetails](Chequedetails.md) |
| **Defaultcontravchtype** | No | No | String (Master Reference) |
| **Defaultdepositvchtype** | No | No | String (Master Reference) |
| **Defaultnumseriesdeposit** | No | No | String |
| **Defaultnumseriesinternaltransfer** | No | No | String |
| **Defaultnumserieswithdrawl** | No | No | String |
| **Defaultopeningchequedetails** | Yes | No | [Openingchequedetails](Openingchequedetails.md) |
| **Defaulttransfermode** | No | No | String (Sysname) |
| **Defaultvchchequedetails** | Yes | No | [Vchchequedetails](Vchchequedetails.md) |
| **Defaultwithdrawvchtype** | No | No | String (Master Reference) |
| **Depth** | No | No | Number |
| **Description** | No | No | String |
| **Drinterest** | No | No | Amount |
| **Drinterestcoll** | No | No |  |
| **Ebankingformat** | No | No | String |
| **Echequepayablelocation** | Yes | No | [Location Details](Location%20Details.md) |
| **Echequepayablelocationversion** | No | No | Number |
| **Echequeprintlocation** | Yes | No | [Location Details](Location%20Details.md) |
| **Echequeprintlocationversion** | No | No | Number |
| **Ecommmerchantid** | No | No | String |
| **Eddpayablelocation** | Yes | No | [Location Details](Location%20Details.md) |
| **Eddpayablelocationversion** | No | No | Number |
| **Eddprintlocation** | Yes | No | [Location Details](Location%20Details.md) |
| **Eddprintlocationversion** | No | No | Number |
| **Email** | No | No | String |
| **Emailcc** | No | No | String |
| **Encrptionlocation** | No | No | String |
| **Encryptedby** | No | No | String |
| **Encryptedid** | No | No | String |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Excise Account Head** | No | No | String |
| **Excise Commissionerate** | No | No | String |
| **Excise Duty Type** | No | No | String (Sysname) |
| **Excise Ledger Classification** | No | No | String |
| **Excise Registration Number** | No | No | String |
| **Excise Tariff Details** | Yes | No | [Excise Tariff Details](Excise%20Tariff%20Details.md) |
| **Excisealloctype** | No | No | String |
| **Exciseapplicability** | No | No | String (Sysname) |
| **Excisedefaultremoval** | No | No | String (Sysname) |
| **Excisedivision** | No | No | String |
| **Excisedutyhead** | No | No | String (Master Reference) |
| **Excisedutyheadcode** | No | No | String |
| **Exciseimportsregistartionno** | No | No | String |
| **Excisejurisdictiondetails** | Yes | No | [Excisejurisdictiondetails](Excisejurisdictiondetails.md) |
| **Excisenatureofpurchase** | No | No | String (Sysname) |
| **Excisenotificationno** | No | No | String |
| **Excisenotificationslno** | No | No | String |
| **Exciserange** | No | No | String |
| **Exciseregistrationdate** | No | No | Date |
| **Exciseregno** | No | No | String |
| **Excisetypeofbranch** | No | No | String (Sysname) |
| **Excludedtaxations** | Yes | No | [Excludedtaxations](Excludedtaxations.md) |
| **Exemptiontype** | No | No | String (Sysname) |
| **Exportimportcode** | No | No | String |
| **Fieldvalidationdetails** | Yes | No | [Fieldvalidationdetails](Fieldvalidationdetails.md) |
| **First Voucher Date** | No | No | Date |
| **For Payroll** | No | No | Logical |
| **For Service Tax** | No | No | Logical |
| **Forexclosingcr** | No | No | Amount |
| **Forexclosingdr** | No | No | Amount |
| **Forexopeningcr** | No | No | Amount |
| **Forexopeningdr** | No | No | Amount |
| **Gratuity Limit Amount** | No | No | Amount |
| **Gratuity Limit Months** | No | No | Number |
| **Gratuity Month Days** | No | No | Number |
| **Gratuity Period** | Yes | No | [Gratuity Period](Gratuity%20Period.md) |
| **Grpcreditparent** | No | No | String (Master Reference) |
| **Grpdebitparent** | No | No | String (Master Reference) |
| **Gst Type** | No | No | String (Sysname) |
| **Gstapplicable** | No | No | String (Sysname) |
| **Gstappropriateto** | No | No | String (Sysname) |
| **Gstdetails** | Yes | No | [Gstdetails](Gstdetails.md) |
| **Gstdutyhead** | No | No | String (Sysname) |
| **Gstisdutyledger** | No | No | Logical |
| **Gstispartyledger** | No | No | Logical |
| **Gstispurchaseledger** | No | No | Logical |
| **Gstissalesledger** | No | No | Logical |
| **Gstnatureofsupply** | No | No | String (Sysname) |
| **Gstreconprefixsuffixdetails** | Yes | No | [Gstreconprefixsuffixdetails](Gstreconprefixsuffixdetails.md) |
| **Gstregistrationtype** | No | No | String (Sysname) |
| **Gsttypeofsupply** | No | No | String (Sysname) |
| **Guid** | No | No | String |
| **Has Client Code** | No | No | Logical |
| **Hasechequebanklocation** | No | No | Logical |
| **Hasechequecity** | No | No | Logical |
| **Hasechequedeliverymode** | No | No | Logical |
| **Hasechequedeliveryto** | No | No | Logical |
| **Hasechequepayablelocation** | No | No | Logical |
| **Hasechequeprintlocation** | No | No | Logical |
| **Haseddbanklocation** | No | No | Logical |
| **Haseddcity** | No | No | Logical |
| **Hasedddeliverymode** | No | No | Logical |
| **Hasedddeliveryto** | No | No | Logical |
| **Haseddpayablelocation** | No | No | Logical |
| **Haseddprintlocation** | No | No | Logical |
| **Hsn Details** | Yes | No | [Hsn Details](Hsn%20Details.md) |
| **Ifs Code** | No | No | String |
| **Ignore Tds Exempt** | No | No | Logical |
| **Ignoremismatchwithwarning** | No | No | Logical |
| **Imf Name** | No | No | String |
| **Importedimflocation** | No | No | String |
| **Importerexportercode** | No | No | String |
| **Income Tax Number** | No | No | String |
| **Inputcrallocs** | Yes | No | [Inputcrallocs](Inputcrallocs.md) |
| **Interest Appl From** | No | No | Number (Integer) |
| **Interest Appl On** | No | No | String (Sysname) |
| **Interest Balance Type** | No | No | String (Sysname) |
| **Interest Basis** | No | No |  |
| **Interest Collection** | Yes | No | [Interest Collection](Interest%20Collection.md) |
| **Interest From Type** | No | No | String (Sysname) |
| **Interest On Billwise** | No | No | Logical |
| **Interest Rate** | No | No | Number |
| **Interest Style** | No | No | String (Sysname) |
| **Interestincldayofaddition** | No | No | Logical |
| **Interestincldayofdeduction** | No | No | Logical |
| **Interstate Stnumber** | No | No | String |
| **Interstateoldstnumber** | No | No | String |
| **Is Condensed** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Exempted** | No | No | Logical |
| **Is Fbt Applicable** | No | No | Logical |
| **Is Input Credit** | No | No | Logical |
| **Is Interest Incl Last Day** | No | No | Logical |
| **Is Interest On** | No | No | Logical |
| **Is Reserved** | No | No | Logical |
| **Is Revenue** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Is Tcs Applicable** | No | No | Logical |
| **Is Tds Applicable** | No | No | Logical |
| **Is Transporter** | No | No | Logical |
| **Isabatementapplicable** | No | No | Logical |
| **Isabcenabled** | No | No | Logical |
| **Isagainstformc** | No | No | Logical |
| **Isbankstatusapp** | No | No | Logical |
| **Isbatchenabled** | No | No | Logical |
| **Isbehaveasduty** | No | No | Logical |
| **Isbeneficiarycodeon** | No | No | Logical |
| **Isbillwiseon** | No | No | Logical |
| **Isbnfcodesupported** | No | No | Logical |
| **Ischequeprintingenabled** | No | No | Logical |
| **Iscostcentreson** | No | No | Logical |
| **Iscosttrackingon** | No | No | Logical |
| **Iscreditdayschkon** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Isebankingenabled** | No | No | Logical |
| **Isebankingsupported** | No | No | Logical |
| **Isecashledger** | No | No | Logical |
| **Isecdiffinsdate** | No | No | Logical |
| **Isechequesupported** | No | No | Logical |
| **Isecommoperator** | No | No | Logical |
| **Iseddsupported** | No | No | Logical |
| **Iseditlogpresent** | No | No | Logical |
| **Isedliapplicable** | No | No | Logical |
| **Isexcise Applicable** | No | No | Logical |
| **Isexcisemerchantexporter** | No | No | Logical |
| **Isexportfileencrypted** | No | No | Logical |
| **Isexportonvchcreate** | No | No | Logical |
| **Isfilenameformatsupported** | No | No | Logical |
| **Isgst Applicable** | No | No | Logical |
| **Isincludepymtadvbillwise** | No | No | Logical |
| **Ismstfromsync** | No | No | Logical |
| **Isocurrencycode** | No | No | String |
| **Isothterritoryassessee** | No | No | Logical |
| **Ispartyexempted** | No | No | Logical |
| **Ispaybatchonlysal** | No | No | Logical |
| **Ispayupload** | No | No | Logical |
| **Isproductcodebased** | No | No | Logical |
| **Ispymtadvccenabled** | No | No | Logical |
| **Ispymtadvonline** | No | No | Logical |
| **Israteinclusivevat** | No | No | Logical |
| **Isrelatedparty** | No | No | Logical |
| **Issalarygrouped** | No | No | Logical |
| **Issalarymulfile** | No | No | Logical |
| **Issalarytransgroupedforbrs** | No | No | Logical |
| **Isscbuae** | No | No | Logical |
| **Issezparty** | No | No | Logical |
| **Isstxnonrealizedtype** | No | No | Logical |
| **Isstxparty** | No | No | Logical |
| **Istdsexpense** | No | No | Logical |
| **Istdsprojected** | No | No | Logical |
| **Isupdatingtargetid** | No | No | Logical |
| **Isusedforcvd** | No | No | Logical |
| **Itcomponent** | No | No | String (Master Reference) |
| **Itexemptapplicable** | No | No | String (Sysname) |
| **Itnature** | No | No | String (Sysname) |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Last Voucher Date** | No | No | Date |
| **Lastinterestdate** | No | No | Date |
| **Lastpostdatedvchdate** | No | No | Date |
| **Lastusedbatchname** | No | No | String |
| **Lbtregndate** | No | No | Date |
| **Lbtregndetails** | Yes | No | [Lbtregndetails](Lbtregndetails.md) |
| **Lbtregnno** | No | No | String |
| **Lbtzone** | No | No | String |
| **Leave Type** | No | No | String (Master Reference) |
| **Led Gst Reg Details** | Yes | No | [Led Gst Registration Details](Led%20Gst%20Registration%20Details.md) |
| **Led Mailing Details** | Yes | No | [Led Mailing Details](Led%20Mailing%20Details.md) |
| **Led Payinsconfigs** | Yes | No | [Led Payinsconfigs](Led%20Payinsconfigs.md) |
| **Ledaddlalloctype** | No | No | String (Sysname) |
| **Ledbelongstonontaxable** | No | No | Logical |
| **Ledger Closing Values** | Yes | No | [Ledger Closing Values](Ledger%20Closing%20Values.md) |
| **Ledger Fbt Category** | No | No | String (Master Reference) |
| **Ledger Pending Bills** | Yes | No | [Bill](Bill.md) |
| **Ledgerauditclass** | Yes | No | [Ledgerauditclass](Ledgerauditclass.md) |
| **Ledgercontact** | No | No | String |
| **Ledgercountryisdcode** | No | No | String |
| **Ledgerfax** | No | No | String |
| **Ledgermobile** | No | No | String |
| **Ledgerphone** | No | No | String |
| **Ledmulti Address List** | Yes | No | [Ledmulti Address List](Ledmulti%20Address%20List.md) |
| **Ledstatename** | No | No | String |
| **Lowerdeduction** | Yes | No | [Lowerdeduction](Lowerdeduction.md) |
| **Mailing Name** | No | No | String |
| **Mailing Name Native** | No | No | String |
| **Masterid** | No | No | Number (Integer) |
| **Mastertype** | No | No | String |
| **Msme Registration Details** | Yes | No | [Msme Registration Details](Msme%20Registration%20Details.md) |
| **Msmeregnumber** | No | No | String |
| **Name** | No | Yes | String |
| **Nameonpan** | No | No | String |
| **Narration** | No | No | String |
| **Natureofsales** | No | No | String (Sysname) |
| **Newimflocation** | No | No | String |
| **Notification Number** | No | No | String |
| **Notificationslno** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Odlimit** | No | No | Amount |
| **Old Address** | No | Yes | String |
| **Old Mailing Name** | No | Yes | String |
| **Old Pin Code** | No | No | String |
| **Oldauditentries** | Yes | No | [Audit Entries](Audit%20Entries.md) |
| **Oldauditentryids** | No | Yes | Number (Integer) |
| **Oldcountryname** | No | No | String |
| **Oldledstatename** | No | No | String |
| **On Account Value** | No | No | Amount |
| **Opening Balance** | No | No | Amount |
| **Original Closing Balance** | No | No | Amount |
| **Original Opening Balance** | No | No | Amount |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Otherpymtproductcode** | No | No | String |
| **Over Ride  Creditlimit** | No | No | Logical |
| **Overdue Bills** | No | No | Amount |
| **Override Adv Interest** | No | No | Logical |
| **Override Interest** | No | No | Logical |
| **Overridebasedonrealization** | No | No | Logical |
| **Panapplicablefrom** | No | No | Date |
| **Panstatus** | No | No | String (Sysname) |
| **Parent** | No | No | String (Master Reference) |
| **Parent Hierarchy** | No | Yes | String |
| **Partybusinessstyle** | No | No | String |
| **Partybusinesstype** | No | No | String |
| **Partygstin** | No | No | String |
| **Partyoldgstin** | No | No | String |
| **Pay Type** | No | No | String (Sysname) |
| **Payinsbatchname** | No | No | String |
| **Payinsfilenumlength** | No | No | Number |
| **Payinsfilenumperiod** | No | No | String |
| **Payinsisbatchapplicable** | No | No | Logical |
| **Payinsisfilenumapp** | No | No | Logical |
| **Payinsrunningfiledate** | No | No | Date |
| **Payinsrunningfilenum** | No | No | Number |
| **Payment Details** | Yes | No | [Payment Details](Payment%20Details.md) |
| **Paymentgateway** | No | No | String |
| **Paymentinstlocation** | No | No | String |
| **Payslip Name** | No | No | String |
| **Paystattype** | No | No | String (Sysname) |
| **Performance** | No | No | Number |
| **Philippinesledvatclass** | No | No | String |
| **Pin Code** | No | No | String |
| **Plasincomeexpense** | No | No | Logical |
| **Price Level** | No | No | String |
| **Prior State Name** | No | No | String (Sysname) |
| **Productcodetype** | No | No | String (Sysname) |
| **Professionaltaxnumber** | No | No | String |
| **Pymtadvccemailids** | No | Yes | String |
| **Pymtinstoutputname** | No | No | String |
| **Rate Of Tax Calculation** | No | No | Number |
| **Registration Number** | No | No | String |
| **Relatedpartyid** | No | No | String |
| **Relationtype** | No | No | String |
| **Relpartyissuingauthority** | No | No | String |
| **Remotealterid** | No | No | Number (Integer) |
| **Remotealtguid** | No | No | String |
| **Remoteguid** | No | No | String |
| **Requestorrule** | No | No | String |
| **Reserved Name** | No | No | String |
| **Reservename** | No | No | String |
| **Rounding Limit** | No | No | Number |
| **Rounding Method** | No | No | String (Sysname) |
| **Salarypymtproductcode** | No | No | String |
| **Sales Tax Number** | No | No | String |
| **Salestaxcessapplicable** | No | No | String (Sysname) |
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
| **Service Category** | No | No | String (Master Reference) |
| **Servicetaxapplicable** | No | No | String (Sysname) |
| **Servicetaxdetails** | Yes | No | [Servicetaxdetails](Servicetaxdetails.md) |
| **Show In Payslip** | No | No | Logical |
| **Slab Period** | Yes | No | [Slab Period](Slab%20Period.md) |
| **Sort Position** | No | No | Number (Integer) |
| **St Reg Date** | No | No | Date |
| **Starting From** | No | No | Date |
| **State Name** | No | No | String (Master Reference) |
| **State Name Native** | No | No | String |
| **Stxabatementdetails** | Yes | No | [Stxabatementdetails](Stxabatementdetails.md) |
| **Stxclassification** | No | No | String (Sysname) |
| **Stxdutyhead** | No | No | String (Sysname) |
| **Stxnatureofparty** | No | No | String (Sysname) |
| **Stxtaxdetails** | Yes | No | [Stxtaxdetails](Stxtaxdetails.md) |
| **Subtaxtype** | No | No | String (Sysname) |
| **Swiftcode** | No | No | String |
| **Syscreditparent** | No | No | String (Sysname) |
| **Sysdebitparent** | No | No | String (Sysname) |
| **Targetremoteid** | No | Yes | String |
| **Tax Classification Name** | No | No | String (Master Reference) |
| **Tax Type** | No | No | String (Sysname) |
| **Taxidentificationno** | No | No | String |
| **Tcsapplicable** | No | No | String (Sysname) |
| **Tcscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Tcsmethodofcalculation** | Yes | No | [Tcsmethodofcalculation](Tcsmethodofcalculation.md) |
| **Tds Deductee Is Special Rate** | No | No | Logical |
| **Tds Deductee Section Number** | No | No | String |
| **Tds Deductee Special Rate** | No | No | Number |
| **Tds Rate Name** | No | No | String (Master Reference) |
| **Tdsapplicable** | No | No | String (Sysname) |
| **Tdscategorydetails** | Yes | No | [Tdscategorydetails](Tdscategorydetails.md) |
| **Tdsdeducteetype** | No | No | String (Sysname) |
| **Tdsdeducteetypemst** | No | No | String (Master Reference) |
| **Tdsexemptionrules** | Yes | No | [Tdsexemptionrules](Tdsexemptionrules.md) |
| **Totalassessableamount** | No | No | Amount |
| **Transactiontypeversion** | No | No | Number |
| **Transfermodelimitdetails** | Yes | No | [Transfermodelimitdetails](Transfermodelimitdetails.md) |
| **Transporter Id** | No | No | String |
| **Typecodedetails** | Yes | No | [Typecodedetails](Typecodedetails.md) |
| **Typeofintereston** | No | No | String (Sysname) |
| **Typeofnotification** | No | No | String (Sysname) |
| **Typeoftariff** | No | No | String (Sysname) |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Uploadlastrefresh** | No | No | String |
| **Use For Gratuity** | No | No | Logical |
| **Use For Vat** | No | No | Logical |
| **Useasnotionalbank** | No | No | Logical |
| **Usedfortaxtype** | No | No | String (Sysname) |
| **Useforesieligibility** | No | No | Logical |
| **Useforkkc** | No | No | Logical |
| **Usefornotionalitc** | No | No | Logical |
| **Useforpostype** | No | No | String (Sysname) |
| **Useforpurchasetax** | No | No | Logical |
| **Useforsbc** | No | No | Logical |
| **Userdefinedcalendertype** | No | No | String (Master Reference) |
| **Vat Tin Number** | No | No | String |
| **Vatapplicable** | No | No | String (Sysname) |
| **Vatapplicabledate** | No | No | Date |
| **Vatdealernature** | No | No | String |
| **Vatdealertype** | No | No | String (Sysname) |
| **Vatdetails** | Yes | No | [Vatdetails](Vatdetails.md) |
| **Vatdistrictname** | No | No | String |
| **Vatoldtinnumber** | No | No | String |
| **Vatregistrationdate** | No | No | Date |
| **Vattaxexemptiondate** | No | No | Date |
| **Vattaxexemptionnature** | No | No | String |
| **Vattaxexemptionnumber** | No | No | String |
| **Virtualpaymentaddress** | No | No | String |
| **Website** | No | No | String |
| **Xbrldetail** | Yes | No | [Xbrldetail](Xbrldetail.md) |
