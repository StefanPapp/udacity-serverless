import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
const jwkToPem = require('jwk-to-pem')

const logger = createLogger('auth')

// URL that can be used to download a certificate that can be used
// to verify JWT token signature.
const jwksUrl = 'https://papp-udacity.eu.auth0.com/.well-known/jwks.json'
var pubKey

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', {"Auth1orizationToken": event.authorizationToken})
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', {"jwtToken": jwtToken})

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User is not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const pubKey = await getPublicKey(jwt.header.kid)

  logger.info('Verify JWT Token', {"jwtToken": jwt, "pubKey": pubKey})
  return verify(token, pubKey, {
    algorithms: ['RS256']
  }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  return split[1]
}

async function getPublicKey(kid): Promise<string> {
  if (pubKey)
    return pubKey;

  try {
    logger.info('Retrieve new auth0 certificate')

    const jwks = (await Axios.get(jwksUrl)).data
    pubKey = extractPublicKey(jwks.keys, kid)
    logger.info('Retrieved new Auth0 certificate', {"pubKey": pubKey})
    return pubKey;

  } catch (e) {
    throw new Error('Could not retrieve Auth0 certificate. ' + e)
  }
}

function extractPublicKey(jwks, kid) {
  try {
    return jwkToPem(jwks
        .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
            && key.kty === 'RSA' // We are only supporting RSA (RS256)
            && key.kid           // The `kid` must be present to be useful for later
            && key.kid === kid
            && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
        )[0])
  } catch (e) {
    throw new Error('Could not extract certificate from received JWKS. ' + e)
  }
}
