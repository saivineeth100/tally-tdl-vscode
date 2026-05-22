# Clientrule Schema

> **Version**: 7.0

Reference documentation for the **Clientrule** schema.

### Meta

- **SDF Id**: CR
- **Is Primary**: Yes

> **Total Properties**: 120

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
| **Clientisremotealter** | No | No | Logical |
| **Clientsynccmpname** | No | No | String |
| **Clienturl** | No | No | String |
| **Combineopeningbrs** | No | No | Logical |
| **Depth** | No | No | Number |
| **Disabledeletedtransaction** | No | No | Logical |
| **Disablesummarytransaction** | No | No | Logical |
| **Disallowrecvlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Disallowsendlist** | Yes | No | [Syncallowdisallow](Syncallowdisallow.md) |
| **Enableonewaysync** | No | No | Logical |
| **Enablevchtypesync** | No | No | Logical |
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
| **Is Security On** | No | No | Logical |
| **Is Security On When Entered** | No | No | Logical |
| **Isactive** | No | No | Logical |
| **Isbasecurrsame** | No | No | Logical |
| **Isbatchinprogress** | No | No | Logical |
| **Isdeleted** | No | No | Logical |
| **Isfixedrule** | No | No | Logical |
| **Ismastersync** | No | No | Logical |
| **Isofflinesync** | No | No | Logical |
| **Istallycompression** | No | No | Logical |
| **Istallylinkserver** | No | No | Logical |
| **Isuploadrule** | No | No | Logical |
| **Language Name** | Yes | No | [Language Name](Language%20Name.md) |
| **Lastackaltid** | No | No | Number (Integer) |
| **Lastackmstid** | No | No | Number (Integer) |
| **Lastrefremmstaltid** | No | No | Number (Integer) |
| **Lastrefremmstid** | No | No | Number (Integer) |
| **Lastrefsrcmstaltid** | No | No | Number (Integer) |
| **Lastrefsrcmstid** | No | No | Number (Integer) |
| **Lastsentaltid** | No | No | Number (Integer) |
| **Lastsentaltmid** | No | No | Number (Integer) |
| **Lastsentaltmstid** | No | No | Number (Integer) |
| **Lastsentaltsumid** | No | No | Number (Integer) |
| **Lastsentmid** | No | No | Number (Integer) |
| **Lastsentmstid** | No | No | Number (Integer) |
| **Lastsentsumid** | No | No | Number (Integer) |
| **Lastsenttid** | No | No | Number (Integer) |
| **Lastsyncdate** | No | No | Date |
| **Lastsynctime** | No | No | String |
| **Loopcollection** | No | No | String |
| **Loopcollectionmst** | No | No | String |
| **Loopcollectionsum** | No | No | String |
| **Looperror** | No | No | String |
| **Masterid** | No | No | Number (Integer) |
| **Name** | No | Yes | String |
| **Narration** | No | No | String |
| **Notifyserversync** | No | No | Logical |
| **Objectupdateaction** | No | No | String (Sysname) |
| **Originaldepth** | No | No | Number |
| **Originalname** | No | No | String |
| **Originalsortposition** | No | No | Number |
| **Overridevchbankmanualstatus** | No | No | String (Sysname) |
| **Publickey** | No | No | String |
| **Recvdata** | No | No | Logical |
| **Remignorevchnumbering** | No | No | Logical |
| **Remotecmpbasecurrency** | No | No | String |
| **Remotecompanyname** | No | No | String |
| **Remoteguid** | No | No | String |
| **Remotelastsyncdate** | No | No | Date |
| **Remotelastsynctime** | No | No | String |
| **Remoteurl** | No | No | String |
| **Ruledeactivated** | No | No | Logical |
| **Ruleguid** | No | No | String |
| **Senddata** | No | No | Logical |
| **Serusestallynet** | No | No | Logical |
| **Servertallylinkid** | No | No | String |
| **Sort Position** | No | No | Number (Integer) |
| **Sourcealtid** | No | No | Number (Integer) |
| **Sourcealtmid** | No | No | Number (Integer) |
| **Sourcealtmstid** | No | No | Number (Integer) |
| **Sourcealtsumid** | No | No | Number (Integer) |
| **Sourcemid** | No | No | Number (Integer) |
| **Sourcemstid** | No | No | Number (Integer) |
| **Sourcesumid** | No | No | Number (Integer) |
| **Sourcetid** | No | No | Number (Integer) |
| **Syncaftersave** | No | No | Logical |
| **Syncaftersavelist** | Yes | No | [Syncaftersave](Syncaftersave.md) |
| **Syncalterid** | No | No | Number (Integer) |
| **Syncdeletionlist** | Yes | No | [Syncdeletiondetails](Syncdeletiondetails.md) |
| **Syncexceptionlist** | Yes | No | [Syncexceptiondetails](Syncexceptiondetails.md) |
| **Syncfrom** | No | No | Date |
| **Syncfromserenabled** | No | No | Logical |
| **Syncoverslowconn** | No | No | Logical |
| **Syncremoteexceptionlist** | Yes | No | [Syncexceptiondetails](Syncexceptiondetails.md) |
| **Syncto** | No | No | Date |
| **Typeofupdateactivity** | No | No | String (Sysname) |
| **Updateddatetime** | No | No | DateTime |
| **Updatemoditemopbal** | No | No | Logical |
| **Updatemodledopbal** | No | No | Logical |
| **Updateresponsename** | No | No | String |
| **Updatetrigger** | No | No | String |
| **Uploadreportname** | No | No | String |
