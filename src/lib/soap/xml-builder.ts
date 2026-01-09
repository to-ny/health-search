/**
 * XML builder for SAM v2 SOAP requests
 */

const SOAP_ENVELOPE = 'http://schemas.xmlsoap.org/soap/envelope/';
const DICS_NS = 'urn:be:fgov:ehealth:dics:protocol:v5';

export interface SoapRequestOptions {
  operation: string;
  namespace?: string;
  searchDate?: string;
  body: string; // Pre-built XML body content
}

/**
 * Escapes special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Gets current ISO timestamp for IssueInstant attribute
 */
function getIssueInstant(): string {
  return new Date().toISOString();
}

/**
 * Builds a SOAP envelope for SAM v2 API requests
 */
export function buildSoapRequest(options: SoapRequestOptions): string {
  const {
    operation,
    namespace = DICS_NS,
    searchDate,
    body,
  } = options;

  const searchDateAttr = searchDate ? ` SearchDate="${searchDate}"` : '';
  const issueInstant = getIssueInstant();

  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="${SOAP_ENVELOPE}" xmlns:ns="${namespace}">
  <soap:Header/>
  <soap:Body>
    <ns:${operation}Request IssueInstant="${issueInstant}"${searchDateAttr}>
${body}
    </ns:${operation}Request>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Builds a FindAmp SOAP request
 */
export function buildFindAmpRequest(params: {
  anyNamePart?: string;
  cnk?: string;
  ampCode?: string;
  ingredient?: string;
  vmpCode?: string;
  companyActorNr?: string;
  language?: string;
  searchDate?: string;
}): string {
  let body = '';

  if (params.anyNamePart) {
    body = `      <FindByProduct>
        <AnyNamePart>${escapeXml(params.anyNamePart)}</AnyNamePart>
      </FindByProduct>`;
  } else if (params.cnk) {
    // FindByDmpp: DeliveryEnvironment, Code, CodeType (order matters per XSD)
    body = `      <FindByDmpp>
        <DeliveryEnvironment>P</DeliveryEnvironment>
        <Code>${escapeXml(params.cnk)}</Code>
        <CodeType>CNK</CodeType>
      </FindByDmpp>`;
  } else if (params.ampCode) {
    body = `      <FindByProduct>
        <AmpCode>${escapeXml(params.ampCode)}</AmpCode>
      </FindByProduct>`;
  } else if (params.ingredient) {
    // FindByIngredient uses SubstanceName, not AnyNamePart
    body = `      <FindByIngredient>
        <SubstanceName>${escapeXml(params.ingredient)}</SubstanceName>
      </FindByIngredient>`;
  } else if (params.vmpCode) {
    // VmpCode is an integer in the schema
    body = `      <FindByVirtualProduct>
        <VmpCode>${escapeXml(params.vmpCode)}</VmpCode>
      </FindByVirtualProduct>`;
  } else if (params.companyActorNr) {
    body = `      <FindByCompany>
        <CompanyActorNr>${escapeXml(params.companyActorNr)}</CompanyActorNr>
      </FindByCompany>`;
  }

  return buildSoapRequest({
    operation: 'FindAmp',
    searchDate: params.searchDate,
    body,
  });
}

/**
 * Builds a FindVmp SOAP request
 */
export function buildFindVmpRequest(params: {
  anyNamePart?: string;
  vmpCode?: string;
  ingredient?: string;
  vtmCode?: string;
  language?: string;
  searchDate?: string;
}): string {
  let body = '';

  if (params.anyNamePart) {
    body = `      <FindByProduct>
        <AnyNamePart>${escapeXml(params.anyNamePart)}</AnyNamePart>
      </FindByProduct>`;
  } else if (params.vmpCode) {
    // VmpCode is an integer in the schema
    body = `      <FindByProduct>
        <VmpCode>${escapeXml(params.vmpCode)}</VmpCode>
      </FindByProduct>`;
  } else if (params.vtmCode) {
    // FindByTherapeuticMoiety uses TherapeuticMoietyCode (int) or TherapeuticMoietyName (string)
    // Assuming vtmCode is a numeric code
    body = `      <FindByTherapeuticMoiety>
        <TherapeuticMoietyCode>${escapeXml(params.vtmCode)}</TherapeuticMoietyCode>
      </FindByTherapeuticMoiety>`;
  } else if (params.ingredient) {
    // FindByIngredient uses SubstanceName
    body = `      <FindByIngredient>
        <SubstanceName>${escapeXml(params.ingredient)}</SubstanceName>
      </FindByIngredient>`;
  }

  return buildSoapRequest({
    operation: 'FindVmp',
    searchDate: params.searchDate,
    body,
  });
}

/**
 * Builds a FindReimbursement SOAP request
 */
export function buildFindReimbursementRequest(params: {
  cnk?: string;
  amppCode?: string;
  language?: string;
  searchDate?: string;
}): string {
  let body = '';

  if (params.cnk) {
    // FindByDmpp: DeliveryEnvironment, Code, CodeType (order matters per XSD)
    body = `      <FindByDmpp>
        <DeliveryEnvironment>P</DeliveryEnvironment>
        <Code>${escapeXml(params.cnk)}</Code>
        <CodeType>CNK</CodeType>
      </FindByDmpp>`;
  } else if (params.amppCode) {
    // FindByPackage uses CtiExtendedCode for AMPP
    body = `      <FindByPackage>
        <CtiExtendedCode>${escapeXml(params.amppCode)}</CtiExtendedCode>
      </FindByPackage>`;
  }

  return buildSoapRequest({
    operation: 'FindReimbursement',
    searchDate: params.searchDate,
    body,
  });
}

/**
 * Builds a FindCompany SOAP request
 * Note: FindCompany is part of DICS service, elements are direct children (no wrapper)
 */
export function buildFindCompanyRequest(params: {
  companyActorNr?: string;
  anyNamePart?: string;
  vatNr?: string;
  language?: string;
}): string {
  let body = '';

  // FindCompanyRequestType has direct choice elements (not wrapped in FindBy*)
  if (params.companyActorNr) {
    body = `      <CompanyActorNr>${escapeXml(params.companyActorNr)}</CompanyActorNr>`;
  } else if (params.anyNamePart) {
    body = `      <AnyNamePart>${escapeXml(params.anyNamePart)}</AnyNamePart>`;
  } else if (params.vatNr) {
    // VatNr needs CountryCode attribute (capital C) - extract from format like BE0403053608
    const countryCode = params.vatNr.substring(0, 2);
    const vatNumber = params.vatNr.substring(2);
    body = `      <VatNr CountryCode="${escapeXml(countryCode)}">${escapeXml(vatNumber)}</VatNr>`;
  }

  return buildSoapRequest({
    operation: 'FindCompany',
    body,
  });
}

/**
 * Builds a FindCommentedClassification (ATC) SOAP request
 */
export function buildFindAtcRequest(params: {
  atcCode?: string;
  anyNamePart?: string;
  language?: string;
}): string {
  let body = '';

  if (params.atcCode) {
    body = `      <FindByCommentedClassification>
        <CommentedClassificationCode>${escapeXml(params.atcCode)}</CommentedClassificationCode>
      </FindByCommentedClassification>`;
  } else if (params.anyNamePart) {
    body = `      <FindByCommentedClassification>
        <AnyNamePart>${escapeXml(params.anyNamePart)}</AnyNamePart>
      </FindByCommentedClassification>`;
  }

  return buildSoapRequest({
    operation: 'FindCommentedClassification',
    body,
  });
}
