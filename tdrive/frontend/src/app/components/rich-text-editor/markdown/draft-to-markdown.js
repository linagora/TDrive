/* eslint-disable */
const TRAILING_WHITESPACE = /[ \u0020\t\n]*$/;

// This escapes some markdown but there's a few cases that are TODO -
// - List items
// - Back tics  (see https://github.com/Rosey/markdown-draft-js/issues/52#issuecomment-388458017)
// - Complex markdown, like links or images. Not sure it's even worth it, because if you're typing
// that into draft chances are you know its markdown and maybe expect it convert? :/
const MARKDOWN_STYLE_CHARACTERS = ['*', '_', '~', '`'];
const MARKDOWN_STYLE_CHARACTER_REGXP = /(\*|_|~|\\|`)/g;

// I hate this a bit, being outside of the function’s scope
// but can’t think of a better way to keep track of how many ordered list
// items were are on, as draft doesn’t explicitly tell us in the raw object 😢.
// This is a hash that will be assigned values based on depth, so like
// orderedListNumber[0] = 1 would mean that ordered list at depth 0 is on number 1.
// orderedListNumber[0] = 2 would mean that ordered list at depth 0 is on number 2.
// This is so we have the right number of numbers when doing a list, eg
// 1. Item One
// 2. Item two
// 3. Item three
// And so on.
var orderedListNumber = {},
    previousOrderedListDepth = 0;

// A map of draftjs block types -> markdown open and close characters
// Both the open and close methods must exist, even if they simply return an empty string.
// They should always return a string.
const StyleItems = {
  // BLOCK LEVEL
  'unordered-list-item': {
    open: function () {
      return '- ';
    },

    close: function () {
      return '';
    }
  },

  'ordered-list-item': {
    open: function (block, number = 1) {
      return `${number}. `;
    },

    close: function () {
      return '';
    }
  },

  'blockquote': {
    open: function () {
      return '> ';
    },

    close: function () {
      return '';
    }
  },

  'header-one': {
    open: function () {
      return '# ';
    },

    close: function () {
      return '';
    }
  },

  'header-two': {
    open: function () {
      return '## ';
    },

    close: function () {
      return '';
    }
  },

  'header-three': {
    open: function () {
      return '### ';
    },

    close: function () {
      return '';
    }
  },

  'header-four': {
    open: function () {
      return '#### ';
    },

    close: function () {
      return '';
    }
  },

  'header-five': {
    open: function () {
      return '##### ';
    },

    close: function () {
      return '';
    }
  },

  'header-six': {
    open: function () {
      return '###### ';
    },

    close: function () {
      return '';
    }
  },

  'code-block': {
    open: function (block) {
      return '```' + (block.data.language || '') + '\n';
    },

    close: function () {
      return '\n```';
    }
  },

  // INLINE LEVEL
  'BOLD': {
    open: function () {
      return '**';
    },

    close: function () {
      return '**';
    }
  },

  'ITALIC': {
    open: function () {
      return '_';
    },

    close: function () {
      return '_';
    }
  },

  'STRIKETHROUGH': {
    open: function () {
      return '~~';
    },

    close: function () {
      return '~~';
    }
  },

  'CODE': {
    open: function () {
      return '`';
    },

    close: function () {
      return '`';
    }
  }
};

// A map of draftjs entity types -> markdown open and close characters
// entities are different from block types because they have additional data attached to them.
// an entity object is passed in to both open and close, in case it's needed for string generation.
//
// Both the open and close methods must exist, even if they simply return an empty string.
// They should always return a string.
const EntityItems = {
  'LINK': {
    open: function (entity) {
      return '[';
    },

    close: function (entity) {
      return `](${entity.data.url || entity.data.href})`;
    }
  }
}

// Bit of a hack - we normally want a double newline after a block,
// but for list items we just want one (unless it's the _last_ list item in a group.)
const SingleNewlineAfterBlock = [
  'unordered-list-item',
  'ordered-list-item'
];

