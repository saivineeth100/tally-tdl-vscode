# Actions, Events, Buttons, and Keys in TDL

Tally Definition Language (TDL) is an event-driven language where events triggered by a keyboard shortcut or mouse click execute predefined actions. This document outlines the comprehensive framework for Actions, Events, Buttons, and Keys.

---

## 1. Actions

Actions are activators of a specific task with a definite result. An action always originates from a User Interface (UI) Object like a Menu, Form, Line, or Field.

### Components of Actions
Any Action is executed with respect to two contexts:
1. **Originator**: Initiates the action (e.g., Menu, Form, Line, or Field). The sequence followed to gather all keys originating within a report is top to bottom (from Report to Field). The lowest hierarchy gets highest precedence.
2. **Executor**: The object on which the action is executed. For example, a `Form Accept` key at the field level is still executed by the Form.

### Categories of Actions
Actions are broadly classified into two categories:
* **Global Actions**: Not specific to any UI Object. Can be originated by a Menu, Button/Key, or Field. Performed on a Report or a Menu (e.g., `Create`, `Display`, `Alter`, `Print`).
* **Object Specific Actions**: Can act only upon specific UI Objects. Can be originated by a Menu, Form, Line, or Field. Performed on the relevant Interface Object (e.g., `Line Up`, `Line Down`, `Form Accept`).

---

### 1.1 Global Actions

#### Menu
Acts only on the Menu definition. The value must be a Menu name.
```tdl
Action : Menu : <Menu Name>
```

#### Modify Object
Alters the methods of an object at any level in the object hierarchy. Supports modifying multiple values.
```tdl
Action : Modify Object : <PrimaryObjectSpec>.<SubObjectPathSpec>.MethodName : <Value> [, MethodName : <Value> ...]
```
*Note: A single `Modify Object` action cannot modify methods of multiple primary objects, but can modify multiple values of the same object.*

#### Browse URL
Provides a link to any web browser.
```tdl
Action : Browse URL : <URL Formula> : [<Command Line Parameters> : <Logical Expression1> : <Logical Expression2>]
```
* `<Logical Expression 1>`: If Yes, executes in hidden mode.*
* `<Logical Expression 2>`: If Yes, executes in admin mode.*

#### Create and Alter
Activate a report in Create (add values) or Alter (modify values) mode. The report must be associated with a data object to store values in the Tally database.

#### Create / Display / Alter Collection
Used to create, display, or alter objects within a collection (e.g., Ledgers, Groups, Stock Items). Routes the final report through the defined collection.

#### Dynamic Actions
Allows execution of actions based on dynamic evaluation of parameters.
```tdl
Action : <Action Keyword Expression> : <Action Parameter Expression>
```

#### Log Object
Logs the current object context details to a file.
```tdl
Log Object [:<path/filename> [:<Overwrite Flag>]]
```

#### Log Target
Logs details of the target object in a file.
```tdl
Log Target [:<path/filename> [:<Overwrite Flag>]]
```

#### Refresh Data
Refreshes data in memory automatically to display updated information (e.g., when used with a Timer Event).
```tdl
REFRESH DATA
```

#### SLEEP
Specifies a time delay during code execution (suspends for a duration).
```tdl
SLEEP : <Duration in Seconds>
```

#### Copy File
Copies files/folders locally or across FTP.
```tdl
Copy File : <Destination File Path> : <Source File Path>
```

#### Execute TDL
Programmatically loads a TDL/TCP, performs actions, and optionally unloads the TDL.
```tdl
EXECUTE TDL : <TDL/TCP File Path> [: <Keep TDL Loaded Flag> : <Action> : <Action Parameters>]
```

#### BrowseURL Ex / Execute Command Ex
Opens a file, URL, executable, or folder and waits until the external application is closed before continuing the TDL action sequence.
```tdl
BrowseURL Ex : <URL/File path/executable file path/folder path> [:<Command line Parameters>]
```

---

### 1.2 Object Specific Actions

#### Menu Actions
* `Menu Up`, `Menu Down`, `Menu Reject` (Act upon Menu)

#### Form Actions
* `Form Accept` (Saves form), `Form Reject` (Quits without saving), `Form End`.

#### Part Actions
* `Part Home` (Positions cursor at beginning of part), `Part End` (End of part), `Part Pg Up`.

#### Line Actions
* `Explode` (Explodes line details), `Display Object` (Displays object context), `Alter Object`.

#### Field Actions
* `Field Copy`, `Field Paste`, `Field Erase` (Erases contents without backspace/delete), `Calculator` (Invokes calculator for numeric fields).

---

### 1.3 Procedural and Conditional Actions

#### Do If
Executes an action only when the condition evaluates to True. Available as a system action and for conditional action execution in Buttons.
```tdl
Do If : <Condition> : <Action Keyword> [:<Action Parameters>]
```

#### START BATCH POST and END BATCH POST (Function Actions)
Groups multiple object updates into batches for optimal performance when importing/updating database via User-Defined Functions.
```tdl
START BATCH POST [:<Batch Size>]
NEW OBJECT : <Object Type> : <Object Name> : <Forced Update Flag>
... <Actions> ...
SAVE TARGET
END BATCH POST
```

#### Start MSG BOX and End MSG BOX
Asynchronous message boxes. The message box is displayed without waiting for user input and stays open until `End MSG BOX` is encountered.
```tdl
Start MSG BOX : <Title Expression> : <Message Expression>
... <Actions> ...
End MSG BOX
```

