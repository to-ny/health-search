# SAM v2 SOAP API Reference

Reference documentation for the Belgian SAM v2 medication database SOAP API, as implemented in this application.

**Last updated:** January 2026
**API version:** DICS Protocol v5
**Maintained by:** FAMHP (Federal Agency for Medicines and Health Products) via eHealth Belgium

---

## Getting Started

The SAM v2 API is a public SOAP service with no authentication required. There are no known rate limits, but reasonable use is expected.

- **Service catalog:** https://www.vas.ehealth.fgov.be/samv2/
- **Primary endpoint:** https://apps.samdb.ehealth.fgov.be/samv2/dics/v5
- **WSDL:** https://apps.samdb.ehealth.fgov.be/samv2/dics/v5?wsdl

For issues with the API itself, contact eHealth Belgium: https://www.ehealth.fgov.be/

**Note on examples:** XML samples in this document are representative structures based on actual API responses. Optional fields may be omitted for brevity.

---

## Glossary

- **ATC** - Anatomical Therapeutic Chemical classification (WHO standard)
- **BCFI** - Belgian Center for Pharmacotherapeutic Information (Belgian classification system used by SAM)
- **BlackTriangle** - Indicates a medication under additional monitoring for safety (new or limited data)
- **Cheap/Cheapest** - Flags indicating whether a medication qualifies for preferential pricing rules
- **Chapter IV** - Restricted medications requiring prior authorization from health insurers
- **CNK** - Belgian national pharmacy code (Code National/Kode Nationaal), printed on packaging
- **DMPP** - Delivery Mode Pricing and Packaging (links CNK codes to packages)
- **FAMHP** - Federal Agency for Medicines and Health Products (Belgian regulator)
- **Magistral** - Compounded/prepared medications made by pharmacists
- **Orphan** - Medication for rare diseases with special regulatory status
- **Regimen** - Patient status for reimbursement: REGULAR (standard) or PREFERENTIAL (reduced copay for qualifying patients)
- **SmPC** - Summary of Product Characteristics (official product documentation)

---

## Data Model

### Medication Hierarchy

From abstract to concrete:

- **VTM** (Virtual Therapeutic Moiety) - Active substance (e.g., "Paracetamol")
  - **VMP** (Virtual Medicinal Product) - Generic definition: VTM + strength + form (e.g., "Paracetamol 500mg tablet")
    - **AMP** (Actual Medicinal Product) - Branded product from a company (e.g., "Dafalgan 500mg tablet")
      - **AMPP** (Actual Medicinal Product Package) - Package presentation with CNK code (e.g., "Dafalgan 500mg x30 tablets")

### Key Identifiers

