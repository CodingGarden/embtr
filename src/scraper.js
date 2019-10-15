const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

function getContent($, selector) {
  return $(`meta[property="og:${selector}"], meta[property="twitter:${selector}"]`).attr('content') || '';
}

async function scraper(pageUrl) {
  const { data } = await axios.get(pageUrl);
  const $ = cheerio.load(data);
  let title = getContent($, 'title');
  if (!title) {
    title = $('title').text() || '';
  }
  let description = $('meta[property="og:description"], meta[name="description"]').attr('content');
  if (!description) {
    // TODO: Extract a meaningful description from the web page
    // eslint-disable-next-line
    description = $('body').text().trim().substr(0, 100) + '...';
  }
  const keywords = $('meta[name="keywords"]').attr('content') || '';
  const type = getContent($, 'type');
  let image = getContent($, 'image');

  if (!image) {
    image = $('link[rel="shortcut icon"]').attr('href');
    if (image && !image.startsWith('http')) {
      const { protocol, hostname, path } = url.parse(pageUrl);
      // TODO: handle encoded images
      if (image.startsWith('/')) {
        image = `${protocol}//${hostname}${image}`;
      } else {
        image = `${protocol}//${hostname}${path}${image}`;
      }
    }
  }

  const ld_json = $('script[type="application/ld+json"]').html() || 'null';

  return {
    title,
    type,
    image,
    url: pageUrl,
    description,
    keywords,
    ld_json: JSON.parse(ld_json),
  };
}

module.exports = scraper;
