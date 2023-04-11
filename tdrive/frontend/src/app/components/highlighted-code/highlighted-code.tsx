/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/railscasts.css'; //monokai-sublime
import { Copy } from 'react-feather';
import { Tooltip } from 'antd';
import { ToasterService } from 'app/features/global/services/toaster-service';

export default ({ code, className }: { code: string; className?: string }) => {
  let renderedCode = code.replace(/\t/g, '  ');

  const [expanded, setExpanded] = useState(renderedCode.split('\n').length < 5);
  const ref = React.createRef<any>();

  useEffect(() => {
    hljs.highlightElement(ref.current);
  }, [expanded]);

  renderedCode = renderedCode
    .split('\n')
    .slice(0, expanded ? 100000000 : 5)
    .join('\n');

  const copy = () => {
    navigator.clipboard.writeText(code).then(function () {
      ToasterService.success('Content copied!');
    });
  };

  return (
    <div className={className}>
      <pre>
        <code ref={ref}>{renderedCode}</code>
      </pre>
      {!expanded && (
        <span
          className="expander"
          onClick={() => {
            setExpanded(true);
          }}
        >
          Click to expand ({code.split('\n').length} lines)
        </span>
      )}
      <span className="copy" onClick={copy}>
        <Tooltip title={'Copy content'}>
          <Copy size={16} />
        </Tooltip>
      </span>
    </div>
  );
};
