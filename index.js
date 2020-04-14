addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetches given url and returns a JSON of the response
 * @param {String} url 
 */
async function getURLs(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * Returns response from one of two variant urls.
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants';
  const json = await getURLs(url);
  const cookie = request.headers.get('cookie');

  // Divide groups into group one and group two
  const COOKIE = 'VARIANT'
  const ONE_VARIANT = json['variants'][0];
  const TWO_VARIANT = json['variants'][1];
  
  if (cookie && cookie.includes(`${COOKIE}=one`)) {
    return await fetch(ONE_VARIANT);
  } else if (cookie && cookie.includes(`${COOKIE}=two`)) {
    return await fetch(TWO_VARIANT);
  } else {
    // if no cookie then this is a new client, decide a group and set the cookie
    let group = Math.random() < 0.5 ? 'one' : 'two';
    let variant = await fetch(group === 'one' ? ONE_VARIANT: TWO_VARIANT);
    //make headers mutable
    variant = new Response(variant.body)
    variant.headers.append('Set-Cookie', `${COOKIE}=${group}; path=/`)
    return variant;
  }
}
