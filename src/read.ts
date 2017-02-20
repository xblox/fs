import { readFile, readFileSync } from 'fs';
import * as Q from 'q';
import { json, file } from './imports';
import { validateArgument } from './utils/validate';
const supportedReturnAs = ['utf8', 'buffer', 'json', 'jsonWithDates'];
const promisedReadFile = Q.denodeify(readFile);
export function validateInput(methodName: string, path: string, returnAs: string) {
  const methodSignature = methodName + '(path, returnAs)';
  validateArgument(methodSignature, 'path', path, ['string']);
  validateArgument(methodSignature, 'returnAs', returnAs, ['string', 'undefined']);
  if (returnAs && supportedReturnAs.indexOf(returnAs) === -1) {
    throw new Error('Argument "returnAs" passed to ' + methodSignature
      + ' must have one of values: ' + supportedReturnAs.join(', '));
  }
};

// Matches strings generated by Date.toJSON()
// which is called to serialize date to JSON.
const jsonDateParser = (key: string, value: string | Date): Date => {
  const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
  if (typeof value === 'string') {
    if (reISO.exec(value)) {
      return new Date(value);
    }
  }
  return value as Date;
};

const ErrJson = (path: string, err: Error): Error => {
  const nicerError: any = new Error('JSON parsing failed while reading '
    + path + ' [' + err + ']');
  nicerError.originalError = err;
  return nicerError;
};

// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------
export function sync(path: string, returnAs?: string): string | Buffer | Object {
  const retAs = returnAs || 'utf8';
  let data;
  try {
    data = readFileSync(path, { encoding: retAs === 'buffer' ? null : 'utf8' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If file doesn't exist return undefined instead of throwing.
      return undefined;
    }
    // Otherwise rethrow the error
    throw err;
  }

  try {
    if (retAs === 'json') {
      data = json.parse(data);
    } else if (retAs === 'jsonWithDates') {
      data = json.parse(data, jsonDateParser);
    }
  } catch (err) {
    throw ErrJson(path, err);
  }

  return data;
};

// ---------------------------------------------------------
// ASYNC
// ---------------------------------------------------------
export function async(path: string, returnAs?: string): Promise<string | Buffer | Object> {
  return new Promise((resolve, reject) => {
    const retAs = returnAs || 'utf8';
    promisedReadFile(path, { encoding: retAs === 'buffer' ? null : 'utf8' })
      .then(data => {
        // Make final parsing of the data before returning.
        try {
          if (retAs === 'json') {
            resolve(json.parse(data));
          } else if (retAs === 'jsonWithDates') {
            resolve(json.parse(data, jsonDateParser));
          } else {
            resolve(data);
          }
        } catch (err) {
          reject(ErrJson(path, err));
        }
      })
      .catch(err => (err.code === 'ENOENT' ? resolve(undefined) : reject(err)));
  });
};
