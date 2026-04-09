/*
 * Copyright (C) 2014-2024 Authlete, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the
 * License.
 */

import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { AuthorizationDecisionParams } from '@vecrea/au3te-ts-common/schemas.authorization-decision';

/**
 * Type definition for a function that converts AuthorizationResponse to AuthorizationDecisionParams
 * @param {AuthorizationResponse} response - The authorization response
 * @returns {AuthorizationDecisionParams} The authorization decision parameters
 */
export type ResponseToDecisionParams = (
  response: AuthorizationResponse
) => AuthorizationDecisionParams;

/** OIDID Connect Core — scope values that request userinfo claims (§5.4). */
const SCOPE_TO_CLAIM_NAMES: Record<string, readonly string[]> = {
  profile: [
    'name',
    'family_name',
    'given_name',
    'middle_name',
    'nickname',
    'preferred_username',
    'profile',
    'picture',
    'website',
    'gender',
    'birthdate',
    'zoneinfo',
    'locale',
    'updated_at',
  ],
  email: ['email', 'email_verified'],
  phone: ['phone_number', 'phone_number_verified'],
  address: ['address'],
};

/**
 * Claim names listed under the `id_token` key of the OIDC `claims` request parameter.
 */
export function extractClaimNamesFromIdTokenClaimsJson(
  idTokenClaims: string | null | undefined
): string[] | undefined {
  if (idTokenClaims == null || idTokenClaims.trim() === '') {
    return undefined;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(idTokenClaims);
  } catch {
    return undefined;
  }
  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    return undefined;
  }
  const idToken = (parsed as Record<string, unknown>)['id_token'];
  if (
    idToken === null ||
    typeof idToken !== 'object' ||
    Array.isArray(idToken)
  ) {
    return undefined;
  }
  const names = Object.keys(idToken as Record<string, unknown>).filter(
    (k) => k.length > 0
  );
  return names.length > 0 ? names : undefined;
}

function claimNamesFromAuthleteScopes(
  scopes: AuthorizationResponse['scopes']
): string[] | undefined {
  if (!scopes?.length) {
    return undefined;
  }
  const out = new Set<string>();
  let requestedOpenId = false;
  for (const entry of scopes) {
    if (entry == null || typeof entry !== 'object') {
      continue;
    }
    const scopeName = 'name' in entry ? entry.name : undefined;
    if (typeof scopeName !== 'string' || scopeName === '') {
      continue;
    }
    if (scopeName === 'openid') {
      requestedOpenId = true;
    }
    const mapped = SCOPE_TO_CLAIM_NAMES[scopeName];
    if (mapped) {
      for (const c of mapped) {
        out.add(c);
      }
    }
  }
  if (requestedOpenId) {
    out.add('sub');
  }
  return out.size > 0 ? [...out] : undefined;
}

/**
 * Authlete sometimes omits `claims` / `idTokenClaims` on INTERACTION while still returning scopes.
 * Mirror OIDC scope→claims and the `claims` JSON parameter so /auth/authorization/issue receives
 * a non-empty `claims` payload when the client only used scopes.
 */
export function resolveClaimNamesForDecision(
  response: AuthorizationResponse
): string[] | undefined {
  if (response.claims != null) {
    if (response.claims.length > 0) {
      return response.claims;
    }
    // Authlete sent an explicit empty array — preserve prior addTxn-only behaviour.
    return [];
  }
  const fromParam = extractClaimNamesFromIdTokenClaimsJson(
    response.idTokenClaims
  );
  if (fromParam != null && fromParam.length > 0) {
    return fromParam;
  }
  return claimNamesFromAuthleteScopes(response.scopes);
}

/**
 * Adds 'txn' to the claim names array if claims are present
 * @param {string[] | undefined} claimNames - The original claim names array
 * @returns {string[] | undefined} Updated claim names array with 'txn' added if applicable
 */
const addTxnToClaimNames = (
  claimNames: string[] | undefined | null
): string[] | undefined => {
  if (!claimNames) {
    // if no claims were requested it can't be a connectid au request
    return undefined;
  }

  // txn will now be returned for any requests that request oidc claims
  return [...claimNames, 'txn'];
};

const normalizeClaimLocales = (
  claimLocales: string[] | undefined | null
): string[] | undefined => {
  if (!claimLocales || claimLocales.length === 0) {
    return undefined;
  }

  // From 5.2. Claims Languages and Scripts in OpenID Connect Core 1.0
  //
  //     However, since BCP47 language tag values are case insensitive,
  //     implementations SHOULD interpret the language tag values
  //     supplied in a case insensitive manner.
  //
  const lowerSet = new Set<string>();
  const list: string[] = [];

  claimLocales.forEach((claimLocale) => {
    claimLocale = claimLocale?.trim();
    // If the claim locale is empty.
    if (!claimLocale) {
      return;
    }

    // If the claim locale is a duplicate (case insensitive check).
    const lowerClaimLocale = claimLocale.toLowerCase();
    if (lowerSet.has(lowerClaimLocale)) {
      return;
    }

    lowerSet.add(lowerClaimLocale);
    list.push(claimLocale);
  });

  return list.length === 0 ? undefined : list;
};

/**
 * Default conversion function from AuthorizationResponse to AuthorizationDecisionParams
 * @param {AuthorizationResponse} response - The authorization response
 * @returns {AuthorizationDecisionParams} The authorization decision parameters
 */
export const defaultResponseToDecisionParams: ResponseToDecisionParams = (
  response
) => ({
  ticket: response.ticket!,
  claimNames: addTxnToClaimNames(resolveClaimNamesForDecision(response)),
  claimLocales: normalizeClaimLocales(response.claimsLocales),
  idTokenClaims: response.idTokenClaims,
  requestedClaimsForTx: response.requestedClaimsForTx,
  requestedVerifiedClaimsForTx: response.requestedVerifiedClaimsForTx,
});
