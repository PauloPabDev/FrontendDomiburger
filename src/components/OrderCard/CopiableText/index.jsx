import { useState } from 'react';
import './styles.css'
import { BiClipboard } from 'react-icons/bi';

const CopiableText = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000); // Resetear el estado después de 2 segundos
    } catch (err) {
    }
  };

  return (
    <div onClick={copyTextToClipboard} className={copied ? 'copied' : ''}>
      {text}
      <span className="copy-feedback"><BiClipboard /></span>
    </div>
  );
};

export default CopiableText;