- **CNK** (7 digits) - Belgian pharmacy code on packaging, identifies an AMPP
- **AMP Code** (SAM######-##) - SAM database identifier for branded products
- **VMP Code** (integer) - Generic product identifier
- **VTM Code** (integer) - Active substance identifier
- **CtiExtended** (string) - Package identifier for AMPP
- **Actor Nr** (5 digits, zero-padded) - Pharmaceutical company identifier

---

## Implemented Operations

All operations use the DICS v5 endpoint documented in Getting Started.

---

### FindAmp

Search for branded medications (AMP).

**Search Methods:**

- **FindByProduct**
  - `AnyNamePart` - Search by name substring
  - `AmpCode` - Search by AMP code
- **FindByDmpp** - Search by CNK code (requires `DeliveryEnvironment` + `Code` + `CodeType`)
- **FindByIngredient** - Search by active ingredient using `SubstanceName`
- **FindByVirtualProduct** - Find all brands of a generic using `VmpCode`
- **FindByCompany** - Find products by company using `CompanyActorNr`

**Example Request (by name):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="urn:be:fgov:ehealth:dics:protocol:v5">
  <soap:Header/>
  <soap:Body>
    <ns:FindAmpRequest IssueInstant="2025-01-11T10:00:00.000Z">
      <FindByProduct>
        <AnyNamePart>dafalgan</AnyNamePart>
      </FindByProduct>
    </ns:FindAmpRequest>
  </soap:Body>
</soap:Envelope>
```

**Example Request (by CNK):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="urn:be:fgov:ehealth:dics:protocol:v5">
  <soap:Header/>
  <soap:Body>
    <ns:FindAmpRequest IssueInstant="2025-01-11T10:00:00.000Z">
      <FindByDmpp>
        <DeliveryEnvironment>P</DeliveryEnvironment>
        <Code>0012345</Code>
        <CodeType>CNK</CodeType>
      </FindByDmpp>
    </ns:FindAmpRequest>
  </soap:Body>
</soap:Envelope>
```

**Response Structure:**

```xml
<FindAmpResponse SearchDate="2025-01-11" SamId="...">
  <Amp Code="SAM000691-00" VmpCode="26231">
    <Name xml:lang="nl">Dafalgan</Name>
    <Name xml:lang="fr">Dafalgan</Name>
    <OfficialName>DAFALGAN</OfficialName>
    <CompanyActorNr>01995</CompanyActorNr>
    <BlackTriangle>false</BlackTriangle>
    <MedicineType>ALLOPATHIC</MedicineType>
    <AmpComponent SequenceNr="1" VmpComponentCode="26231">
      <PharmaceuticalForm Code="10219000">
        <Name xml:lang="nl">Tablet</Name>
      </PharmaceuticalForm>
      <RouteOfAdministration Code="20053000">
        <Name xml:lang="nl">Oraal gebruik</Name>
      </RouteOfAdministration>
      <RealActualIngredient Rank="1">
        <Type>ACTIVE_SUBSTANCE</Type>
        <Substance Code="387517004">
          <Name xml:lang="en">Paracetamol</Name>
        </Substance>
        <StrengthDescription>500 mg</StrengthDescription>
      </RealActualIngredient>
    </AmpComponent>
    <Ampp CtiExtended="000691-01">
      <PrescriptionName xml:lang="nl">Dafalgan 500 mg tabl. 30</PrescriptionName>
      <PackDisplayValue>30 tabletten</PackDisplayValue>
      <Status>AUTHORIZED</Status>
      <ExFactoryPrice>3.50</ExFactoryPrice>
      <LeafletUrl xml:lang="nl">https://...</LeafletUrl>
      <SpcUrl xml:lang="nl">https://...</SpcUrl>
      <Atc Code="N02BE01"/>
      <Dmpp DeliveryEnvironment="P" Code="0012345" CodeType="CNK">
        <Price>4.20</Price>
        <Reimbursable>false</Reimbursable>
        <Cheap>false</Cheap>
        <Cheapest>false</Cheapest>
      </Dmpp>
    </Ampp>
  </Amp>
</FindAmpResponse>
```

---

### FindVmp

Search for generic medications (VMP).

**Search Methods:**

- **FindByProduct**
  - `AnyNamePart` - Search by name substring
  - `VmpCode` - Search by VMP code
- **FindByTherapeuticMoiety** - Search by VTM using `TherapeuticMoietyCode`
- **FindByIngredient** - Search by active ingredient using `SubstanceName`

**Example Request:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="urn:be:fgov:ehealth:dics:protocol:v5">
  <soap:Header/>
  <soap:Body>
    <ns:FindVmpRequest IssueInstant="2025-01-11T10:00:00.000Z">
      <FindByProduct>
        <AnyNamePart>paracetamol</AnyNamePart>
      </FindByProduct>
    </ns:FindVmpRequest>
  </soap:Body>
</soap:Envelope>
```

**Response Structure:**

```xml
<FindVmpResponse SearchDate="2025-01-11" SamId="...">
  <Vmp Code="26231">
    <Name xml:lang="nl">Paracetamol oral 500 mg</Name>
    <AbbreviatedName xml:lang="nl">Paracetamol 500mg</AbbreviatedName>
    <Vtm Code="387517004">
      <Name xml:lang="en">Paracetamol</Name>
    </Vtm>
    <VmpGroup Code="...">
      <Name xml:lang="nl">...</Name>
    </VmpGroup>
    <VmpComponent SequenceNr="1" PharmaceuticalFormCode="10219000">
      <VirtualIngredient Rank="1">
        <Type>ACTIVE_SUBSTANCE</Type>
        <Substance Code="387517004">
          <Name xml:lang="en">Paracetamol</Name>
        </Substance>
        <StrengthRange>500 mg</StrengthRange>
      </VirtualIngredient>
    </VmpComponent>
  </Vmp>
</FindVmpResponse>
```

---

### FindReimbursement

Get reimbursement information for a medication package.

**Search Methods:**

- **FindByDmpp** - Search by CNK code (requires `DeliveryEnvironment` + `Code` + `CodeType`)
- **FindByPackage** - Search by AMPP using `CtiExtendedCode`

**Special Handling:** When no reimbursement exists, the API returns a SOAP Fault with code `1008`. This should be treated as an empty result, not an error.

**Example Request:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="urn:be:fgov:ehealth:dics:protocol:v5">
  <soap:Header/>
  <soap:Body>
    <ns:FindReimbursementRequest IssueInstant="2025-01-11T10:00:00.000Z">
      <FindByDmpp>
        <DeliveryEnvironment>P</DeliveryEnvironment>
        <Code>0012345</Code>
        <CodeType>CNK</CodeType>
      </FindByDmpp>
    </ns:FindReimbursementRequest>
  </soap:Body>
</soap:Envelope>
```

**Response Structure:**

```xml
<FindReimbursementResponse SearchDate="2025-01-11" SamId="...">
  <ReimbursementContexts DeliveryEnvironment="P" Code="0012345" CodeType="CNK"
      LegalReferencePath="RD20180201-II-70000" StartDate="2025-01-01">
    <ReimbursementCriterion Category="B" Code="255"/>
    <Copayment RegimeType="1" StartDate="2025-01-01">
      <FeeAmount>1.00</FeeAmount>
    </Copayment>
    <Copayment RegimeType="2" StartDate="2025-01-01">
      <FeeAmount>2.50</FeeAmount>
    </Copayment>
    <ReferenceBasePrice>10.50</ReferenceBasePrice>
    <ReimbursementBasePrice>10.50</ReimbursementBasePrice>
  </ReimbursementContexts>
</FindReimbursementResponse>
```

**Key Response Fields:**

- `ReimbursementContexts` - Note: plural element name
- `LegalReferencePath` - Links to Chapter IV paragraph details. Format: `RD{date}-{chapter}-{paragraph}`
  - Chapter IV medications have `-IV-` in the path (e.g., `RD20180201-IV-8870000`)
  - Other chapters: `-I-`, `-II-`, `-III-` etc.
- `ReimbursementCriterion` - Attributes: `Category` (A/B/C/Cx/Cs) and `Code` (numeric)
- `Copayment` - Attribute `RegimeType`: 1=Preferential, 2=Regular

---

### FindCompany

Search for pharmaceutical companies.

**Search Methods (direct child elements, not wrapped in FindBy*):**

- `CompanyActorNr` - Search by 5-digit actor number
- `AnyNamePart` - Search by name substring
- `VatNr` - Search by VAT number (requires `CountryCode` attribute)

**Example Request:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="urn:be:fgov:ehealth:dics:protocol:v5">
  <soap:Header/>
  <soap:Body>
    <ns:FindCompanyRequest IssueInstant="2025-01-11T10:00:00.000Z">
      <AnyNamePart>pfizer</AnyNamePart>
    </ns:FindCompanyRequest>
  </soap:Body>
</soap:Envelope>
```

**Response Structure:**

```xml
<FindCompanyResponse SearchDate="2025-01-11" SamId="...">
  <Company ActorNr="01995">
    <VatNr CountryCode="BE">0403053608</VatNr>
    <Denomination>PFIZER SA</Denomination>
    <LegalForm>SA</LegalForm>
    <StreetName>Boulevard de la Plaine</StreetName>
    <StreetNum>17</StreetNum>
    <Postcode>1050</Postcode>
    <City>BRUXELLES</City>
    <CountryCode>BE</CountryCode>
    <Phone>+32 2 554 62 11</Phone>
    <Language>FR</Language>
  </Company>
</FindCompanyResponse>
```

---

### FindChapterIVParagraph

Get Chapter IV (prior authorization) paragraph details for restricted medications.

**Endpoint:** DICS v5 (same as other operations)

**Search Methods:**

- **FindByDmpp** - Search by CNK code (requires `DeliveryEnvironment` + `Code` + `CodeType`)
- **FindByParagraphName** - Search by chapter and paragraph name (`ChapterName` + `ParagraphName`)
- **FindByLegalReferencePath** - Search by legal reference path string

**Special Handling:** When no Chapter IV paragraph exists for the medication, the API returns a SOAP Fault with code `1016`. This should be treated as an empty result, not an error.

**Example Request (by CNK):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="urn:be:fgov:ehealth:dics:protocol:v5">
  <soap:Header/>
  <soap:Body>
    <ns:FindChapterIVParagraphRequest IssueInstant="2025-01-11T10:00:00.000Z">
      <FindByDmpp>
        <DeliveryEnvironment>P</DeliveryEnvironment>
        <Code>3621109</Code>
        <CodeType>CNK</CodeType>
      </FindByDmpp>
    </ns:FindChapterIVParagraphRequest>
  </soap:Body>
</soap:Envelope>
```

**Response Structure:**

```xml
<FindChapterIVParagraphResponse SearchDate="2025-01-11" SamId="...">
  <Paragraph ChapterName="IV" ParagraphName="10680000" StartDate="2025-01-01">
    <LegalReferencePath>RD20180201-IV-10680000</LegalReferencePath>
    <CreatedTimestamp>2024-12-20T18:05:25.071+01:00</CreatedTimestamp>
    <KeyString>
      <Text xml:lang="fr">Le traitement de la rectocolite...</Text>
      <Text xml:lang="nl">Behandeling van ernstige colitis ulcerosa...</Text>
    </KeyString>
    <AgreementType>E</AgreementType>
    <PublicationDate>2024-12-31</PublicationDate>
    <ModificationDate>2025-01-01</ModificationDate>
    <ParagraphVersion>44</ParagraphVersion>
    <ModificationStatus>E</ModificationStatus>
    <Exclusion ExclusionType="J" IdentifierNum="11070200" StartDate="2021-12-01">
      <!-- Excluded paragraph references -->
    </Exclusion>
    <Verse VerseSeq="1" StartDate="2025-01-01">
      <VerseNum>103264</VerseNum>
      <VerseSeqParent>0</VerseSeqParent>
      <VerseLevel>1</VerseLevel>
      <CheckBoxInd>false</CheckBoxInd>
      <Text>
        <Text xml:lang="fr">Paragraphe 10680000</Text>
        <Text xml:lang="nl">Paragraaf 10680000</Text>
      </Text>
      <RequestType>N</RequestType>
      <AgreementTerm>
        <Quantity>12</Quantity>
        <Unit>M</Unit>
      </AgreementTerm>
      <ModificationStatus>E</ModificationStatus>
    </Verse>
  </Paragraph>
</FindChapterIVParagraphResponse>
```

**Key Response Fields:**

- `ChapterName` / `ParagraphName` - Identifies the specific paragraph (e.g., "IV" / "10680000")
- `LegalReferencePath` - Unique identifier linking to reimbursement contexts
- `KeyString` - Summary of the indication/condition (multilingual)
- `AgreementType` - Authorization model (E=Electronic, etc.)
- `Verse` - Structured legislation text with hierarchy:
  - `VerseLevel` - Depth in hierarchy (1=top level)
  - `VerseSeqParent` - Parent verse for building tree structure
  - `Text` - The actual requirement text (multilingual)
  - `RequestType` - N=New request, P=Prolongation, null=both
  - `AgreementTerm` - Validity period (Quantity + Unit: D/W/M/Y)

---

### FindCommentedClassification

Search for BCFI therapeutic classifications.

**Important:** The SAM API uses the BCFI (Belgian Center for Pharmacotherapeutic Information) classification system with numeric codes (e.g., "18" for Cardiovascular), not the WHO ATC codes (e.g., "C" for Cardiovascular).

**Search Methods:**

- `CommentedClassificationCode` - Search by BCFI code
- `AnyNamePart` - Search by name/title

**Response Note:** The API returns nested classifications which should be flattened into a single array for easier processing.

**Example Request:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="urn:be:fgov:ehealth:dics:protocol:v5">
  <soap:Header/>
  <soap:Body>
    <ns:FindCommentedClassificationRequest IssueInstant="2025-01-11T10:00:00.000Z">
      <FindByCommentedClassification>
        <AnyNamePart>cardiovascular</AnyNamePart>
      </FindByCommentedClassification>
    </ns:FindCommentedClassificationRequest>
  </soap:Body>
</soap:Envelope>
```

**Response Structure:**

```xml
<FindCommentedClassificationResponse SearchDate="2025-01-11" SamId="...">
  <CommentedClassification Code="18">
    <Title xml:lang="en">Cardiovascular system</Title>
    <Content xml:lang="en">...</Content>
    <Url xml:lang="en">https://...</Url>
    <CommentedClassification Code="18.1">
      <Title xml:lang="en">Cardiac glycosides</Title>
      <!-- nested children -->
    </CommentedClassification>
  </CommentedClassification>
</FindCommentedClassificationResponse>
```

---

## Unexplored Endpoints

The following endpoints are listed in the SAM service catalog but have not been explored or implemented:

- **consult/compounding** (https://apps.samdb.ehealth.fgov.be/samv2/consult/compounding) - Magistral preparations
- **consult/ref** (https://apps.samdb.ehealth.fgov.be/samv2/consult/ref) - Reference data
- **consult/nonmedicinal** (https://apps.samdb.ehealth.fgov.be/samv2/consult/nonmedicinal) - Non-medicinal products
- **dics/legacy** (https://apps.samdb.ehealth.fgov.be/samv2/dics/legacy) - CIVICS / Chapter IV restrictions

### Unimplemented Operations

- **FindAmpp** - Search packages directly (workaround: use FindAmp)
- **FindVtm** - Search active substances (workaround: use FindVmp, which includes VTM info)
- **FindIngredient** - Search ingredients (workaround: use FindAmp/FindVmp with ingredient parameter)
- **FindFormula** - Magistral preparations (requires compounding endpoint)

---

## Error Handling

### SOAP Fault Structure

```xml
<soap:Fault>
  <faultcode>soap:Server</faultcode>
  <faultstring>Business error</faultstring>
  <detail>
    <ns2:BusinessError>
      <Code>1008</Code>
      <Message>No results found</Message>
    </ns2:BusinessError>
  </detail>
</soap:Fault>
```

### Known Error Codes

- **1008** - No results found. Treat as empty result set, not an error.
- **1012** - No classification found. Treat as empty result set, not an error.
- **1016** - No Chapter IV paragraph found. Treat as empty result set, not an error.

### Retry Logic

Recommended: automatic retry with exponential backoff (timeout 30s, 3 retries).

---

## Language Support

### Multilingual Fields

Most text fields support four languages: `en`, `nl`, `fr`, `de`

**Note:** Language availability varies by data - not all languages are present for every field. The UI should handle missing translations gracefully.

```xml
<Name xml:lang="nl">Nederlandse naam</Name>
<Name xml:lang="fr">Nom français</Name>
<Name xml:lang="en">English name</Name>
<Name xml:lang="de">Deutscher Name</Name>
```

### Language Extraction Priority

1. Requested language
2. English (fallback)
3. First available

---

## Implementation Notes

### Element Order in XSD

The SAM XSD enforces strict element ordering. For `FindByDmpp`, elements must appear in this order:
1. `DeliveryEnvironment`
2. `Code`
3. `CodeType`

### Company Actor Number Format

Actor numbers must be zero-padded to 5 digits (e.g., "1995" becomes "01995").

### Date Formats

- **SearchDate attribute:** YYYY-MM-DD
- **IssueInstant attribute:** ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **StartDate/EndDate:** YYYY-MM-DD

### DeliveryEnvironment Values

- **P** - Public pharmacy
- **H** - Hospital

---

## Custom Implementations

Features built in this application that extend beyond the SAM SOAP API.

### Excipient Database (Implemented)

The SAM SOAP API does not provide excipient (inactive ingredient) data. This application maintains a custom database built by parsing SmPC (Summary of Product Characteristics) PDF documents from FAMHP, obtained via the SpcUrl field in API responses.

### Allergen Detection (Implemented)

This application includes allergen matching that checks both active ingredients (from SAM API) and excipients (from the SmPC database) against known allergens.

**Detected allergens:**
- lactose, gluten, soy, peanut, tree nuts
- egg, shellfish, fish
- sulfite, tartrazine, aspartame
- benzalkonium, gelatin, paraben

Allergen matching includes aliases in English, French, Dutch, and German.

---

## Additional Resources

### SAM Database Export

A full SAM database export (XML format) is available from the SAM service for offline analysis or bulk processing. See the service catalog for download options.
