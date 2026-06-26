export const copyTextToClipboard = async (textToCopy) => {
  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
  }
};