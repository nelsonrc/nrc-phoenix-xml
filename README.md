# nrc-phoenix-xml
**Advanced XML Utilities for TypeScript**  
A powerful and modular library for parsing, validating, and summarizing XML data.


## 🚀 Features
- **XML Parsing & Validation** with XSD support
- **Data Summarization** with configurable aggregation methods
- **Data Summarization of same field** with different measures
- **Modular and Scalable Architecture**
- **Localization Support** (e.g., currency & percentage formatting)
- **Built-in Error Handling and Debugging**


## 📦 Installation
Install via **npm**:
```sh
npm install nrc-phoenix-xml
```

## 📘 Documentation

Full API reference and usage examples are available at:

👉 [https://nelsonrc.github.io/nrc-phoenix-xml/](https://nelsonrc.github.io/nrc-phoenix-xml/)

---

### 🔹 `parseXmlSummary(summaryStr: string): IXmlSummary`

Parses a summary string into a structured summary configuration.

- **`summaryStr`**: Comma-separated configuration string  
- **Returns**: `IXmlSummary` object  
- **Throws**: Error if string is malformed

<details>
<summary>Basic Usage</summary>

#### 🔹 Code
```Ts
import { parseXmlSummary } from "nrc-phoenix-xml"

const summary = "Item,1,Category:Group,Price:Total Price:1,Qty:Count:3"

const result = parseXmlSummary(summary)
console.log(result)
```

#### 🔹 Output
```Json
{
  "targetNode": "Item",
  "orientation": 1,
  "groupingField": "Category",
  "groupingDisplayName": "Group",
  "fields": [
    { "name": "Price", "displayName": "Total Price", "measure": 1 },
    { "name": "Qty", "displayName": "Count", "measure": 3 }
  ]
}
```
</details>


---

### 🔹 `parseFormatOptions(optionsStr: string): IXmlSummaryFormatOptions`

Parses a compact options string into a formatting config object.

- **`optionsStr`**: Key-value string (e.g. `rd=2,cu=USD`)  
- **Returns**: `IXmlSummaryFormatOptions` object

<details>
<summary>Basic Usage</summary>

#### 🔹 Code
```Ts
import { parseFormatOptions } from "nrc-phoenix-xml"

const config = "rd=2,cu=USD,sc=1,as=1,tm=0,sr=1,pf=Avg%|Rate%,if=Qty|Count"

const options = parseFormatOptions(config)
console.log(options)
```

#### 🔹 Output
```Json
{
  "roundDecimals": 2,
  "currency": "USD",
  "showCurrencySymbol": true,
  "asJson": true,
  "treatMissingAsZero": false,
  "sortResults": true,
  "percentageFields": ["Avg%", "Rate%"],
  "integerFields": ["Qty", "Count"]
}
```
</details>

---

### 🔹 `parseSpecAndOptions(input: string, delimiter = ';'): { xmlSummaryStr, formatingOpts }`

Parses a combined string of summary + formatting into separate config objects.

- **`input`**: `"entry,1,*:Summary,total:Label:1;rd=2"`  
- **`delimiter`**: Optional separator (default: `;`)  
- **Returns**: `{ xmlSummaryStr: IXmlSummary, formatingOpts: IXmlSummaryFormatOptions }`  
- **Throws**: Error if either part is missing

<details>
<summary>Basic usage</summary>

#### 🔹 Code
```ts
import { parseSpecAndOptions } from "nrc-phoenix-xml"

const input = "Item,2,Dept:Totals,Price:Price:1,Qty:Total Qty:3;rd=2,cu=USD,sc=1,as=1"

const { xmlSummaryStr, formatingOpts } = parseSpecAndOptions(input)

console.log({ xmlSummaryStr, formatingOpts })
```

#### 🔹 Output
```Json
{
  "xmlSummaryStr": {
    "targetNode": "Item",
    "orientation": 2,
    "groupingField": "Dept",
    "groupingDisplayName": "Totals",
    "fields": [
      { "name": "Price", "displayName": "Price", "measure": 1 },
      { "name": "Qty", "displayName": "Total Qty", "measure": 3 }
    ]
  },
  "formatingOpts": {
    "roundDecimals": 2,
    "currency": "USD",
    "showCurrencySymbol": true,
    "asJson": true
  }
}
```
</details>

---

### 🔹 `getSummaryFromXml(xml: string, spec: IXmlSummary, debug?: boolean, format?: IXmlSummaryFormatOptions): SummaryDictionary | string`

Generates an aggregated summary from raw XML, given a structured spec.

- **`xml`**: Raw XML string  
- **`spec`**: Parsed summary definition  
- **`debug`**: Optional diagnostic output  
- **`format`**: Formatting preferences  
- **Returns**: Object or JSON string based on `asJson` flag

<details>
<summary>Basic Usage</summary>

#### 🔹 Code
```ts
import { XmlSummarizer, parseXmlSummary, parseFormatOptions } from "nrc-phoenix-xml"

const xml = `<items>
  <item><category>A</category><price>10.5</price><qty>2</qty></item>
  <item><category>A</category><price>5.0</price><qty>1</qty></item>
  <item><category>B</category><price>12.0</price><qty>3</qty></item>
</items>`

const summarySpec = parseXmlSummary("item,1,category:Category,price:Total Price:1,qty:Count:3")
const formatOptions = parseFormatOptions("rd=2,cu=USD,sc=1,as=1")

const result = XmlSummarizer.getSummaryFromXml(xml, summarySpec, false, formatOptions)

console.log(result)
```

#### 🔹 Output
```Json
{
  "Category": {
    "A": [
      { "name": "Total Price", "value": "$15.50" },
      { "name": "Count", "value": 3 }
    ],
    "B": [
      { "name": "Total Price", "value": "$12.00" },
      { "name": "Count", "value": 3 }
    ]
  }
}
```
</details>

---


### 🔹 `processXmlSummary(xml: string, summaryStr: string, debug?: boolean, format?: IXmlSummaryFormatOptions): SummaryDictionary | string`

Simplified method that parses and summarizes XML data in one step.

- **`xml`**: XML string  
- **`summaryStr`**: Configuration string  
- **`debug`**: Show debug logs (optional)  
- **`format`**: Output options  
- **Returns**: Summary data grouped by field or JSON string

<details>
<summary>Basic Usage</summary>

#### 🔹 Code
```ts
import { XmlSummarizer } from "nrc-phoenix-xml"

const xmlData = `<sales>
  <entry><region>North</region><total>1250.50</total></entry>
  <entry><region>North</region><total>470.25</total></entry>
  <entry><region>South</region><total>815.75</total></entry>
</sales>`

const summaryStr = "entry,1,region:Region,total:Total Sales:1"
const format = {
  roundDecimals: 2,
  currency: "USD",
  showCurrencySymbol: true,
  asJson: true,
  sortResults: true
}

const result = XmlSummarizer.processXmlSummary(xmlData, summaryStr, false, format)

console.log(result)
```

#### 🔹 Output
```Json
{
  "Region": {
    "North": [
      { "name": "Total Sales", "value": "$1,720.75" }
    ],
    "South": [
      { "name": "Total Sales", "value": "$815.75" }
    ]
  }
}
```
</details>

---



## 📝 Summary String Format

The `summaryString` parameter follows a **comma-separated structure**, defining XML elements and their aggregation behavior.

### 📌 Format:
```plaintext
elementName,summaryOrientation,groupingField,groupingDisplayName,attribute1:Label1:aggregationType,attribute2:Label2:aggregationType
```
#### 🔹 Explanation
- **`elementName`** → Target parent XML element for summarization.  
- **`summaryOrientation`** → Reserved for future versions to define how summaries are organized (currently unused).  
- **`groupingField`** → Defines the field used for grouping. If `"*"`, there is **no grouping**.  
- **`groupingDisplayName`** → Specifies the key returned in the result, representing the `groupingField`. If `groupingField == "*"`, this acts as the general summary name.  
- **`attribute:Label:aggregationMeasure`** → Specifies attributes, labels, and aggregation methods.  



### 🔹 Example Summary String
```plaintext
transaction,1,portfolio_type:Portfolio type,acquisition_value:Acquisition value:1,market_value:Market value:1
```
- **`transaction`** → XML element being processed.
- **`1`** → summaryOrientation, reserved for future use.
- **`portfolio_type`** → Used for grouping (e.g., `"A"` and `"B"`).
- **`Portfolio type`** → The label returned in the result representing `portfolio_type`.
- **`acquisition_value`** → Summarized field representing acquisition value.
- **`Acquisition value`** → Label assigned to `acquisition_value` in the summary result.
- **`market_value`** → Summarized field representing market value.
- **`Market value`** → Label assigned to `market_value` in the summary result.

#### 🔹 Expected Output
```json
{
    "Portfolio type": {
        "A": [
            { "name": "Acquisition value", "value": "$1,000.75" },
            { "name": "Market value", "value": "$1,050.50" }
        ],
        "B": [
            { "name": "Acquisition value", "value": "$500.50" },
            { "name": "Market value", "value": "$520.80" }
        ]
    }
}
```



### 📊 Aggregation Measures

| **Code** | **Name**             | **Description**                                  |
|----------|----------------------|--------------------------------------------------|
| `1`      | Sum                  | Adds all values together                         |
| `2`      | Count                | Counts the number of occurrences                 |
| `3`      | Min                  | Finds the smallest value                         |
| `4`      | Max                  | Finds the largest value                          |
| `5`      | Average              | Calculates the mean of values                    |
| `6`      | Standard Deviation   | Measures how spread out the values are           |



### 🧩 Format Options Reference

| **Key** | **Option**              | **Type**     | **Description**                                             |
|--------:|-------------------------|--------------|-------------------------------------------------------------|
| `rd`    | `roundDecimals`         | `number`     | Decimal precision to round summarized values                |
| `cu`    | `currency`              | `string`     | ISO currency code (e.g., `USD`, `EUR`)                      |
| `sc`    | `showCurrencySymbol`    | `boolean`    | Show currency symbol (`1 = true`, `0 = false`)              |
| `as`    | `asJson`                | `boolean`    | Output as JSON (`1 = true`) or string                       |
| `tm`    | `treatMissingAsZero`    | `boolean`    | Handle empty fields as zero when aggregating                |
| `sr`    | `sortResults`           | `boolean`    | Sort summary output by display name                         |
| `pf`    | `percentageFields`      | `string[]`   | List of fields treated as percentages (pipe-separated)      |
| `if`    | `integerFields`         | `string[]`   | List of fields treated as whole numbers (pipe-separated)    |



## 🛠 Tools & Scripts

The `tools/` directory contains handy shell scripts that simplify common tasks such as initializing the repo, generating documentation, and deploying updates to GitHub Pages.

### 🔹 `deploy-docs.sh`

Generates and deploys the API documentation to the `gh-pages` branch.

```Sh
./tools/deploy-docs.sh
```
- Uses `typedoc` and `typedoc.json` config  
- Automatically switches branches and pushes updates  
- Safe for manual and CI/CD usage

### 🔹 `commit-and-deploy.sh`
Commits staged changes and redeploys documentation in one command.
```Sh
./tools/commit-and-deploy.sh "Update docs and push latest changes"
```
- Stages and commits current updates
- Calls deploy-docs.sh afterward
- Useful for quick publishing cycles

### 🔹 `init-repo.sh`
```Sh
./tools/init-repo.sh
```

### 🧰 Usage Tips
```Sh
chmod +x ./tools/*.sh
```
Then you can run them directly, or include them in your package.json:
```Json
"scripts": {
  "docs": "typedoc",
  "docs:deploy": "./tools/deploy-docs.sh",
  "init": "./tools/init-repo.sh"
}
```
💡 Keep these scripts modular and version-controlled to support reproducible builds and deployments.



## 📦 Tests

Unit and functional tests are located in the `tests/` directory to ensure correctness, scalability, and resilience of core features.

### 🧪 Running All Tests

```bash
npm run test
```
For watch mode during development:
```Bash
npx jest --watch
```
### ▶️ Run Specific Test File
```Bash
npx jest tests/XmlSummarizer.test.ts
```

### 📂 Structure

```text
tests/
├── XmlSummarizer.test.ts         # Tests for summary computation logic  
├── parseXmlSummary.test.ts       # Tests for summary string parsing  
├── parseFormatOptions.test.ts    # Tests for format configuration parsing  
├── parseSpecAndOptions.test.ts   # Tests for combined parsing  
```
Each test uses Jest and follows the .test.ts naming convention for discoverability.

### 📊 Optional: Code Coverage
```Sh
npx jest --coverage
```
Reports will appear in the coverage/ folder.

#### 💡 Tip: Grouping-related tests can live under tests/groups/, while shared mocks can go in tests/utils/.


## 🏗️ Contribution Guidelines

### 🔹 How to Contribute
We welcome contributions to improve **nrc-phoenix-xml**! To contribute:

1. **Fork the repository**:
   ```sh
   git clone https://github.com/nelsonrc/nrc-phoenix-xml.git
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Create a feature branch**:
   ```sh
   git checkout -b feature/new-functionality
   ```

4. **Submit a Pull Request 🚀**


## 📜 License

This project is licensed under the MIT License. See LICENSE for details.


## 📞 Support & Issues

For issues or support, visit GitHub Issues.

