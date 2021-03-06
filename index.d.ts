/// <reference types="node" />
import { Options as AppendOptions } from './append';
import { IOptions as DirOptions } from './dir';
import { IOptions as FileOptions } from './file';
import { IOptions as FindOptions } from './find';
import { Options as InspectTreeOptions } from './inspect_tree';
import { IWriteOptions } from './interfaces';
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
export declare const fs: (cwdPath?: string) => IJetpack;
export default fs;
