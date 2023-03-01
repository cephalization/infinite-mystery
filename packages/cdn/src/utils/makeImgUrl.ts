/**
 * Given a string that may be a valid http url or a base64 encoded image, return a url
 * that an img tag can use in its src attribute
 *
 * @param url - string that may be a valid http url or a base64 encoded image
 */
export const makeImgUrl = (url: string) => {
  if (url.startsWith("http") || url.startsWith("/")) {
    return url;
  }

  return `data:image/png;base64,${url}`;
};