function isEmptyBlock(block) {
  return block.text.length === 0 && block.entityRanges.length === 0 && Object.keys(block.data || {}).length === 0;
}

/**
 * Generate markdown for a single block javascript object
 * DraftJS raw object contains an array of blocks, which is the main "structure"
 * of the text. Each block = a new line.
 *
 * @param {Object} block - block to generate markdown for
 * @param {Number} index - index of the block in the blocks array
 * @param {Object} rawDraftObject - entire raw draft object (needed for accessing the entityMap)
 * @param {Object} options - additional options passed in by the user calling this method.
 *
 * @return {String} markdown string
**/
function renderBlock(block, index, rawDraftObject, options) {
  var openInlineStyles = [],
      markdownToAdd = [];
  var markdownString = '',
      customStyleItems = options.styleItems || {},
      customEntityItems = options.entityItems || {},
      escapeMarkdownCharacters = options.hasOwnProperty('escapeMarkdownCharacters') ? options.escapeMarkdownCharacters : true;

  var type = block.type;

  var markdownStyleCharactersToEscape = [];

  // draft-js emits empty blocks that have type set… don’t style them unless the user wants to preserve new lines
  // (if newlines are preserved each empty line should be "styled" eg in case of blockquote we want to see a blockquote.)
  // but if newlines aren’t preserved then we'd end up having double or triple or etc markdown characters, which is a bug.
  if (isEmptyBlock(block) && !options.preserveNewlines) {
    type = 'unstyled';
  }

  // Render main block wrapping element
  if (customStyleItems[type] || StyleItems[type]) {
    if (type === 'unordered-list-item' || type === 'ordered-list-item') {
      markdownString += ' '.repeat(block.depth * 4);
    }

    if (type === 'ordered-list-item') {
      orderedListNumber[block.depth] = orderedListNumber[block.depth] || 1;
      markdownString += (customStyleItems[type] || StyleItems[type]).open(block, orderedListNumber[block.depth]);
      orderedListNumber[block.depth]++;

      // Have to reset the number for orderedListNumber if we are breaking out of a list so that if
      // there's another nested list at the same level further down, it starts at 1 again.
      // COMPLICATED 😭
      if (previousOrderedListDepth > block.depth) {
        orderedListNumber[previousOrderedListDepth] = 1;
      }

      previousOrderedListDepth = block.depth;
    } else {
      orderedListNumber = {};
      markdownString += (customStyleItems[type] || StyleItems[type]).open(block);
    }
  } else {
    orderedListNumber = {};
  }

  // A stack to keep track of open tags
  var openTags = [];

  function openTag(tag) {
    openTags.push(tag);

    if (tag.style) {
      // Open inline tag

      if (customStyleItems[tag.style] || StyleItems[tag.style]) {
        var styleToAdd = (
          customStyleItems[tag.style] || StyleItems[tag.style]
        ).open();
        markdownToAdd.push({
          type: 'style',
          style: tag,
          value: styleToAdd
        });
      }
    } else {
      // Open entity tag

      var entity = rawDraftObject.entityMap[tag.key];
      if (customEntityItems[entity.type] || EntityItems[entity.type]) {
        var entityToAdd = (
          customEntityItems[entity.type] || EntityItems[entity.type]
        ).open(entity, block);
        markdownToAdd.push({
          type: 'entity',
          value: entityToAdd
        });
      }
    }
  }

  function closeTag(tag) {
    const popped = openTags.pop();
    if (tag !== popped) {
      throw new Error(
        'Invariant violation: Cannot close a tag before all inner tags have been closed'
      );
    }

    if (tag.style) {
      // Close inline tag

      if (customStyleItems[tag.style] || StyleItems[tag.style]) {
        // Have to trim whitespace first and then re-add after because markdown can't handle leading/trailing whitespace
        var trailingWhitespace = TRAILING_WHITESPACE.exec(markdownString);
        markdownString = markdownString.slice(
          0,
          markdownString.length - trailingWhitespace[0].length
        );

        markdownString += (
          customStyleItems[tag.style] || StyleItems[tag.style]
        ).close();
        markdownString += trailingWhitespace[0];
      }
    } else {
      // Close entity tag

      var entity = rawDraftObject.entityMap[tag.key];
      if (customEntityItems[entity.type] || EntityItems[entity.type]) {
        markdownString += (
          customEntityItems[entity.type] || EntityItems[entity.type]
        ).close(entity, block);
      }
    }
  }

  const compareTagsLastCloseFirst = (a, b) =>
    b.offset + b.length - (a.offset + a.length);

  // reverse array without mutating the original
  const reverse = (array) => array.concat().reverse();

  // Render text within content, along with any inline styles/entities
  Array.from(block.text).some(function (character, characterIndex) {
    // Close any tags that need closing, starting from top of the stack
    reverse(openTags).forEach(function (tag) {
      if (tag.offset + tag.length === characterIndex) {
        // Take all tags stacked on top of the current one, meaning they opened after it.
        // Since they have not been popped, they'll close only later. So we need to split them.
        var tagsToSplit = openTags.slice(openTags.indexOf(tag) + 1);

        // Close in reverse order as they were opened
        reverse(tagsToSplit).forEach(closeTag);

        // Now we can close the current tag
        closeTag(tag);

        // Reopen split tags, ordered so that tags that close last open first
        tagsToSplit.sort(compareTagsLastCloseFirst).forEach(openTag);
      }
    });

    // Open any tags that need opening, using the correct nesting order.
    var inlineTagsToOpen = block.inlineStyleRanges.filter(
      (tag) => tag.offset === characterIndex
    );
    var entityTagsToOpen = block.entityRanges.filter(
      (tag) => tag.offset === characterIndex
    );
    inlineTagsToOpen
      .concat(entityTagsToOpen)
      .sort(compareTagsLastCloseFirst)
      .forEach(openTag);

    // These are all the opening entity and style types being added to the markdown string for this loop
    // we store in an array and add here because if the character is WS character, we want to hang onto it and not apply it until the next non-whitespace
    // character before adding the markdown, since markdown doesn’t play nice with leading whitespace (eg '** bold**' is no  good, whereas ' **bold**' is good.)
    if (character !== ' ' && markdownToAdd.length) {
      markdownString += markdownToAdd.map(function (item) {
        return item.value;
      }).join('');

      markdownToAdd = [];
    }

    if (block.type !== 'code-block' && escapeMarkdownCharacters) {
      let insideInlineCodeStyle = openTags.find((style) => style.style === 'CODE');

      if (insideInlineCodeStyle) {
        // Todo - The syntax to escape backtics when inside backtic code already is to use MORE backtics wrapping.
        // So we need to see how many backtics in a row we have and then when converting to markdown, use that # + 1

        // EG  ``Test ` Hllo ``
        // OR   ```Test `` Hello```
        // OR ````Test ``` Hello ````
        // Similar work has to be done for codeblocks.
      } else {
        // Special escape logic for blockquotes and heading characters
        if (characterIndex === 0 && character === '#' && block.text[1] && block.text[1] === ' ') {
          character = character.replace('#', '\\#');
        } else if (characterIndex === 0 && character === '>') {
          character = character.replace('>', '\\>');
        }

        // Escaping inline markdown characters
        // 🧹 If someone can think of a more elegant solution, I would love that.
        // orginally this was just a little char replace using a simple regular expression, but there’s lots of cases where
        // a markdown character does not actually get converted to markdown, like this case: http://google.com/i_am_a_link
        // so this code now tries to be smart and keeps track of potential “opening” characters as well as potential “closing”
        // characters, and only escapes if both opening and closing exist, and they have the correct whitepace-before-open, whitespace-or-end-of-string-after-close pattern
        if (MARKDOWN_STYLE_CHARACTERS.includes(character)) {
          let openingStyle = markdownStyleCharactersToEscape.find(function (item) {
            return item.character === character;
          });

          if (!openingStyle && block.text[characterIndex - 1] === ' ' && block.text[characterIndex + 1] !== ' ') {
            markdownStyleCharactersToEscape.push({
              character: character,
              index: characterIndex,
              markdownStringIndexStart: markdownString.length + character.length - 1,
              markdownStringIndexEnd: markdownString.length + character.length
            });
          } else if (openingStyle && block.text[characterIndex - 1] === character && characterIndex === openingStyle.index + 1) {
            openingStyle.markdownStringIndexEnd += 1;
          } else if (openingStyle) {
            let openingStyleLength = openingStyle.markdownStringIndexEnd - openingStyle.markdownStringIndexStart;
            let escapeCharacter = false;
            let popOpeningStyle = false;
            if (openingStyleLength === 1 && (block.text[characterIndex + 1] === ' ' || !block.text[characterIndex + 1])) {
              popOpeningStyle = true;
              escapeCharacter = true;
            }

            if (openingStyleLength === 2 && block.text[characterIndex + 1] === character) {
              escapeCharacter = true;
            }

            if (openingStyleLength === 2 && block.text[characterIndex - 1] === character && (block.text[characterIndex + 1] === ' ' || !block.text[characterIndex + 1])) {
              popOpeningStyle = true;
              escapeCharacter = true;
            }

            if (popOpeningStyle) {
              markdownStyleCharactersToEscape.splice(markdownStyleCharactersToEscape.indexOf(openingStyle), 1);
              let replacementString = markdownString.slice(openingStyle.markdownStringIndexStart, openingStyle.markdownStringIndexEnd);
              replacementString = replacementString.replace(MARKDOWN_STYLE_CHARACTER_REGXP, '\\$1');
              markdownString = (markdownString.slice(0, openingStyle.markdownStringIndexStart) + replacementString + markdownString.slice(openingStyle.markdownStringIndexEnd));
            }

            if (escapeCharacter) {
              character = `\\${character}`;
            }
          }
        }
      }
    }

    if (character === '\n' && type === 'blockquote') {
      markdownString += '\n> ';
    } else {
      markdownString += character;
    }
  });

  // Finally, close all remaining open tags
  reverse(openTags).forEach(closeTag);

  // Close block level item
  if (customStyleItems[type] || StyleItems[type]) {
    markdownString += (customStyleItems[type] || StyleItems[type]).close(block);
  }

  // Determine how many newlines to add - generally we want 2, but for list items we just want one when they are succeeded by another list item.
  if (SingleNewlineAfterBlock.indexOf(type) !== -1 && rawDraftObject.blocks[index + 1] && SingleNewlineAfterBlock.indexOf(rawDraftObject.blocks[index + 1].type) !== -1) {
    markdownString += '\n';
  } else if (rawDraftObject.blocks[index + 1]) {
    if (rawDraftObject.blocks[index].text) {
      if (SingleNewlineAfterBlock.indexOf(type) !== -1
          && SingleNewlineAfterBlock.indexOf(rawDraftObject.blocks[index + 1].type) === -1) {
        markdownString += '\n\n';
      } else if (!options.preserveNewlines) {
        // 2 newlines if not preserving
        markdownString += '\n\n';
      } else {
        markdownString += '\n';
      }
    } else if (options.preserveNewlines) {
      markdownString += '\n';
    }
  }

  return markdownString;
}

/**
 * Generate markdown for a raw draftjs object
 * DraftJS raw object contains an array of blocks, which is the main "structure"
 * of the text. Each block = a new line.
 *
 * @param {Object} rawDraftObject - draftjs object to generate markdown for
 * @param {Object} options - optional additional data, see readme for what options can be passed in.
 *
 * @return {String} markdown string
**/
function draftToMarkdown(rawDraftObject, options) {
  options = options || {};
  var markdownString = '';
  rawDraftObject.blocks.forEach(function (block, index) {
    markdownString += renderBlock(block, index, rawDraftObject, options);
  });

  orderedListNumber = {}; // See variable definitions at the top of the page to see why we have to do this sad hack.
  return markdownString;
}

export default draftToMarkdown;
