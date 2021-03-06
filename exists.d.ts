import { ENodeType } from './interfaces';
export declare function validateInput(methodName: string, path: string): void;
export declare function sync(path: string): boolean | string;
export declare function async(path: string): Promise<boolean | string | ENodeType>;
