# Exciseitemgodown Schema

> **Version**: 7.0

Reference documentation for the **Exciseitemgodown** schema.

### Meta

- **Is Primary**: No

> **Total Properties**: 15

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Exciseabatementpercentage** | No | No | Number |
| **Exciseallocationtype** | No | No | String |
| **Excisealtrepunits** | No | No | Number |
| **Excisebaseqty** | No | No | Quantity |
| **Excisebom** | Yes | No | [Excisebom](Excisebom.md) |
| **Exciseconvunit** | No | No | String (Master Reference) |
| **Exciseduties** | Yes | No | [Exciseduties](Exciseduties.md) |
| **Excisegodownname** | No | No | String (Master Reference) |
| **Exciseitemmrp** | No | No | Rate |
| **Excisemrprates** | Yes | No | [Excisemrprates](Excisemrprates.md) |
| **Exciserepdenominator** | No | No | Number |
| **Exciserepunits** | No | No | String (Master Reference) |
| **Exciserepunitsstr** | No | No | String |
| **Stockitemtype** | No | No | String (Sysname) |
| **Taxunitname** | No | No | String (Master Reference) |
