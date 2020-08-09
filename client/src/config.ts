// using a Document DB in US-EAST-1
const apiId = 'bi72prtks7'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

// using AUTH0 async
export const authConfig = {
  domain: 'papp-udacity.eu.auth0.com',
  clientId: 'xgV50t0uPEI6sA8zQdPJKOwdO86B2lu9',   
  callbackUrl: 'http://localhost:3000/callback'
}
