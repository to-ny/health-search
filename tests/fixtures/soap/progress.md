# SOAP Request Testing Progress

All SOAP requests have been tested and verified against the live SAM v2 API.

## Status Legend
- PASS: Request succeeded, fixture saved
- PASS (business error): Request format valid, no matching data

## FindAmp (DICS endpoint)

| Combination | Status | Fixture |
|-------------|--------|---------|
| anyNamePart | PASS | findamp-anyNamePart-response.xml |
| cnk | PASS | findamp-cnk-response.xml |
| ampCode | PASS | findamp-ampCode-response.xml |
| ingredient | PASS | findamp-ingredient-response.xml |
| vmpCode | PASS | findamp-vmpCode-response.xml |
| companyActorNr | PASS | findamp-company-response.xml |

## FindVmp (DICS endpoint)

| Combination | Status | Fixture |
|-------------|--------|---------|
| anyNamePart | PASS | findvmp-anyNamePart-response.xml |
| vmpCode | PASS | findvmp-vmpCode-response.xml |
| ingredient | PASS | findvmp-ingredient-response.xml |
| vtmCode | PASS | findvmp-vtmCode-response.xml |

## FindReimbursement (DICS endpoint)

| Combination | Status | Fixture |
|-------------|--------|---------|
| cnk | PASS (business error) | findreimbursement-cnk-response.xml |
| amppCode | PASS (business error) | findreimbursement-amppCode-response.xml |

Note: Reimbursement requests return "No reimbursements found" for the test data,
but the request format is validated as correct.

## FindCompany (DICS endpoint)

| Combination | Status | Fixture |
|-------------|--------|---------|
| companyActorNr | PASS | findcompany-actorNr-response.xml |
| anyNamePart | PASS | findcompany-anyNamePart-response.xml |
| vatNr | PASS | findcompany-vatNr-response.xml |

---

## Key Fixes Made to xml-builder.ts

1. **Namespace**: Changed from `urn:be:fgov:ehealth:samws:v2:dics:consultation` to `urn:be:fgov:ehealth:dics:protocol:v5`

2. **IssueInstant attribute**: Added required `IssueInstant` attribute with ISO timestamp

3. **Removed xml:lang**: This attribute is not allowed on request elements

4. **FindByDmpp element order**: Fixed to `DeliveryEnvironment`, `Code`, `CodeType` (order matters per XSD)

5. **FindByIngredient**: Uses `SubstanceName` not `AnyNamePart`

6. **FindCompany structure**: Elements are direct children of request (not wrapped in FindBy*)

7. **VatNr attribute**: Fixed to `CountryCode` (capital C)

---
Last updated: 2026-01-09
