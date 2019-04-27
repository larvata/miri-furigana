/* global
chrome
kuromoji
HIRAGANA_SIZE_PERCENTAGE_KEY
HIRAGANA_SIZE_PERCENTAGE_DEFAULT
MIRI_EVENTS
*/

// button should only available in twitter scope
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'twitter.com',
          },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()],
    }]);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event } = request;
  if (event !== MIRI_EVENTS.INITIALIZED) {
    return false;
  }
  chrome.storage.sync.get(HIRAGANA_SIZE_PERCENTAGE_KEY, (result) => {
    sendResponse({
      pct: result[HIRAGANA_SIZE_PERCENTAGE_KEY] || HIRAGANA_SIZE_PERCENTAGE_DEFAULT,
    });
  });

  // indicate async callback
  return true;
});

kuromoji.builder({ dicPath: 'data/' }).build((error, tokenizer) => {
  if (error != null) {
    console.log(error);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { event, text } = request;
    if (event !== MIRI_EVENTS.REQUEST_TOKEN) {
      return false;
    }

    const result = tokenizer.tokenize(text);
    sendResponse(result);

    // indicate async callback
    return true;
  });
});
