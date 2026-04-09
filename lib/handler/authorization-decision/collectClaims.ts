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

import { User } from '@vecrea/au3te-ts-common/schemas.common';

/**
 * Type definition for a function that collects claims from a user
 * @param {string[] | undefined | null} claimNames - Array of claim names to collect
 * @param {User | undefined | null} user - User object containing claim values
 * @returns {Record<string, unknown> | undefined} Object containing collected claims or undefined if no claims
 */
export type CollectClaims = (
  claimNames: string[] | undefined | null,
  user: User | undefined | null
) => Record<string, unknown> | undefined;

/**
 * Default implementation of claim collection
 * @param {string[] | undefined} claimNames - Array of claim names to collect
 * @param {User | undefined} user - User object containing claim values
 * @returns {Record<string, unknown> | undefined} Object containing collected claims or undefined if no claims
 */
export const defaultCollectClaims: CollectClaims = (claimNames, user) => {
  // If no claim is required
  if (!claimNames?.length) {
    return undefined;
  }

  // Object to store claim values
  const claims: Record<string, unknown> = {};

  // Process each requested claim
  claimNames.forEach((claimName) => {
    if (!claimName) {
      return;
    }

    // Split the claim name into name part and tag part
    const [name, tag] = claimName.split('#', 2);

    if (!name) {
      return;
    }

    // Get the claim value
    const value = getClaim(name, user);

    if (value === undefined) {
      return;
    }

    // Add the pair of claim name and claim value
    claims[tag ? `${name}#${tag}` : name] = value;
  });

  return Object.keys(claims).length > 0 ? claims : undefined;
};

/**
 * Gets a specific claim value from a user
 * @param {string} name - Name of the claim to retrieve
 * @param {User | undefined} user - User object containing claim values
 * @returns {unknown} The claim value, or undefined if not found
 */
export const getClaim = (
  name: string,
  user: User | undefined | null
): unknown => {
  if (name === 'txn') {
    return crypto.randomUUID();
  }

  if (name.startsWith(':')) {
    return 'placeholder';
  }

  if (!user) {
    return undefined;
  }

  if (name === 'sub') {
    return user.subject;
  }

  const camelCaseName = name.replace(/_([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );

  return user[camelCaseName as keyof User];
};
