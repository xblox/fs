import * as  pathUtil from "path";
import * as fs from 'fs';
import * as Q from 'q';
import { Opts, sync as mkdirp } from 'mkdirp';
import { async as existsAsync, sync as existsSync } from './exists';
import { argument, options } from './utils/validate';

export function validateInput(methodName: string, from: string, to: string) {
  const methodSignature: string = methodName + '(from, to)';
  argument(methodSignature, 'from', from, ['string']);
  argument(methodSignature, 'to', to, ['string']);
};

function generateSourceDoesntExistError(path): Error {
  const err = new Error("Path to move doesn't exist " + path);
  err['code'] = 'ENOENT';
  return err;
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

export function sync(from, to) {
  try {
    fs.renameSync(from, to);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // We can't make sense of this error. Rethrow it.
      throw err;
    } else {
      // Ok, source or destination path doesn't exist.
      // Must do more investigation.
      if (!existsSync(from)) {
        throw generateSourceDoesntExistError(from);
      }
      if (!existsSync(to)) {
        // Some parent directory doesn't exist. Create it.
        mkdirp(pathUtil.dirname(to));
        // Retry the attempt
        fs.renameSync(from, to);
      }
    }
  }
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

var promisedRename = Q.denodeify(fs.rename);
var promisedMkdirp = Q.denodeify(mkdirp);

function ensureDestinationPathExistsAsync(to: string) {
  return new Promise((resolve, reject) => {
    let destDir: string = pathUtil.dirname(to);
    existsAsync(destDir)
      .then(dstExists => {
        if (!dstExists) {
          promisedMkdirp(destDir)
            .then(resolve, reject);
        } else {
          // Hah, no idea.
          reject();
        }
      })
      .catch(reject);
  });
};

export function async(from: string, to: string) {
  return new Promise((resolve, reject) => {
    promisedRename(from, to)
      .then(resolve)
      .catch(err => {
        if (err.code !== 'ENOENT') {
          // Something unknown. Rethrow original error.
          reject(err);
        } else {
          // Ok, source or destination path doesn't exist.
          // Must do more investigation.
          existsAsync(from)
            .then(srcExists => {
              if (!srcExists) {
                reject(generateSourceDoesntExistError(from));
              } else {
                ensureDestinationPathExistsAsync(to)
                  .then(() => {
                    // Retry the attempt
                    return promisedRename(from, to);
                  })
                  .then(resolve, reject);
              }
            })
            .catch(reject);
        }
      });

  });
};