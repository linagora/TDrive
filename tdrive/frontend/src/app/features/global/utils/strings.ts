/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString } from 'lodash';

export const getBase64 = (file: File): Promise<string> => {
  return new Promise((result, fail) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      result(`${reader.result}`);
    };
    reader.onerror = function (error) {
      fail(error);
    };
  });
};

export default class Strings {
  static verifyMail(email: string) {
    const re =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  static removeAccents(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static autoSpaces(element: any, separator: any, size: any, max: any) {
    if (element.textAreaRef) {
      element = element.textAreaRef;
    }

    if (!element) {
      return;
    }
    if (!separator) {
      separator = ' ';
    }
    if (!size) {
      size = 5;
    }
    if (!max) {
      size = (5 + 1) * 4;
    }
    return;
  }

  static convertBase(src: any, srctable: any, desttable: any) {
    const srclen = srctable.length;
    const destlen = desttable.length;
    // first convert to base 10
    let val = 0;
    const numlen = src.length;
    for (let i = 0; i < numlen; i++) {
      val = val * srclen + srctable.indexOf(src.charAt(i));
    }
    if (val < 0) {
      return 0;
    }
    // then covert to any base
    let r = val % destlen;
    let res = desttable.charAt(r);
    let q = Math.floor(val / destlen);
    while (q) {
      r = q % destlen;
      q = Math.floor(q / destlen);
      res = desttable.charAt(r) + res;
    }
    return res;
  }
}

export const matchQuery = (query: string, candidate: string) => {
  return query
    .split(' ')
    .every(
      word =>
        Strings.removeAccents(candidate)
          .toLocaleLowerCase()
          .indexOf(Strings.removeAccents(word).toLocaleLowerCase()) > -1,
    );
};

/**
 * The goal of this score is to get closest match for a query and candidates based of
 * not only number of valid words but also how close words are.
 *
 * Example:
 * query: "a flower"
 * candidates: "amazing flowers", "flower", "Flower A", "a flower", "a bus", "a"
 * The result should be in this order:
 * "a flower"
 * "Flower A"
 * "amazing flowers" ("a" and "flower" included but "a" is only 15% of amazing)
 * "flower" (a not included but flower 100% match)
 * "a" (flower not included but a 100% match)
 * "a bus" (a 100% match but parasite words)
 *
 * Idea:
 * 1. Any non letter nor number is a separator
 * 2. For each words in query we get the percentage of match + We add this percentages multiplied by the word size relative to query
 * 3. We reduce score for each parasite words by 90%
 * 4. We add a bonus for full match in the query 110%
 * query: "a flower", a represent 15% of the query, flower represent 85%
 * candidates computed:
 * "a flower" a=1*0.15 flower=1*0.85 parasite=0 => 1 => full match bonus => 1.1
 * "Flower A" a=1*0.15 flower=1*0.85 parasite=0 => 1
 * "amazing flower" (a is 15% of amazing) a=0.15*0.15 flower=1*0.85 parasite=0 => 0.87
 * "flower" a=0 flower=1*0.85 parasite=0 => 0.85
 * "a" a=1*0.15 flower=0 parasite=0 => 0.15
 * "a bus" a=1*0.15 flower=0 parasite=1 => 0.15*(0.9^1parasite) => 0.14
 */
export const distanceFromQuery = (
  candidates: string | string[],
  query: string,
  options?: { booster: number[] },
) => {
  let score = 0;
  let parasites = 0;

  if (isString(candidates)) {
    candidates = [candidates];
  }

  //Step 1
  Strings.removeAccents(query)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/gm, ' ')
    .split(' ')

    //Step 2
    .forEach(queryWord => {
      const queryWordImportance = queryWord.length / query.replace(/ /gm, '').length;
      let i = 0;

      for (const candidate of candidates) {
        const boost = options?.booster[i] || 1;
        i++;
        Strings.removeAccents(candidate)
          .toLocaleLowerCase()
          .replace(/[^a-z0-9]/gm, ' ')
          .split(' ')
          .map(sanitizedField => {
            if (sanitizedField?.trim()) {
              const match =
                (sanitizedField.length - sanitizedField.replace(queryWord, '').length) /
                sanitizedField.length;
              if (match === 0) {
                parasites += 1;
              } else {
                let prefixBoost = 1;
                if (sanitizedField.indexOf(queryWord) === 0) {
                  prefixBoost = 2;
                }
                score += match * queryWordImportance * boost * prefixBoost;
              }
            }
          });
      }
    });

  //Step 3
  score *= Math.pow(0.9, parasites);

  //Step 4
  const candidateSanitized = Strings.removeAccents(candidates.join(' '))
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/gm, ' ');
  if (
    candidateSanitized.replace(/ /gm, '').replace(query, '').length !==
    candidateSanitized.replace(/ /gm, '').length
  )
    score *= 1.1;

  return 0 - score;
};
