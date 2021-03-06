import * as util from 'util';
import * as  pathUtil from 'path';
const Q = require('q');
import * as append from './append';
import { Options as AppendOptions } from './append';
import * as dir from './dir';
import { IOptions as DirOptions } from './dir';
import * as file from './file';
import { IOptions as FileOptions } from './file';
import * as find from './find';
import { IOptions as FindOptions } from './find';
import * as inspect from './inspect';
import * as inspectTree from './inspect_tree';
import { Options as InspectTreeOptions } from './inspect_tree';
import * as copy from './copy';
import * as exists from './exists';
import * as list from './list';
import * as move from './move';
import * as remove from './remove';
import * as rename from './rename';
import * as symlink from './symlink';
import * as streams from './streams';
import { IWriteOptions } from './interfaces';
import * as write from './write';
import * as read from './read';
import { ICopyOptions, INode, IInspectOptions } from './interfaces';
import { ReadWriteDataType, TCopyResult, ENodeType, TDeleteResult } from './interfaces';

export interface IJetpack {
	cwd(w?: any): IJetpack | string;
	path(): string;
	append(path: string, data: string | Buffer | Object, options?: AppendOptions): void;
	appendAsync(path: string, data: string | Buffer | Object, options?: AppendOptions): Promise<null>;
	copy(from: string, to: string, options?: ICopyOptions): void;
	copyAsync(from: string, to: string, options?: ICopyOptions): Promise<TCopyResult>;
	createWriteStream(path: string, options?: {
		flags?: string;
		encoding?: string;
		fd?: number;
		mode?: number;
		autoClose?: boolean;
		start?: number;
	}): any;
	createReadStream(path: string, options?: {
		flags?: string;
		encoding?: string;
		fd?: number;
		mode?: number;
		autoClose?: boolean;
		start?: number;
		end?: number;
	}): any;
	dir(path: string, criteria?: DirOptions): IJetpack;
	dirAsync(path: string, criteria?: DirOptions): Promise<IJetpack>;
	exists(path: string): boolean | string;
	existsAsync(path: string): Promise<boolean | string | ENodeType>;
	file(path: string, criteria?: FileOptions): void;
	fileAsync(path: string, criteria?: FileOptions): Promise<null>;
	find(startPath: string, options: FindOptions): string[];
	findAsync(startPath: string, options: FindOptions): Promise<string[]>;
	inspect(path: string, fieldsToInclude: IInspectOptions): INode;
	inspectAsync(path: string, fieldsToInclude: IInspectOptions): Promise<INode>;
	inspectTree(path: string, options?: InspectTreeOptions): INode;
	inspectTreeAsync(path: string, options?: InspectTreeOptions): Promise<INode>;
	list(path: string): string[];
	listAsync(path: string): Promise<string[]>;
	move(from: string, to: string): void;
	moveAsync(from: string, to: string): Promise<null>;
	read(path: string, returnAs?: string): ReadWriteDataType;
	readAsync(path: string, returnAs?: string): Promise<ReadWriteDataType>;
	remove(path: string): void;
	removeAsync(path: string): Promise<TDeleteResult>;
	rename(path: string, newName: string): void;
	renameAsync(path: string, newName: string): Promise<null>;
	symlink(symlinkValue: string, path: string): void;
	symlinkAsync(symlinkValue: string, path: string): Promise<void>;
	write(path: string, data: string | Buffer | Object, options?: IWriteOptions): void;
	writeAsync(path: string, data: string | Buffer | Object, options?: IWriteOptions): Promise<null>;
}
// The Jetpack Context object.
// It provides the public API, and resolves all paths regarding to
// passed cwdPath, or default process.cwd() if cwdPath was not specified.
export const fs = (cwdPath?: string): IJetpack => {
	const getCwdPath = function () {
		return cwdPath || process.cwd();
	};

	const cwd = function (w?: any): IJetpack | string {
		let args;
		let pathParts;

		// return current CWD if no arguments specified...
		if (arguments.length === 0) {
			return getCwdPath();
		}

		// ...create new CWD context otherwise
		args = Array.prototype.slice.call(arguments);
		pathParts = [getCwdPath()].concat(args);
		const res = fs(pathUtil.resolve.apply(null, pathParts));
		return res;
	};

	// resolves path to inner CWD path of this jetpack instance
	const resolvePath = function (path: string): string {
		return pathUtil.resolve(getCwdPath(), path);
	};

	const getPath = function (): string {
		// add CWD base path as first element of arguments array
		Array.prototype.unshift.call(arguments, getCwdPath());
		return pathUtil.resolve.apply(null, arguments);
	};

	const normalizeOptions = function (options: { cwd?: string }): any {
		return options || { cwd: getCwdPath() };
	};

	// API
	const api: IJetpack = {
		cwd: cwd,
		path: getPath,
		append: function (path: string, data: string | Buffer | Object, options?: AppendOptions): void {
			append.validateInput('append', path, data, options);
			append.sync(resolvePath(path), data, options);
		},
		appendAsync: function (path: string, data: string | Buffer | Object, options?: AppendOptions): Promise<null> {
			append.validateInput('appendAsync', path, data, options);
			return append.async(resolvePath(path), data, options);
		},

		copy: function (from: string, to: string, options?: ICopyOptions) {
			copy.validateInput('copy', from, to, options);
			copy.sync(resolvePath(from), resolvePath(to), options);
		},
		copyAsync: function (from: string, to: string, options?: ICopyOptions) {
			copy.validateInput('copyAsync', from, to, options);
			return copy.async(resolvePath(from), resolvePath(to), options);
		},
		createWriteStream: function (path: string, options?: {
			flags?: string;
			encoding?: string;
			fd?: number;
			mode?: number;
			autoClose?: boolean;
			start?: number;
		}) {
			return streams.createWriteStream(resolvePath(path), options);
		},
		createReadStream: function (path: string, options?: {
			flags?: string;
			encoding?: string;
			fd?: number;
			mode?: number;
			autoClose?: boolean;
			start?: number;
			end?: number;
		}) {
			return streams.createReadStream(resolvePath(path), options);
		},

		dir: function (path: string, criteria?: DirOptions): IJetpack {
			let normalizedPath;
			dir.validateInput('dir', path, criteria);
			normalizedPath = resolvePath(path);
			dir.sync(normalizedPath, criteria);
			return cwd(normalizedPath) as IJetpack;
		},
		dirAsync: function (path: string, criteria?: DirOptions): Promise<IJetpack> {
			const deferred = Q.defer();
			let normalizedPath: string;
			dir.validateInput('dirAsync', path, criteria);
			normalizedPath = resolvePath(path);
			dir.async(normalizedPath, criteria)
				.then(function () {
					deferred.resolve(cwd(normalizedPath));
				}, deferred.reject);
			return deferred.promise;
		},

		exists: function (path: string): boolean | string {
			exists.validateInput('exists', path);
			return exists.sync(resolvePath(path));
		},

		existsAsync: function (path: string): Promise<boolean | string | ENodeType> {
			exists.validateInput('existsAsync', path);
			return exists.async(resolvePath(path));
		},

		file: function (path: string, criteria?: FileOptions) {
			file.validateInput('file', path, criteria);
			file.sync(resolvePath(path), criteria);
			return this;
		},

		fileAsync: function (path: string, criteria?: FileOptions) {
			const deferred = Q.defer();
			const that = this;
			file.validateInput('fileAsync', path, criteria);
			file.async(resolvePath(path), criteria)
				.then(function () {
					deferred.resolve(that);
				}, deferred.reject);
			return deferred.promise;
		},

		find: function (startPath: string, options: FindOptions): string[] {
			// startPath is optional parameter, if not specified move rest of params
			// to proper places and default startPath to CWD.
			if (typeof options === 'undefined' && typeof startPath === 'object') {
				options = startPath;
				startPath = '.';
			}
			find.validateInput('find', startPath, options);
			return find.sync(resolvePath(startPath), normalizeOptions(options));
		},
		findAsync: function (startPath: string, options: FindOptions): Promise<string[]> {
			// startPath is optional parameter, if not specified move rest of params
			// to proper places and default startPath to CWD.
			if (typeof options === 'undefined' && typeof startPath === 'object') {
				options = startPath;
				startPath = '.';
			}
			find.validateInput('findAsync', startPath, options);
			return find.async(resolvePath(startPath), normalizeOptions(options));
		},

		inspect: function (path: string, fieldsToInclude: IInspectOptions) {
			inspect.validateInput('inspect', path, fieldsToInclude);
			return inspect.sync(resolvePath(path), fieldsToInclude);
		},
		inspectAsync: function (path: string, fieldsToInclude: IInspectOptions) {
			inspect.validateInput('inspectAsync', path, fieldsToInclude);
			return inspect.async(resolvePath(path), fieldsToInclude);
		},
		inspectTree: function (path: string, options?: InspectTreeOptions) {
			inspectTree.validateInput('inspectTree', path, options);
			return inspectTree.sync(resolvePath(path), options);
		},
		inspectTreeAsync: function (path: string, options?: InspectTreeOptions) {
			inspectTree.validateInput('inspectTreeAsync', path, options);
			return inspectTree.async(resolvePath(path), options);
		},

		list: function (path: string): string[] {
			list.validateInput('list', path);
			return list.sync(resolvePath(path || '.'));
		},
		listAsync: function (path: string): Promise<string[]> {
			list.validateInput('listAsync', path);
			return list.async(resolvePath(path || '.'));
		},

		move: function (from: string, to: string): void {
			move.validateInput('move', from, to);
			move.sync(resolvePath(from), resolvePath(to));
		},
		moveAsync: function (from: string, to: string): Promise<null> {
			move.validateInput('moveAsync', from, to);
			return move.async(resolvePath(from), resolvePath(to));
		},

		read: function (path: string, returnAs?: string) {
			read.validateInput('read', path, returnAs);
			return read.sync(resolvePath(path), returnAs);
		},
		readAsync: function (path: string, returnAs?: string): Promise<ReadWriteDataType> {
			read.validateInput('readAsync', path, returnAs);
			return read.async(resolvePath(path), returnAs);
		},

		remove: function (path: string): void {
			remove.validateInput('remove', path);
			// If path not specified defaults to CWD
			remove.sync(resolvePath(path || '.'));
		},
		removeAsync: function (path: string): Promise<TDeleteResult> {
			remove.validateInput('removeAsync', path);
			// If path not specified defaults to CWD
			return remove.async(resolvePath(path || '.'));
		},

		rename: function (path: string, newName: string): void {
			rename.validateInput('rename', path, newName);
			rename.sync(resolvePath(path), newName);
		},
		renameAsync: function (path: string, newName: string): Promise<null> {
			rename.validateInput('renameAsync', path, newName);
			return rename.async(resolvePath(path), newName);
		},

		symlink: function (symlinkValue: string, path: string): void {
			symlink.validateInput('symlink', symlinkValue, path);
			symlink.sync(symlinkValue, resolvePath(path));
		},
		symlinkAsync: function (symlinkValue: string, path: string): Promise<void> {
			symlink.validateInput('symlinkAsync', symlinkValue, path);
			return symlink.async(symlinkValue, resolvePath(path));
		},

		write: function (path: string, data: string | Buffer | Object, options?: IWriteOptions): void {
			write.validateInput('write', path, data, options);
			write.sync(resolvePath(path), data, options);
		},
		writeAsync: function (path: string, data: string | Buffer | Object, options?: IWriteOptions) {
			write.validateInput('writeAsync', path, data, options);
			return write.async(resolvePath(path), data, options);
		}
	};
	if ((util.inspect as any)['custom'] !== undefined) {
		// Without this console.log(jetpack) throws obscure error. Details:
		// https://github.com/szwacz/fs-jetpack/issues/29
		// https://nodejs.org/api/util.html#util_custom_inspection_functions_on_objects
		(api as any)[(util.inspect as any)['custom']] = function () {
			return getCwdPath();
		};
	}

	return api;
};

// tslint:disable-next-line:no-default-export
export default fs;
