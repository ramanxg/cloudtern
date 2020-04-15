addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

class ElementHandler {
  element(element) {
    // An incoming element, such as `div`
    if(element.tagName == "title" || element.getAttribute("id") == "title") {
      element.prepend("Raman's ")
    }
    if (element.getAttribute("id") == "description") {
      element.append("I changed some html to personalize it. I hope you like it!");
    }
    if (element.getAttribute('id') == "url") {
      element.setAttribute('href', 'https://ramanxg.github.io/Portfolio/');
      element.setInnerContent("Check out my website!");
    }
  }

  comments(comment) {
    // An incoming comment
  }

  text(text) {
    // An incoming piece of text
  }
}


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
  
  let response;
  if (cookie && cookie.includes(`${COOKIE}=one`)) {
    response = await fetch(ONE_VARIANT);
  } else if (cookie && cookie.includes(`${COOKIE}=two`)) {
    response = await fetch(TWO_VARIANT);
  } else {
    // if no cookie then this is a new client, decide a group and set the cookie
    let group = Math.random() < 0.5 ? 'one' : 'two';
    let variant = await fetch(group === 'one' ? ONE_VARIANT: TWO_VARIANT);
    //make headers mutable
    response = new Response(variant.body);
    response.headers.append('Set-Cookie', `${COOKIE}=${group}; path=/`);
  }

  return new HTMLRewriter().on('*', new ElementHandler()).transform(response);

}
