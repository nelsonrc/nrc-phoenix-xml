# nrc.phoenix.xml
**Advanced XML Utilities for TypeScript**  
A powerful and modular library for parsing, validating, and summarizing XML data.


## 🚀 Features
- **XML Parsing & Validation** with XSD support
- **Data Summarization** with configurable aggregation methods
- **Modular and Scalable Architecture**
- **Localization Support** (e.g., currency & percentage formatting)
- **Built-in Error Handling and Debugging**


## 📦 Installation
Install via **npm**:
```sh
npm install nrc-phoenix-xml
```


## 🛠️ Basic Usage Example

### 🔹 Extracting XML Summary
```typescript
import { XmlSummarizer } from "nrc-phoenix-xml";

const xmlData = `<transactions>
    <transaction>
        <amount>1000.75</amount>
        <tax>50.25</tax>
    </transaction>
    <transaction>
        <amount>500.50</amount>
        <tax>25.80</tax>
    </transaction>
</transactions>`;

const summaryString = "transaction,1,*:Global Summary,amount:Total Amount:1,tax:Total Tax:1";

const result = XmlSummaryUtils.processXmlSummary(xmlData, summaryString, false, {
    roundDecimals: 2,
    currency: "USD",
    showCurrencySymbol: true,
    sortResults: true,
    asJson: true
});

console.log(result);
```

### 🔹 Expected Output:
```Json
{
    "Global Summary": [
        { "name": "Total Amount", "value": "$1,501.25" },
        { "name": "Total Tax", "value": "$76.05" }
    ]
}
```


## 🔹 API Reference

### XmlSummaryUtils

#### `parseXmlSummary(summaryString: string): IXmlSummary`
Parses a summary configuration string into structured specifications.

#### `getSummaryFromXml(xmlFile: string, summarySpecs: IXmlSummary, debug?: boolean, formatOptions?: object): Dictionary<string, any> | string`
Extracts and aggregates data from XML based on summary specifications.

#### `processXmlSummary(xmlFile: string, summaryString: string, debug?: boolean, formatOptions?: object): Dictionary<string, any> | string`
Shortcut method that combines `parseXmlSummary` and `getSummaryFromXml`.

## 📝 Summary String Format

The `summaryString` parameter follows a **comma-separated structure**, defining XML elements and their aggregation behavior.

### 📌 Format:
```plaintext
elementName,summaryOrientation,groupingField,groupingDisplayName,attribute1:Label1:aggregationType,attribute2:Label2:aggregationType
```
### 🔹 Explanation
- **`elementName`** → Target parent XML element for summarization.  
- **`summaryOrientation`** → Reserved for future versions to define how summaries are organized (currently unused).  
- **`groupingField`** → Defines the field used for grouping. If `"*"`, there is **no grouping**.  
- **`groupingDisplayName`** → Specifies the key returned in the result, representing the `groupingField`. If `groupingField == "*"`, this acts as the general summary name.  
- **`attribute:Label:aggregationType`** → Specifies attributes, labels, and aggregation methods.  

### 📌 Supported Aggregation Types
- `sum(1)` → Adds values together.  
- `avg(2)` → Calculates the average.  
- `count(3)` → Counts occurrences.  
- `min(4)` → Finds the minimum value.  
- `max(5)` → Finds the maximum value.  
- `StandardDeviation(6)` → Calculates the standard derivation.  

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

### 🔹 Expected Output
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

