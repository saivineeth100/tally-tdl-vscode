# Serverrule Schema

> **Version**: 7.0

Reference documentation for the **Serverrule** schema.

### Meta

- **SDF Id**: SR
- **Is Primary**: Yes

> **Total Properties**: 107

## Properties

| Property Name | Complex | Is Repeated | Datatype / Object |
| --- | --- | --- | --- |
| **Active From** | No | No | Date |
| **Active To** | No | No | Date |
| **Allowrecvlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Allowsendlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Allvchtypelastsentid** | Yes | No | [Allvchtypelastsentid](Allvchtypelastsentid.md) |
| **Allvchtypesendrecv** | Yes | No | [Allvchtypesendrecv](Allvchtypesendrecv.md) |
| **Allvchtypesourceid** | Yes | No | [Allvchtypesourceid](Allvchtypesourceid.md) |
| **Alteredby** | No | No | String |
| **Alterid** | No | No | Logical |
| **Batchlastaltmstid** | No | No | Number (Integer) |
| **Batchlastaltsumid** | No | No | Number (Integer) |
| **Batchlastaltvchid** | No | No | Number (Integer) |
| **Batchlastmstid** | No | No | Number (Integer) |
| **Batchlastsumid** | No | No | Number (Integer) |
| **Batchlastvchid** | No | No | Number (Integer) |
| **Can Delete** | No | No | Logical |
| **Clientaccountid** | No | No | String |
| **Clientlinkid** | No | No | String |
| **Clientsynccmpname** | No | No | String |
| **Clienturl** | No | No | String |
| **Combineopeningbrs** | No | No | Logical |
| **Deactivated** | No | No | Logical |
| **Deactivatewhenclrchanges** | No | No | Logical |
| **Depth** | No | No | Number |
| **Disabledeletedtransaction** | No | No | Logical |
| **Disablesummarytransaction** | No | No | Logical |
| **Disallowrecvlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Disallowsendlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Enteredby** | No | No | String |
| **Errinfo** | Yes | No | [Error Info](Error%20Info.md) |
| **Errkey** | No | No | Number (Integer) |
| **Excludemasters** | No | No | Logical |
| **Expbasecurrency** | No | No | Logical |
| **Ignoremodvchtypemasters** | No | No | Logical |
| **Ignoremstifpresent** | No | No | Logical |
| **Ignorevchnumbering** | No | No | Logical |
| **Impforexinstdrate** | No | No | Logical |
| **Is Deemed Positive** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isactive** | No | No | Logical |
| **Isbasecurrsame** | No | No | Logical |
| **Isbatchinprogress** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Ismastersync** | No | No | Logical |
| **Isofflinesync** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Lastackaltid** | No | No | Number (Integer) |
| **Lastackmstid** | No | No | Number (Integer) |
| **Lastrefremmstaltid** | No | No | Number (Integer) |
| **Lastrefremmstid** | No | No | Number (Integer) |
| **Lastrefsrcmstaltid** | No | No | Number (Integer) |
| **Lastrefsrcmstid** | No | No | Number (Integer) |
| **Lastsentaltid** | No | No | Number (Integer) |
| **Lastsentaltmstid** | No | No | Number (Integer) |
| **Lastsentaltsumid** | No | No | Number (Integer) |
| **Lastsentmstid** | No | No | Number (Integer) |
| **Lastsentsumid** | No | No | Number (Integer) |
| **Lastsenttid** | No | No | Number (Integer) |
| **Lastsyncdate** | No | No | Date |
| **Lastsynctime** | No | No | String |
| **Loopcollection** | No | No | String |
| **Loopcollectionmst** | No | No | String |
| **Loopcollectionsum** | No | No | String |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Overridevchbankmanualstatus** | No | No | String (Sysname) |
| **Prevsettings** | Yes | No | [Prevsettings](Prevsettings.md) |
| **Recvdata** | No | No | Logical |
| **Remignorevchnumbering** | No | No | Logical |
| **Remotecmpbasecurrency** | No | No | String |
| **Remotecompanyname** | No | No | String |
| **Remoteenabledonewaysync** | No | No | Logical |
| **Remoteenabledvchtypesync** | No | No | Logical |
| **Remoteignoremodvtmasters** | No | No | Logical |
| **Remotelastsyncdate** | No | No | Date |
| **Remotelastsynctime** | No | No | String |
| **Remoteoverridevchbankmanualstatus** | No | No | String (Sysname) |
| **Remoterulename** | No | No | String |
| **Remotesyncaftersave** | No | No | Logical |
| **Remotesyncfrom** | No | No | Date |
| **Remotesyncto** | No | No | Date |
| **Remoteupdmoditemopbal** | No | No | Logical |
| **Remoteupdmodledopbal** | No | No | Logical |
| **Ruleguid** | No | No | String |
| **Senddata** | No | No | Logical |
| **Serusestallynet** | No | No | Logical |
| **Serverisremotealter** | No | No | Logical |
| **Sort Position** | No | No | Number (Integer) |
| **Sourcealtid** | No | No | Number (Integer) |
| **Sourcealtmid** | No | No | Number (Integer) |
| **Sourcealtmstid** | No | No | Number (Integer) |
| **Sourcealtsumid** | No | No | Number (Integer) |
| **Sourcemid** | No | No | Number (Integer) |
| **Sourcemstid** | No | No | Number (Integer) |
| **Sourcesumid** | No | No | Number (Integer) |
| **Sourcetid** | No | No | Number (Integer) |
| **Syncalterid** | No | No | Number (Integer) |
| **Syncdeletionlist** | Yes | No | [Syncdeletiondetails](Syncdeletiondetails.md) |
| **Syncexceptionlist** | Yes | No | [Syncexceptiondetails](Syncexceptiondetails.md) |
| **Syncfromserenabled** | No | No | Logical |
| **Syncremoteexceptionlist** | Yes | No | [Syncexceptiondetails](Syncexceptiondetails.md) |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Updatemoditemopbal** | No | No | Logical |
| **Updatemodledopbal** | No | No | Logical |