#### ZIP / UNZIP Actions
Data compression and extraction actions.
**ZIP:**
```tdl
Zip : <Target File> : <Source Path> [:<Password> [:<Overwrite> [:<Include Sub-directory> [:<Show Progress Bar>]]]]
```
*Procedural ZIP:*
```tdl
Start Zip : <Target File> [: <Overwrite>]
Zip Add Path : <Source Path> [: <Include sub-directory>]
Zip Exclude Path : <Exclude Path>
End Zip
```

**UNZIP:**
```tdl
Unzip : <Target Folder> : <Source File> [:<Password> [:<Overwrite> [:<Show Progress Bar>]]]
```
*Procedural UNZIP (Partial Unzip):*
```tdl
Start Unzip : <Source File> [: <Password>]
Extract Path : <Folder/ File Path>
Unzip Exclude Path : <Folder/ File Path>
End Unzip : <Target folder> [:<Overwrite> [:<Show Progress Bar>]]
```
*Limitations: Maximum 65,535 files, size limit of 4 GB.*

#### Programmable Configuration for Print, Export, Mail, Upload
Bypass the configuration screen by passing a logical parameter. 
```tdl
<Action Name> : <Report Name> : <Logical Value>
```
*Example: `10 : MAIL : Ledger Outstandings : TRUE` skips the config screen if specific variables like `SVPrintFileName` are set.*

#### System Actions
* **Load TDL**: Dynamically loads TDL for the current session.
  ```tdl
  LOAD TDL : <TDL/TCP File Path Expression>
  ```
* **Unload TDL**: Unloads a dynamically loaded TDL or one defined in Tally.ini (temporarily).
  ```tdl
  UNLOAD TDL : <TDL/TCP File Path Expression or GUID Expression>
  ```
* **Exec Excel Macro**: Invokes a defined macro in Excel.
  ```tdl
  Exec Excel Macro : <Macro Name> [:<Parameter list>]
  ```
* **Format Excel Sheet**: Sets cell properties in Excel.
  ```tdl
  Format Excel Sheet : <PropertyName> : <PropertyParms>
  ```

---

## 2. Event Framework

Event handling detects an event and triggers an action based on conditions. Events are classified as System Events or Object-Specific Events.

### 2.1 System Events
Defined in the `[System : Events]` definition. These lack specific UI object context.
```tdl
[System : Events]
<Label> : <EventKeyword> : <ConditionExpr> : <ActionKeyword> : <Action Parameters>
```
Supported keywords:
* **System Start**: Executed upon Tally application launch.
* **System End**: Executed upon quitting the Tally application.
* **Load Company**: Executed when a company is loaded.
* **Close Company**: Executed when a company is closed.
* **NatLangQuery**: Traps natural language queries (SMS/Calculator).
* **Before Delete Object / After Delete Object**: Triggered before/after a primary object (Company, Ledger, Voucher, etc.) is deleted.
* **Before Cancel Object / After Cancel Object**: Triggered before/after a Voucher object is cancelled.

### 2.2 Object-Specific Events
Triggered for specific UI Objects context using the `ON` attribute.
```tdl
ON : <EventKeyword> : <ConditionExpr> : <ActionKeyword> : <Action Parameters>
```
Supported keywords:
* **Form Accept**: (Form definition). Overrides default Form Accept. User must explicitly call `Form Accept` if this event is trapped.
* **FOCUS**: (Part, Line, Field definitions). Triggers actions when object receives focus.
* **BEFORE PRINT**: (Report definition). Triggers before printing a report.
* **AFTER PRINT / Print**: (Report, Form, Part, Line). Triggers after the object is printed.
* **Load**: (Report definition). Triggered *before* the report is displayed to the user (allows state changes before entry).
* **Reject**: (Form definition). Executed when the user quits without saving. Overrides default `Form Reject` (must explicitly call it).
* **Accept**: (Field definition). Executed when an editable field is accepted (after validation and Modifies variable update). Overrides default `Field Accept`.
* **After Import Object**: (Import File definition). Used for custom actions after importing each object.

### 2.3 Timer Event
Performs operations automatically at periodic intervals.
```tdl
[System : Event]
<Timer Name> : TIMER : <Condition> : <Action> : <Action Parameters>
```
**Actions for Timers:**
* `START TIMER : <Timer Name> : Duration in seconds`
* `STOP TIMER : <Timer Name>`

---

## 3. Buttons and Keys

Buttons and Keys trigger actions. Keys are invisible combinations, whereas Buttons are visible on the Button Bar (and can also have keys).

### Attributes of Buttons/Keys

#### Title
The label displayed on the button bar (Optional).
```tdl
Title : <Button Title>
```

#### Key
A unique key combination. Mandatory if an action is specified.
```tdl
Key : <Combination of Keys>
```

#### Action
Associates a single Action with the button.
```tdl
Action : <Required Action>
```

#### Inactive
Logical condition. If FALSE, the button is displayed but cannot be activated.
```tdl
Inactive : <Logical Condition>
```

#### ActionEx
Enhances multi-action support at the button/key level.
```tdl
ActionEx : <Label> : <Action Keyword> [:<Action Parameters>]
```
* **Label**: An identifier for the statement. If labels are unique, actions execute in order of specification. If multiple instances have the same label, **only the last action** specified within the same label executes.
* Action Priorities when multiple attributes are used on a Button:
  1. `Action List` (Highest)
  2. `ActionEx`
  3. `Action` (Lowest)
*(Only the highest priority attribute will execute; others are ignored).*
