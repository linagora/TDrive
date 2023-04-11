/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Block,
  BlockActions,
  BlockContext,
  BlockDivider,
  BlockElementButton,
  BlockElementCheckboxes,
  BlockElementDatePicker,
  BlockElementImage,
  BlockElementMultiselectMenu,
  BlockElementOverflowMenus,
  BlockElementProgressBar,
  BlockElementRadioButtonInput,
  BlockElementSelectMenus,
  BlockIframe,
  BlockImage,
  BlockInput,
  BlockSection,
} from './types';

export const formatData = (
  object: any,
  content: any,
  flatted: Block[],
  level: number | null = null,
) => {
  for (let i = 0; i < object.length; i++) {
    const recursif =
      object[content] && typeof object[content] !== 'string' ? { ...object[content] } : null;

    delete object[content];
    flatted.push(object[i]);
    const currentLevel = level ? level + 1 : 1;
    if (recursif) {
      formatData(recursif, content, flatted, currentLevel);
    }
  }
};

export const blocksToTwacode = (event: Block[]) => {
  const blocks: any[] = [];

  event.forEach((obj: Block) => {
    let object = obj;

    switch (object.type) {
      case 'actions':
        object = object as BlockActions;
        for (let i = 0; i < object.elements.length; i++) {
          const element = object.elements[i];
          createTwacodeElements(element, blocks);
        }
        lineBreak(blocks);
        break;
      case 'context':
        object = object as BlockContext;
        for (let i = 0; i < object.elements.length; i++) {
          const element = object.elements[i];
          createTwacodeElements(element, blocks);
        }
        lineBreak(blocks);
        break;
      case 'divider':
        object = object as BlockDivider;
        blocks.push(blocks);
        break;
      case 'header':
        createTwacodeElements({ type: 'mrkdwn', text: `\n **${object.text.text}** \n` }, blocks);

        break;
      case 'image':
        object = object as BlockImage;
        createTwacodeElements(object, blocks, object.type);
        lineBreak(blocks);
        break;

      case 'input':
        object = object as BlockInput;
        createTwacodeElements(object, blocks);
        break;
      case 'section':
        object = object as BlockSection;
        if (object.text) {
          createTwacodeElements(object.text, blocks);
          lineBreak(blocks);
        }
        if (object.fields) {
          for (let i = 0; i < object.fields.length; i++) {
            const element = object.fields[i];
            createTwacodeElements(element, blocks);
            lineBreak(blocks);
          }
        }
        if (object.accessory) {
          const element = object.accessory;
          createTwacodeElements(element, blocks);
        }
        lineBreak(blocks);

        break;
      case 'iframe':
        object = object as BlockIframe;
        createTwacodeElements(
          {
            type: 'iframe',
            src: object.iframe_url,
            width: object.width,
            height: object.height,
          },
          blocks,
          object.type,
        );
        break;
      case 'twacode':
        blocks.push(object.elements);
        break;
      default:
      // TODO
    }
  });
  return blocks;
};

const createTwacodeElements = (object: any, blocks: any[], type?: any) => {
  switch (object.type) {
    case 'button':
      object = object as BlockElementButton;
      blocks.push({
        type: 'button',
        content:
          object.text.emoji === true
            ? { type: 'compile', content: object.text.text }
            : object.text.text,
        action_id: object.action_id,
        value: object.value,
        style: object.style ? object.style : 'default',
        url: object.url,
      });
      break;
    case 'checkboxes':
      object = object as BlockElementCheckboxes;
      blocks.push({ type: 'checkboxes' });
      break;
    case 'datepicker':
      object = object as BlockElementDatePicker;
      blocks.push({ type: 'datepicker' });
      break;
    case 'image':
      object = object as BlockElementImage;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      object.title
        ? blocks.push({
            type: 'system',
            content: {
              type: 'compile',
              content: object.title.text + '\n',
            },
          })
        : null;

      blocks.push({
        type: type === 'image' ? 'image' : 'icon',
        src: object.image_url,
      });
      break;
    case 'progress_bar':
      object = object as BlockElementProgressBar;
      blocks.push({
        type: 'compile',
        content: object.title + '\n',
      });
      blocks.push({
        type: 'progress_bar',
        value: object.value,
      });
      break;
    case 'multi_static_select':
      object = object as BlockElementMultiselectMenu;
      blocks.push(generateSelect(object));
      break;
    case 'overflow':
      object = object as BlockElementOverflowMenus;
      blocks.push(generateSelect(object));
      break;
    case 'input':
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      object.label.text
        ? createTwacodeElements(
            { type: 'mrkdwn', text: `**${object.label.text}** \n` },
            blocks,
            type,
          )
        : null;
      createTwacodeElements(object.element, blocks, type);

      break;
    case 'plain_text_input':
      if (object.readonly === true && object.copiable === true) {
        blocks.push({
          type: 'copiable',
          content: object.initial_value ? object.initial_value : '',
        });
      } else {
        blocks.push({
          type: 'input',
          placeholder: object.placeholder ? object.placeholder.text : null,
          passive_id: object.action_id,
        });
        lineBreak(blocks);
      }
      break;
    case 'radio_buttons':
      object = object as BlockElementRadioButtonInput;
      blocks.push(generateSelect(object));
      break;
    case 'static_select':
      object = object as BlockElementSelectMenus;
      blocks.push(generateSelect(object));
      break;
    case 'timepicker':
      //not implemented yet
      break;
    case 'context':
      if (object.elements[0].type === 'mrkdwn') {
        createTwacodeElements(object.elements[0], blocks);
      } else {
        createTwacodeElements(object.elements[0], blocks);
      }
      break;
    case 'mrkdwn':
      blocks.push({
        type: 'compile',
        content: object.text,
      });
      break;
    case 'plain_text':
      blocks.push({
        type: 'text',
        content: object.text,
      });
      break;
    default:
    // TODO
  }
};

const generateSelect = (object: any) => {
  return {
    type: 'select',
    //placeholder not yet implemented
    title: '',
    values: object.options.map((option: any) => {
      return { name: option.text.text, value: option.value };
    }),
    action_id: object.action_id,
  };
};

const lineBreak = (blocks: any[]) => {
  createTwacodeElements({ type: 'mrkdwn', text: '\n' }, blocks);
};
